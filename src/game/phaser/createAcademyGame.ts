import Phaser from "phaser";
import AcademyAgoraScene from "@/game/phaser/AcademyAgoraScene";
import WelcomeHarborScene from "@/game/phaser/WelcomeHarborScene";
import MarketPlazaScene from "@/game/phaser/MarketPlazaScene";
import CandleWorkshopScene from "@/game/phaser/CandleWorkshopScene";
import { AVATAR_COLOR_REGISTRY_KEY } from "@/game/phaser/characterArt";
import type { AcademyWorldEventHandler, WorldRoom } from "@/game/phaser/worldEvents";

// One factory per room. Room labels/metadata live in worldRooms.ts (phaser-free).
const SCENE_FACTORIES: Record<WorldRoom, (onWorldEvent: AcademyWorldEventHandler) => Phaser.Scene> = {
  "welcome-harbor": (onWorldEvent) => new WelcomeHarborScene(onWorldEvent),
  "academy-agora": (onWorldEvent) => new AcademyAgoraScene(onWorldEvent),
  "market-plaza": (onWorldEvent) => new MarketPlazaScene(onWorldEvent),
  "candle-workshop": (onWorldEvent) => new CandleWorkshopScene(onWorldEvent),
};

export function createAcademyGame(
  parent: HTMLElement,
  onWorldEvent: AcademyWorldEventHandler,
  room: WorldRoom,
  avatarColor?: string
) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: "#88c7d8",
    render: {
      antialias: true,
      roundPixels: true,
      transparent: false,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    // Set before any scene boots so preload() fetches only this colour's art.
    callbacks: {
      preBoot: (game) => {
        if (avatarColor) game.registry.set(AVATAR_COLOR_REGISTRY_KEY, avatarColor);
      },
    },
    scene: [SCENE_FACTORIES[room](onWorldEvent)],
  });
}
