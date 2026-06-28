import Phaser from "phaser";
import AcademyAgoraScene from "@/game/phaser/AcademyAgoraScene";
import WelcomeHarborScene from "@/game/phaser/WelcomeHarborScene";
import type { AcademyWorldEventHandler, WorldRoom } from "@/game/phaser/worldEvents";

export function createAcademyGame(
  parent: HTMLElement,
  onWorldEvent: AcademyWorldEventHandler,
  room: WorldRoom
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
    scene: [
      room === "welcome-harbor"
        ? new WelcomeHarborScene(onWorldEvent)
        : new AcademyAgoraScene(onWorldEvent),
    ],
  });
}
