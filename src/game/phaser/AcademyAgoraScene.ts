import Phaser from "phaser";
import {
  ACADEMY_GAME_EVENTS,
  type AcademyTarget,
  type AcademyWorldEventHandler,
} from "@/game/phaser/worldEvents";

interface Hotspot {
  id: AcademyTarget;
  area: Phaser.Geom.Rectangle;
  approach: Phaser.Math.Vector2;
  prompt: string;
}

const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 720;
const WALK_MIN_Y = 330;

export default class AcademyAgoraScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Container;
  private playerBody?: Phaser.GameObjects.Graphics;
  private destinationMarker?: Phaser.GameObjects.Arc;
  private movementTween?: Phaser.Tweens.Tween;
  private pendingTarget?: AcademyTarget;
  private hoveredTarget?: AcademyTarget;
  private hotspots: Hotspot[] = [];

  constructor(private readonly onWorldEvent: AcademyWorldEventHandler) {
    super("academy-agora");
  }

  create() {
    this.cameras.main.setBackgroundColor("#88c7d8");
    this.drawRoom();
    this.createHotspots();
    this.createAria();
    this.createPlayer();
    this.createDestinationMarker();

    this.input.on("pointermove", this.handlePointerMove, this);
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.game.events.on(ACADEMY_GAME_EVENTS.avatarColor, this.setAvatarColor, this);
    this.game.events.on(ACADEMY_GAME_EVENTS.focusTarget, this.focusTarget, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(ACADEMY_GAME_EVENTS.avatarColor, this.setAvatarColor, this);
      this.game.events.off(ACADEMY_GAME_EVENTS.focusTarget, this.focusTarget, this);
    });

    this.onWorldEvent({ type: "ready", room: "academy-agora" });
    this.onWorldEvent({ type: "prompt", message: "Haz clic en el suelo para caminar" });
  }

  private drawRoom() {
    const background = this.add.graphics();
    background.fillGradientStyle(0x8ed4e2, 0x8ed4e2, 0xe8c888, 0xe8c888, 1);
    background.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Distant financial skyline.
    background.fillStyle(0x456f78, 0.32);
    for (let index = 0; index < 18; index += 1) {
      const width = 35 + (index % 4) * 12;
      const height = 60 + (index % 5) * 24;
      background.fillRoundedRect(index * 78 - 20, 245 - height, width, height, 6);
    }

    // Gardens and main plaza.
    background.fillStyle(0x4f966c, 1);
    background.fillEllipse(640, 535, 1440, 540);
    background.fillStyle(0x74b77c, 1);
    background.fillEllipse(640, 545, 1250, 465);
    background.fillStyle(0xe9d8a8, 1);
    background.fillEllipse(640, 548, 1010, 390);
    background.fillStyle(0xd4bf8b, 1);
    background.fillEllipse(640, 553, 850, 305);

    // Radial paths toward each learning building.
    background.fillStyle(0xf3e6bd, 1);
    background.fillTriangle(540, 610, 220, 315, 400, 315);
    background.fillTriangle(590, 600, 575, 285, 700, 285);
    background.fillTriangle(705, 610, 900, 315, 1060, 315);
    background.fillTriangle(610, 495, 600, 250, 680, 250);

    this.drawBuilding(130, 140, 300, 210, 0x286c60, "MERCADO PLAZA", "Oferta · demanda", "m1_1");
    this.drawBuilding(490, 92, 300, 230, 0xb86b38, "TALLER DE VELAS", "OHLC · práctica", "m1_2");
    this.drawBuilding(850, 140, 300, 210, 0x3d5c98, "OBSERVATORIO", "Tendencias · estructura", "m1_3");
    this.drawPortal();
    this.drawFountain();
    this.drawDecorations();

    const title = this.add.text(36, 28, "ACADEMIA ÁGORA", {
      color: "#ffffff",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "22px",
      fontStyle: "bold",
      stroke: "#18313a",
      strokeThickness: 5,
    });
    title.setDepth(20);
    this.add.text(38, 58, "Ciudad inicial · fundamentos del mercado", {
      color: "#eaf7f7",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "12px",
      stroke: "#18313a",
      strokeThickness: 4,
    }).setDepth(20);
  }

  private drawBuilding(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    title: string,
    subtitle: string,
    mission: string
  ) {
    const building = this.add.graphics();
    building.fillStyle(0x0c1720, 0.2);
    building.fillRoundedRect(x + 12, y + 18, width, height, 24);
    building.fillStyle(color, 1);
    building.fillRoundedRect(x, y, width, height, 24);
    building.fillStyle(0xf7edcf, 1);
    building.fillTriangle(x - 15, y + 30, x + width / 2, y - 55, x + width + 15, y + 30);
    building.fillStyle(0x23323b, 1);
    building.fillRoundedRect(x + width / 2 - 38, y + height - 88, 76, 88, 28);
    building.fillStyle(0xffd56a, 0.72);
    building.fillRoundedRect(x + 38, y + 70, 52, 60, 10);
    building.fillRoundedRect(x + width - 90, y + 70, 52, 60, 10);
    building.lineStyle(4, 0xffffff, 0.32);
    building.strokeRoundedRect(x, y, width, height, 24);

    this.add.text(x + width / 2, y + 20, title, {
      color: "#ffffff",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "16px",
      fontStyle: "bold",
      stroke: "#17232b",
      strokeThickness: 4,
      align: "center",
    }).setOrigin(0.5, 0).setDepth(y + height + 1);
    this.add.text(x + width / 2, y + 45, subtitle, {
      color: "#e8f1ef",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "11px",
      stroke: "#17232b",
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(y + height + 1);

    this.add.text(x + width / 2, y + height - 24, mission.toUpperCase(), {
      color: "#f0c040",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "10px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(y + height + 2);
  }

  private drawPortal() {
    const portal = this.add.graphics();
    portal.fillStyle(0x0f1624, 1);
    portal.fillRoundedRect(1055, 365, 160, 120, 70);
    portal.lineStyle(8, 0xf7931a, 1);
    portal.strokeRoundedRect(1070, 379, 130, 128, 62);
    portal.lineStyle(3, 0xffd08a, 0.7);
    portal.strokeRoundedRect(1087, 396, 96, 110, 48);
    portal.fillStyle(0xf7931a, 0.22);
    portal.fillRoundedRect(1087, 396, 96, 110, 48);
    this.add.text(1135, 429, "₿", {
      color: "#ffd08a",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "40px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(205);
    this.add.text(1135, 344, "PORTAL BITCOIN", {
      color: "#fff1d8",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      stroke: "#17232b",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(205);
  }

  private drawFountain() {
    const fountain = this.add.graphics();
    fountain.fillStyle(0x6a7e87, 1);
    fountain.fillEllipse(640, 535, 230, 92);
    fountain.fillStyle(0x6ed1e4, 1);
    fountain.fillEllipse(640, 525, 190, 65);
    fountain.fillStyle(0xf5d67e, 1);
    fountain.fillCircle(640, 500, 26);
    fountain.fillStyle(0xffffff, 0.65);
    fountain.fillCircle(630, 515, 5);
    fountain.fillCircle(657, 507, 4);
    this.add.text(640, 498, "TP", {
      color: "#28333b",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(536);
  }

  private drawDecorations() {
    const decoration = this.add.graphics();
    const trees = [
      [85, 360], [1180, 360], [155, 560], [1120, 560], [315, 615], [960, 620],
    ];
    for (const [x, y] of trees) {
      decoration.fillStyle(0x765535, 1);
      decoration.fillRoundedRect(x - 7, y - 34, 14, 52, 5);
      decoration.fillStyle(0x2f7957, 1);
      decoration.fillCircle(x, y - 48, 34);
      decoration.fillStyle(0x4fa56d, 1);
      decoration.fillCircle(x - 16, y - 55, 20);
    }

    for (const x of [430, 850]) {
      decoration.fillStyle(0x293943, 1);
      decoration.fillRoundedRect(x - 4, 440, 8, 72, 4);
      decoration.fillStyle(0xffdf83, 1);
      decoration.fillCircle(x, 435, 12);
    }
  }

  private createHotspots() {
    this.hotspots = [
      {
        id: "market-plaza",
        area: new Phaser.Geom.Rectangle(120, 125, 320, 220),
        approach: new Phaser.Math.Vector2(280, 355),
        prompt: "Entrar a Mercado Plaza · Misión 1.1",
      },
      {
        id: "candle-workshop",
        area: new Phaser.Geom.Rectangle(475, 78, 330, 260),
        approach: new Phaser.Math.Vector2(640, 365),
        prompt: "Entrar al Taller de Velas · Misión 1.2",
      },
      {
        id: "trend-observatory",
        area: new Phaser.Geom.Rectangle(840, 125, 320, 220),
        approach: new Phaser.Math.Vector2(1000, 355),
        prompt: "Entrar al Observatorio · Misión 1.3",
      },
      {
        id: "bitcoin-portal",
        area: new Phaser.Geom.Rectangle(1045, 345, 190, 180),
        approach: new Phaser.Math.Vector2(1010, 520),
        prompt: "Examinar el portal hacia Ciudad Bitcoin",
      },
      {
        id: "aria",
        area: new Phaser.Geom.Rectangle(280, 390, 135, 150),
        approach: new Phaser.Math.Vector2(430, 500),
        prompt: "Hablar con ARIA",
      },
    ];
  }

  private createAria() {
    const aria = this.add.container(360, 470);
    const shadow = this.add.ellipse(0, 38, 70, 22, 0x10202a, 0.25);
    const body = this.add.graphics();
    body.fillStyle(0x335f9c, 1);
    body.fillRoundedRect(-28, -10, 56, 58, 20);
    body.fillStyle(0x8bc8ff, 1);
    body.fillCircle(0, -24, 34);
    body.fillStyle(0x13243b, 1);
    body.fillRoundedRect(-21, -34, 42, 20, 10);
    body.fillStyle(0x65e7ff, 1);
    body.fillCircle(-10, -24, 4);
    body.fillCircle(10, -24, 4);
    body.lineStyle(3, 0x65e7ff, 1);
    body.strokeCircle(0, -24, 39);
    const label = this.add.text(0, 58, "ARIA", {
      color: "#dff6ff",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      stroke: "#152735",
      strokeThickness: 4,
    }).setOrigin(0.5);
    const icon = this.add.text(0, -82, "!", {
      color: "#17212b",
      backgroundColor: "#f0c040",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "17px",
      fontStyle: "bold",
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5);
    aria.add([shadow, body, label, icon]);
    aria.setDepth(aria.y);
    this.tweens.add({ targets: icon, y: -88, duration: 900, yoyo: true, repeat: -1, ease: "Sine.InOut" });
  }

  private createPlayer() {
    const player = this.add.container(640, 620);
    const shadow = this.add.ellipse(0, 38, 64, 20, 0x10202a, 0.3);
    const body = this.add.graphics();
    this.playerBody = body;
    this.drawPlayerBody(0xf0c040);
    const name = this.add.text(0, 59, "Explorador", {
      color: "#ffffff",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      stroke: "#1c2b35",
      strokeThickness: 4,
    }).setOrigin(0.5);
    player.add([shadow, body, name]);
    player.setDepth(player.y);
    this.player = player;
  }

  private drawPlayerBody(color: number) {
    if (!this.playerBody) return;
    this.playerBody.clear();
    this.playerBody.fillStyle(0x27333a, 1);
    this.playerBody.fillRoundedRect(-24, 28, 18, 25, 8);
    this.playerBody.fillRoundedRect(6, 28, 18, 25, 8);
    this.playerBody.fillStyle(color, 1);
    this.playerBody.fillRoundedRect(-34, -16, 68, 63, 25);
    this.playerBody.fillStyle(0xffd4ad, 1);
    this.playerBody.fillCircle(0, -32, 34);
    this.playerBody.fillStyle(0x26313b, 1);
    this.playerBody.fillRoundedRect(-30, -55, 60, 22, 11);
    this.playerBody.fillCircle(-11, -33, 3);
    this.playerBody.fillCircle(11, -33, 3);
    this.playerBody.lineStyle(3, 0xffffff, 0.36);
    this.playerBody.strokeRoundedRect(-34, -16, 68, 63, 25);
    this.playerBody.fillStyle(0x37566a, 1);
    this.playerBody.fillRoundedRect(20, -2, 20, 40, 8);
  }

  private createDestinationMarker() {
    this.destinationMarker = this.add.circle(0, 0, 13, 0xf0c040, 0.15);
    this.destinationMarker.setStrokeStyle(3, 0xf0c040, 0.9);
    this.destinationMarker.setVisible(false);
    this.destinationMarker.setDepth(1000);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const hotspot = this.hotspots.find((item) => item.area.contains(worldPoint.x, worldPoint.y));
    if (hotspot?.id === this.hoveredTarget) return;
    this.hoveredTarget = hotspot?.id;
    this.onWorldEvent({
      type: "prompt",
      message: hotspot?.prompt ?? "Haz clic en el suelo para caminar",
    });
    this.game.canvas.style.cursor = hotspot ? "pointer" : "default";
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const hotspot = this.hotspots.find((item) => item.area.contains(worldPoint.x, worldPoint.y));
    if (hotspot) {
      this.pendingTarget = hotspot.id;
      this.movePlayerTo(hotspot.approach.x, hotspot.approach.y);
      return;
    }

    this.pendingTarget = undefined;
    const x = Phaser.Math.Clamp(worldPoint.x, 80, WORLD_WIDTH - 80);
    const y = Phaser.Math.Clamp(worldPoint.y, WALK_MIN_Y, WORLD_HEIGHT - 55);
    this.movePlayerTo(x, y);
  }

  private movePlayerTo(x: number, y: number) {
    if (!this.player || !this.destinationMarker) return;
    this.movementTween?.stop();
    this.destinationMarker.setPosition(x, y + 32).setVisible(true).setAlpha(1);
    this.tweens.add({ targets: this.destinationMarker, alpha: 0, scale: 1.8, duration: 420 });

    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
    this.player.setScale(x < this.player.x ? -1 : 1, 1);
    this.onWorldEvent({ type: "moving", moving: true });
    this.movementTween = this.tweens.add({
      targets: this.player,
      x,
      y,
      duration: Phaser.Math.Clamp(distance * 2.2, 220, 1400),
      ease: "Sine.InOut",
      onUpdate: () => {
        if (!this.player) return;
        this.player.setDepth(this.player.y);
        this.player.rotation = Math.sin(this.time.now / 75) * 0.025;
      },
      onComplete: () => {
        if (!this.player) return;
        this.player.rotation = 0;
        this.player.setScale(1);
        this.onWorldEvent({ type: "moving", moving: false });
        if (this.pendingTarget) {
          this.onWorldEvent({ type: "interact", target: this.pendingTarget });
          this.pendingTarget = undefined;
        }
      },
    });
  }

  private setAvatarColor(color: string) {
    this.drawPlayerBody(Phaser.Display.Color.HexStringToColor(color).color);
  }

  private focusTarget(target: AcademyTarget) {
    const hotspot = this.hotspots.find((item) => item.id === target);
    if (!hotspot) return;
    this.pendingTarget = target;
    this.movePlayerTo(hotspot.approach.x, hotspot.approach.y);
  }
}
