import Phaser from "phaser";

/**
 * Shared cartoon character art for every world scene.
 * One implementation so the Explorador and NPCs look the same in all rooms.
 */

export const CHARACTER_INK = 0x1e2a44;

// ─── Blender-rendered sprites (2.5D pipeline) ───────────────────────────────
// Pre-rendered PNGs live in public/assets/sprites/ (see blender/README.md).
// When a sprite texture is present we use it; otherwise scenes fall back to the
// vector drawing below, so the world keeps working before any render exists.

export const EXPLORER_SPRITE_KEY = "explorer-sprite";
export const EXPLORER_SPRITE_PATH = "/assets/sprites/explorer.png";

/**
 * Avatar colour variants rendered by blender/build_explorer.py (Fase 2).
 *
 * Order matters: index i is the sprite rendered to explorer_{i}.png, so this
 * must stay in sync with AVATAR_COLORS in components/world/AcademyWorld.tsx.
 * It is duplicated rather than imported so Phaser code pulls in no React
 * modules; the same duplication exists on the Blender side (AVATAR_HEXES).
 *
 * PENDIENTE: explorer.png is its own render in tp-gold (#E5960A) and is NOT one
 * of these five — the selector's first colour is #F0C040. Whether the default
 * avatar should become explorer_0.png is still an open decision, so the base
 * sprite stays as the fallback and nothing here forces the choice.
 */
export const EXPLORER_VARIANT_HEXES = [
  "#F0C040",
  "#38BDF8",
  "#22C55E",
  "#F97316",
  "#D946EF",
] as const;

export const explorerVariantKey = (index: number) => `explorer-sprite-${index}`;

const explorerVariantPath = (index: number) => `/assets/sprites/explorer_${index}.png`;

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
      // Expected until blender/build_explorer.py has been run; vector fallback used.
    }
  };
  scene.load.on("loaderror", swallow);
  scene.load.once("complete", () => scene.load.off("loaderror", swallow));
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
