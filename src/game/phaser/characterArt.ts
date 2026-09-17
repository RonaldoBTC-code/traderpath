import Phaser from "phaser";

/**
 * Shared cartoon character art for every world scene.
 * One implementation so the Explorador and NPCs look the same in all rooms.
 */

export const CHARACTER_INK = 0x1e2a44;

// ─── Blender-rendered sprites (2.5D pipeline) ───────────────────────────────
// Art lives in public/assets/sprites/ (see renders/README.md). Each colour has
// two files:
//
//   explorer_walk[_i].webp  animated sheet (EXPLORER_SHEET layout)
//   explorer[_i].webp       single static pose, used only if the sheet is missing
//
// and when neither loads the scenes draw the vector body below, so the world
// keeps working whatever subset of the art exists. A static sprite drawn by
// hand (renders/assets/sprites/explorer.png) wins over the generated sheet:
// build_explorer.py and `npm run art` both drop the sheet in that case.

export const EXPLORER_SPRITE_KEY = "explorer-sprite";
export const EXPLORER_SPRITE_PATH = "/assets/sprites/explorer.webp";

/**
 * Walk sheet layout — a contract with renders/blender/build_explorer.py
 * (SHEET_* constants). Rows are directions, column 0 is the idle pose and
 * columns 1..walkFrames are the walk cycle. Left-facing views are not in the
 * sheet: the side row (and the diagonals of down/up) are mirrored with flipX,
 * which is exact because the model is symmetric.
 */
export const EXPLORER_SHEET = {
  frameWidth: 192,
  frameHeight: 240,
  columns: 9,
  walkFrames: 8,
  frameRate: 12,
  rows: { down: 0, side: 1, up: 2 },
} as const;

export type ExplorerDirection = keyof typeof EXPLORER_SHEET.rows;

/**
 * Game registry key holding the avatar colour chosen before the scene started.
 * createAcademyGame sets it so preload() fetches only that colour's sheet
 * instead of all six (~140 KB each).
 */
export const AVATAR_COLOR_REGISTRY_KEY = "avatar-color";

/**
 * Avatar colour variants rendered by renders/blender/build_explorer.py,
 * or hand-made and published with `npm run art` (renders/assets/sprites/).
 *
 * Order matters: index i is the art rendered to explorer_walk_{i}.webp and
 * explorer_{i}.webp, so this must stay in sync with AVATAR_COLORS in
 * components/world/AcademyWorld.tsx. It is duplicated rather than imported so
 * Phaser code pulls in no React modules; the same duplication exists on the
 * Blender side (AVATAR_HEXES).
 *
 * The base art (explorer_walk.webp / explorer.webp, tp-gold #E5960A) is not one
 * of these five: it is the fallback when a colour's own art is missing.
 */
export const EXPLORER_VARIANT_HEXES = [
  "#F0C040",
  "#38BDF8",
  "#22C55E",
  "#F97316",
  "#D946EF",
] as const;

export const explorerVariantKey = (index: number) => `explorer-sprite-${index}`;

/** Index of a colour within the variant list, or -1 when it isn't one of them. */
export function explorerVariantIndex(color: string): number {
  const target = color.trim().toLowerCase();
  return EXPLORER_VARIANT_HEXES.findIndex((hex) => hex.toLowerCase() === target);
}

type Variant = number | "base";

interface ArtEntry {
  key: string;
  path: string;
  sheet: boolean;
}

function variantArt(variant: Variant): ArtEntry[] {
  if (variant === "base") {
    return [
      { key: "explorer-walk", path: "/assets/sprites/explorer_walk.webp", sheet: true },
      { key: EXPLORER_SPRITE_KEY, path: EXPLORER_SPRITE_PATH, sheet: false },
    ];
  }
  return [
    { key: `explorer-walk-${variant}`, path: `/assets/sprites/explorer_walk_${variant}.webp`, sheet: true },
    { key: explorerVariantKey(variant), path: `/assets/sprites/explorer_${variant}.webp`, sheet: false },
  ];
}

/** Try order for a colour: its sheet, its static pose, then the base pair. */
function artChain(variant: Variant): ArtEntry[] {
  return variant === "base" ? variantArt("base") : [...variantArt(variant), ...variantArt("base")];
}

function variantFor(color?: string | null): Variant {
  const index = color ? explorerVariantIndex(color) : -1;
  return index >= 0 ? index : "base";
}

/**
 * Keys that already failed to load in this page. Assets don't appear mid
 * session (a reload picks up new art), so a miss is remembered to avoid
 * re-requesting a 404 on every colour change or room switch.
 */
const failedArt = new Set<string>();

/** Which colour chain a queued file belongs to, so an error knows what to try next. */
const queuedVariant = new Map<string, Variant>();

/** The best art already loaded for a colour, or undefined (→ vector body). */
function resolveArt(scene: Phaser.Scene, variant: Variant): ArtEntry | undefined {
  return artChain(variant).find((entry) => scene.textures.exists(entry.key));
}

/**
 * Next file worth requesting: the first entry of the chain that is neither
 * loaded nor known to be missing — unless something earlier in the chain is
 * already loaded, in which case nothing better can be fetched.
 */
function nextArtToLoad(scene: Phaser.Scene, variant: Variant): ArtEntry | undefined {
  for (const entry of artChain(variant)) {
    if (scene.textures.exists(entry.key)) return undefined;
    if (!failedArt.has(entry.key)) return entry;
  }
  return undefined;
}

/**
 * Queue the next art file for a colour. On a load error the watcher marks it
 * failed and calls this again, walking down the chain one file at a time so
 * the fallbacks are only downloaded when actually needed.
 */
function queueArt(scene: Phaser.Scene, variant: Variant): boolean {
  const entry = nextArtToLoad(scene, variant);
  if (!entry) return false;
  if (entry.sheet) {
    scene.load.spritesheet(entry.key, entry.path, {
      frameWidth: EXPLORER_SHEET.frameWidth,
      frameHeight: EXPLORER_SHEET.frameHeight,
    });
  } else {
    scene.load.image(entry.key, entry.path);
  }
  queuedVariant.set(entry.key, variant);
  return true;
}

/**
 * One loader listener per scene: a missing file is expected (the artist may not
 * have produced it yet), so it is recorded and the next fallback is queued.
 * Phaser accepts files added while it is loading.
 */
function watchArtErrors(scene: Phaser.Scene) {
  const onError = (file: { key?: string }) => {
    const key = file?.key;
    if (!key || !queuedVariant.has(key)) return;
    failedArt.add(key);
    const variant = queuedVariant.get(key) as Variant;
    queuedVariant.delete(key);
    queueArt(scene, variant);
  };
  scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onError);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onError);
  });
}

/** Queue the explorer art in a scene's preload(): only the chosen colour. */
export function preloadExplorerSprite(scene: Phaser.Scene) {
  watchArtErrors(scene);
  queueArt(scene, variantFor(scene.registry.get(AVATAR_COLOR_REGISTRY_KEY)));
}

function walkAnimKey(textureKey: string, direction: ExplorerDirection) {
  return `${textureKey}:walk-${direction}`;
}

function idleFrame(direction: ExplorerDirection) {
  return EXPLORER_SHEET.rows[direction] * EXPLORER_SHEET.columns;
}

/** Walk animations live in the game-wide manager: created once per sheet. */
function ensureWalkAnims(scene: Phaser.Scene, textureKey: string) {
  for (const direction of Object.keys(EXPLORER_SHEET.rows) as ExplorerDirection[]) {
    const key = walkAnimKey(textureKey, direction);
    if (scene.anims.exists(key)) continue;
    const start = idleFrame(direction) + 1;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(textureKey, {
        start,
        end: start + EXPLORER_SHEET.walkFrames - 1,
      }),
      frameRate: EXPLORER_SHEET.frameRate,
      repeat: -1,
    });
  }
}

/**
 * The player avatar as the world scenes use it: an animated sheet, a static
 * sprite, or the vector drawing. Exactly one of `sprite`/`body` is set, which
 * is what lets colour changes know which path to take.
 */
export interface ExplorerAvatar {
  /** Display object to add to the scene's player container. */
  object: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics;
  sprite?: Phaser.GameObjects.Sprite;
  body?: Phaser.GameObjects.Graphics;
  /** Sprite height in px, kept so texture swaps can re-apply it. */
  height: number;
  /** Current art has a walk cycle (false for a static pose or the vector). */
  animated: boolean;
  direction: ExplorerDirection;
  flipped: boolean;
  walking: boolean;
  /** Last colour requested; a slow load for an older pick must not win. */
  color?: string;
}

export interface ExplorerAvatarOptions {
  /**
   * Sprite offset inside the player container. Ignored by the vector fallback,
   * whose geometry is already positioned around the container origin.
   */
  x?: number;
  y?: number;
  /** Rendered sprite height in px. Each scene passes its own. */
  height: number;
  /** Colour for the vector fallback, used until a selection arrives. */
  fallbackColor: number;
}

/** Build the avatar with the best art already loaded for the chosen colour. */
export function createExplorerAvatar(
  scene: Phaser.Scene,
  options: ExplorerAvatarOptions,
): ExplorerAvatar {
  const { x = 0, y = 0, height, fallbackColor } = options;
  const color = scene.registry.get(AVATAR_COLOR_REGISTRY_KEY) as string | undefined;
  const art = resolveArt(scene, variantFor(color));
  const state = { height, direction: "down" as ExplorerDirection, flipped: false, walking: false, color };
  if (art) {
    const sprite = scene.add.sprite(x, y, art.key, art.sheet ? idleFrame("down") : undefined);
    const avatar: ExplorerAvatar = { object: sprite, sprite, animated: art.sheet, ...state };
    if (art.sheet) ensureWalkAnims(scene, art.key);
    sizeExplorerSprite(sprite, height);
    return avatar;
  }
  const body = scene.add.graphics();
  drawExplorerBody(body, color ? Phaser.Display.Color.HexStringToColor(color).color : fallbackColor);
  return { object: body, body, animated: false, ...state };
}

/** Re-apply texture, frame, flip and animation from the avatar's state. */
function refreshSprite(scene: Phaser.Scene, avatar: ExplorerAvatar, art: ArtEntry) {
  const sprite = avatar.sprite;
  if (!sprite) return;
  avatar.animated = art.sheet;
  if (art.sheet) {
    ensureWalkAnims(scene, art.key);
    if (avatar.walking) {
      sprite.play(walkAnimKey(art.key, avatar.direction), true);
    } else {
      sprite.stop();
      sprite.setTexture(art.key, idleFrame(avatar.direction));
    }
  } else {
    sprite.stop();
    sprite.setTexture(art.key);
  }
  // A static pose only has one (right-facing 3/4) view, so it can only mirror
  // for left; a sheet mirrors side and the down/up diagonals.
  sprite.setFlipX(avatar.flipped);
  sizeExplorerSprite(sprite, avatar.height);
}

/**
 * Apply a selector colour. If its art isn't loaded yet it is fetched first and
 * the avatar keeps its current look meanwhile; a vector avatar just redraws.
 */
export function setExplorerAvatarColor(
  scene: Phaser.Scene,
  avatar: ExplorerAvatar | undefined,
  color: string,
) {
  if (!avatar) return;
  avatar.color = color;
  if (avatar.body) {
    drawExplorerBody(avatar.body, Phaser.Display.Color.HexStringToColor(color).color);
    return;
  }
  const variant = variantFor(color);
  const apply = () => {
    // Scene gone, or the player picked another colour while this one loaded.
    if (!avatar.sprite?.scene || avatar.color !== color) return;
    const art = resolveArt(scene, variant);
    if (art) refreshSprite(scene, avatar, art);
  };
  if (!queueArt(scene, variant)) {
    apply();
    return;
  }
  scene.load.once(Phaser.Loader.Events.COMPLETE, apply);
  if (!scene.load.isLoading()) scene.load.start();
}

/**
 * Start (or keep) walking towards a screen-space direction.
 *
 * Only the avatar flips. Scenes must NOT scale the player container to turn the
 * character: the container also holds the name label and the ground shadow, so
 * a negative scaleX renders "Explorador" backwards.
 */
export function walkExplorerAvatar(avatar: ExplorerAvatar | undefined, dx: number, dy: number) {
  if (!avatar) return;
  const length = Math.hypot(dx, dy);
  if (length >= 1) {
    // Diagonals use the down/up rows: they are rendered turned 30° already, so
    // a 45° heading reads better there than as a sideways profile.
    avatar.direction = Math.abs(dx) > Math.abs(dy) * SIDE_RATIO ? "side" : dy > 0 ? "down" : "up";
    // A near-vertical heading keeps the previous flip instead of snapping.
    if (Math.abs(dx) > length * FLIP_MIN_SHARE) avatar.flipped = dx < 0;
  }
  avatar.walking = true;

  if (avatar.body) {
    avatar.body.scaleX = avatar.flipped ? -1 : 1;
    return;
  }
  const sprite = avatar.sprite;
  if (!sprite) return;
  // setFlipX, not a negative scaleX: the sprite's scale carries its display
  // size, so flipping the scale would fight sizeExplorerSprite.
  sprite.setFlipX(avatar.flipped);
  if (avatar.animated) {
    sprite.play(walkAnimKey(sprite.texture.key, avatar.direction), true);
  }
}

/** Horizontal must beat vertical by this much before the profile row is used. */
const SIDE_RATIO = 1.2;
/** Share of the heading that must be horizontal before the avatar mirrors. */
const FLIP_MIN_SHARE = 0.25;

/** Stop on the idle pose of the last direction walked. */
export function stopExplorerAvatar(avatar: ExplorerAvatar | undefined) {
  if (!avatar) return;
  avatar.walking = false;
  const sprite = avatar.sprite;
  if (!sprite || !avatar.animated) return;
  sprite.stop();
  sprite.setFrame(idleFrame(avatar.direction));
}

function sizeExplorerSprite(sprite: Phaser.GameObjects.Sprite, height: number) {
  sprite.setDisplaySize((sprite.width / sprite.height) * height, height);
}

/** Player avatar: chunky cartoon explorer with cap, face and backpack strap. */
export function drawExplorerBody(g: Phaser.GameObjects.Graphics, color: number) {
  const dark = CHARACTER_INK;
  g.clear();
  // Legs
  g.fillStyle(dark, 1);
  g.fillRoundedRect(-22, 28, 17, 25, 8);
  g.fillRoundedRect(5, 28, 17, 25, 8);
  // Body in the player's chosen color, chunky white outline
  g.fillStyle(color, 1);
  g.fillRoundedRect(-32, -14, 64, 60, 24);
  g.lineStyle(4, 0xffffff, 0.9);
  g.strokeRoundedRect(-32, -14, 64, 60, 24);
  // Backpack strap
  g.fillStyle(0xffffff, 0.55);
  g.fillRoundedRect(-6, -12, 12, 56, 6);
  // Head
  g.fillStyle(0xffd4ad, 1);
  g.fillCircle(0, -34, 32);
  g.lineStyle(3, dark, 0.9);
  g.strokeCircle(0, -34, 32);
  // Cap in body color with brim
  g.fillStyle(color, 1);
  g.fillRoundedRect(-29, -60, 58, 22, 11);
  g.fillRoundedRect(-36, -46, 24, 8, 4);
  g.lineStyle(2, dark, 0.6);
  g.strokeRoundedRect(-29, -60, 58, 22, 11);
  // Eyes with glints
  g.fillStyle(dark, 1);
  g.fillCircle(-11, -33, 4.5);
  g.fillCircle(11, -33, 4.5);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(-9.8, -34.5, 1.6);
  g.fillCircle(12.2, -34.5, 1.6);
  // Blush
  g.fillStyle(0xf5a97f, 0.75);
  g.fillEllipse(-20, -25, 8, 5);
  g.fillEllipse(20, -25, 8, 5);
  // Smile
  g.lineStyle(3, dark, 1);
  g.beginPath();
  g.arc(0, -26, 9, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(150));
  g.strokePath();
}

export interface VillagerLook {
  outfit: number;
  skin: number;
  hair: number;
}

/** NPC villager: same friendly proportions with outfit/skin/hair variants. */
export function drawVillagerBody(g: Phaser.GameObjects.Graphics, look: VillagerLook) {
  const dark = CHARACTER_INK;
  g.clear();
  // Body
  g.fillStyle(look.outfit, 1);
  g.fillRoundedRect(-31, -10, 62, 58, 22);
  g.lineStyle(4, 0xffffff, 0.85);
  g.strokeRoundedRect(-31, -10, 62, 58, 22);
  // Apron detail
  g.fillStyle(0xffffff, 0.4);
  g.fillRoundedRect(-14, 4, 28, 34, 10);
  // Head
  g.fillStyle(look.skin, 1);
  g.fillCircle(0, -30, 31);
  g.lineStyle(3, dark, 0.9);
  g.strokeCircle(0, -30, 31);
  // Hair
  g.fillStyle(look.hair, 1);
  g.fillRoundedRect(-28, -55, 56, 23, 12);
  g.lineStyle(2, dark, 0.5);
  g.strokeRoundedRect(-28, -55, 56, 23, 12);
  // Eyes with glints
  g.fillStyle(dark, 1);
  g.fillCircle(-11, -30, 4.5);
  g.fillCircle(11, -30, 4.5);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(-9.8, -31.5, 1.6);
  g.fillCircle(12.2, -31.5, 1.6);
  // Blush
  g.fillStyle(0xf5a97f, 0.7);
  g.fillEllipse(-19, -22, 8, 5);
  g.fillEllipse(19, -22, 8, 5);
  // Smile
  g.lineStyle(3, dark, 1);
  g.beginPath();
  g.arc(0, -23, 8, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(150));
  g.strokePath();
}

/** ARIA the guide: friendly rounded white robot with antenna and chest light. */
export function drawAriaBody(g: Phaser.GameObjects.Graphics) {
  const dark = CHARACTER_INK;
  g.clear();
  // Rounded white robot body with blue trim
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(-26, -8, 52, 54, 20);
  g.lineStyle(3, 0x2563eb, 1);
  g.strokeRoundedRect(-26, -8, 52, 54, 20);
  g.fillStyle(0x60a5fa, 1);
  g.fillCircle(0, 16, 7);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(0, 16, 3);
  // Head
  g.fillStyle(0xffffff, 1);
  g.fillCircle(0, -30, 32);
  g.lineStyle(3, 0x2563eb, 1);
  g.strokeCircle(0, -30, 32);
  // Antenna with bobble
  g.lineStyle(3, 0x2563eb, 1);
  g.lineBetween(0, -62, 0, -70);
  g.fillStyle(0x60a5fa, 1);
  g.fillCircle(0, -74, 5);
  // Big dark eyes with white glints
  g.fillStyle(dark, 1);
  g.fillCircle(-11, -32, 6);
  g.fillCircle(11, -32, 6);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(-9.5, -34, 2);
  g.fillCircle(12.5, -34, 2);
  // Blush
  g.fillStyle(0x93c5fd, 0.8);
  g.fillEllipse(-20, -22, 8, 5);
  g.fillEllipse(20, -22, 8, 5);
  // Smile
  g.lineStyle(3, dark, 1);
  g.beginPath();
  g.arc(0, -22, 9, Phaser.Math.DegToRad(25), Phaser.Math.DegToRad(155));
  g.strokePath();
}
