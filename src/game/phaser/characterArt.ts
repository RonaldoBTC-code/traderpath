import Phaser from "phaser";

/**
 * Shared cartoon character art for every world scene.
 * One implementation so the Explorador and NPCs look the same in all rooms.
 */

export const CHARACTER_INK = 0x1e2a44;

// ─── Blender-rendered sprites (2.5D pipeline) ───────────────────────────────
// Pre-rendered WebPs live in public/assets/sprites/ (see renders/README.md).
// When a sprite texture is present we use it; otherwise scenes fall back to the
// vector drawing below, so the world keeps working before any render exists.

export const EXPLORER_SPRITE_KEY = "explorer-sprite";
export const EXPLORER_SPRITE_PATH = "/assets/sprites/explorer.webp";

/**
 * Avatar colour variants rendered by renders/blender/build_explorer.py (Fase 2),
 * or hand-made and published with `npm run art` (renders/assets/sprites/).
 *
 * Order matters: index i is the sprite rendered to explorer_{i}.webp, so this
 * must stay in sync with AVATAR_COLORS in components/world/AcademyWorld.tsx.
 * It is duplicated rather than imported so Phaser code pulls in no React
 * modules; the same duplication exists on the Blender side (AVATAR_HEXES).
 *
 * On the default sprite: explorer.png is its own render in tp-gold (#E5960A)
 * and is NOT one of these five — the selector's first colour is #F0C040. In
 * practice it is never seen in AcademyAgoraScene: AcademyWorld runs an effect
 * on [avatarColor, ready] that emits AVATAR_COLORS[0] as soon as the scene is
 * ready, so the base texture is replaced by explorer_0 within a frame of
 * createPlayer. explorer.png therefore serves only as the fallback for scenes
 * or states where no colour has been emitted yet — it is not the visible
 * default. Verified in runtime on /world.
 */
export const EXPLORER_VARIANT_HEXES = [
  "#F0C040",
  "#38BDF8",
  "#22C55E",
  "#F97316",
  "#D946EF",
] as const;

export const explorerVariantKey = (index: number) => `explorer-sprite-${index}`;

const explorerVariantPath = (index: number) => `/assets/sprites/explorer_${index}.webp`;

/** Index of a colour within the variant list, or -1 when it isn't one of them. */
export function explorerVariantIndex(color: string): number {
  const target = color.trim().toLowerCase();
  return EXPLORER_VARIANT_HEXES.findIndex((hex) => hex.toLowerCase() === target);
}

/**
 * Resolve a colour to a loaded texture key, falling back to the base sprite and
 * then to undefined (which means: caller should draw the vector body). Every
 * step degrades gracefully, so a missing or half-rendered sprite set never
 * breaks the world.
 */
export function explorerTextureKey(scene: Phaser.Scene, color?: string): string | undefined {
  if (color) {
    const index = explorerVariantIndex(color);
    if (index >= 0) {
      const key = explorerVariantKey(index);
      if (scene.textures.exists(key)) return key;
    }
  }
  return scene.textures.exists(EXPLORER_SPRITE_KEY) ? EXPLORER_SPRITE_KEY : undefined;
}

/**
 * Queue the explorer sprites in a scene's preload(). Safe if the PNGs are
 * absent: Phaser emits 'loaderror', the textures simply won't exist, and
 * callers fall back to the vector body. We swallow those errors to avoid scary
 * console 404s before the artist has rendered anything.
 */
export function preloadExplorerSprite(scene: Phaser.Scene) {
  scene.load.image(EXPLORER_SPRITE_KEY, EXPLORER_SPRITE_PATH);
  EXPLORER_VARIANT_HEXES.forEach((_, index) => {
    scene.load.image(explorerVariantKey(index), explorerVariantPath(index));
  });

  // 'on' rather than 'once': there are six files now, and one missing PNG must
  // not leave the remaining five unhandled.
  const swallow = (file: { key?: string }) => {
    const key = file?.key;
    if (!key) return;
    if (key === EXPLORER_SPRITE_KEY || key.startsWith("explorer-sprite-")) {
      // Expected until the sprite exists (render script or `npm run art`); vector fallback used.
    }
  };
  scene.load.on("loaderror", swallow);
  scene.load.once("complete", () => scene.load.off("loaderror", swallow));
}

/**
 * The player avatar as the world scenes use it: the Blender sprite when its PNG
 * loaded, the vector drawing otherwise. Exactly one of `sprite`/`body` is set,
 * which is what lets colour changes know which path to take — the earlier bug
 * was a scene calling the vector redraw while the sprite branch was active.
 */
export interface ExplorerAvatar {
  /** Display object to add to the scene's player container. */
  object: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  sprite?: Phaser.GameObjects.Image;
  body?: Phaser.GameObjects.Graphics;
  /** Sprite height in px, kept so colour swaps can re-apply it. */
  height: number;
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

/** Build the avatar, preferring the sprite and degrading to the vector body. */
export function createExplorerAvatar(
  scene: Phaser.Scene,
  options: ExplorerAvatarOptions,
): ExplorerAvatar {
  const { x = 0, y = 0, height, fallbackColor } = options;
  const textureKey = explorerTextureKey(scene);
  if (textureKey) {
    const sprite = scene.add.image(x, y, textureKey);
    sizeExplorerSprite(sprite, height);
    return { object: sprite, sprite, height };
  }
  const body = scene.add.graphics();
  drawExplorerBody(body, fallbackColor);
  return { object: body, body, height };
}

/** Apply a selector colour: swap texture on the sprite, or redraw the vector. */
export function setExplorerAvatarColor(
  scene: Phaser.Scene,
  avatar: ExplorerAvatar | undefined,
  color: string,
) {
  if (!avatar) return;
  const textureKey = explorerTextureKey(scene, color);
  if (avatar.sprite && textureKey) {
    avatar.sprite.setTexture(textureKey);
    // Defensive: Phaser keeps the display size across setTexture (verified in
    // runtime), and every variant is currently 512x640, so this is a no-op
    // today. It only earns its keep if a future variant ships at a different
    // resolution, which would otherwise resize the avatar mid-game.
    sizeExplorerSprite(avatar.sprite, avatar.height);
    return;
  }
  if (avatar.body) {
    drawExplorerBody(avatar.body, Phaser.Display.Color.HexStringToColor(color).color);
  }
}

/**
 * Face the avatar left (-1) or right (1) while walking.
 *
 * Only the avatar flips. Scenes must NOT scale the player container to turn the
 * character: the container also holds the name label and the ground shadow, so
 * a negative scaleX renders "Explorador" backwards.
 *
 * Mirroring the 3/4 render is sound here because the Blender model is
 * bilaterally symmetric (centred backpack, symmetric straps, arms and legs), so
 * the flip reads as the opposite 3/4 view. Only the key light lands on the
 * other side, which is invisible at this size. If the character art ever gains
 * a lateralised detail, this is the place that would need a dedicated
 * left-facing render instead.
 */
export function setExplorerAvatarFacing(avatar: ExplorerAvatar | undefined, facing: 1 | -1) {
  if (!avatar) return;
  if (avatar.sprite) {
    // setFlipX, not a negative scaleX: the sprite's scale carries its display
    // size, so flipping the scale would fight sizeExplorerSprite.
    avatar.sprite.setFlipX(facing < 0);
    return;
  }
  if (avatar.body) {
    avatar.body.scaleX = facing;
  }
}

function sizeExplorerSprite(sprite: Phaser.GameObjects.Image, height: number) {
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
