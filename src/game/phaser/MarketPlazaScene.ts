import Phaser from "phaser";
import {
  ACADEMY_GAME_EVENTS,
  type AcademyWorldEventHandler,
  type MarketTarget,
} from "@/game/phaser/worldEvents";

interface MarketHotspot {
  id: MarketTarget;
  area: Phaser.Geom.Rectangle;
  approach: Phaser.Math.Vector2;
  prompt: string;
  enabled: () => boolean;
}

const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 720;

export default class MarketPlazaScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Container;
  private playerBody?: Phaser.GameObjects.Graphics;
  private destinationMarker?: Phaser.GameObjects.Arc;
  private movementTween?: Phaser.Tweens.Tween;
  private pendingTarget?: MarketTarget;
  private hoveredTarget?: MarketTarget;
  private sellerVisited = false;
  private buyerVisited = false;
  private practiceGlow?: Phaser.GameObjects.Arc;
  private supplyLight?: Phaser.GameObjects.Arc;
  private demandLight?: Phaser.GameObjects.Arc;
  private statusText?: Phaser.GameObjects.Text;
  private hotspots: MarketHotspot[] = [];

  constructor(private readonly onWorldEvent: AcademyWorldEventHandler) {
    super("market-plaza");
  }

  create() {
    this.cameras.main.setBackgroundColor("#efc983");
    this.drawMarket();
    this.createSeller();
    this.createBuyer();
    this.createPlayer();
    this.createDestinationMarker();
    this.createHotspots();

    this.input.on("pointermove", this.handlePointerMove, this);
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.game.events.on(ACADEMY_GAME_EVENTS.avatarColor, this.setAvatarColor, this);
    this.game.events.on(ACADEMY_GAME_EVENTS.marketProgress, this.setMarketProgress, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(ACADEMY_GAME_EVENTS.avatarColor, this.setAvatarColor, this);
      this.game.events.off(ACADEMY_GAME_EVENTS.marketProgress, this.setMarketProgress, this);
    });

    this.cameras.main.fadeIn(450, 16, 29, 31);
    this.onWorldEvent({ type: "ready", room: "market-plaza" });
    this.onWorldEvent({ type: "prompt", message: "Habla con Elena y Leo para descubrir cómo nace un precio" });
  }

  private drawMarket() {
    const background = this.add.graphics();
    background.fillGradientStyle(0xf6d89c, 0xf6d89c, 0xc98555, 0xc98555, 1);
    background.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Open-air hall and distant city.
    background.fillStyle(0x336c70, 0.35);
    for (let index = 0; index < 15; index += 1) {
      const height = 75 + (index % 4) * 28;
      background.fillRoundedRect(index * 92 - 20, 235 - height, 62, height, 7);
    }
    background.fillStyle(0xf5e5bb, 1);
    background.fillRoundedRect(45, 170, 1190, 550, 45);
    background.fillStyle(0xdab77c, 1);
    background.fillRoundedRect(75, 205, 1130, 515, 35);
    background.fillStyle(0xc7975d, 1);
    for (let x = 105; x < 1200; x += 125) {
      background.fillRoundedRect(x, 230, 88, 465, 14);
    }
    background.fillStyle(0xe8c58d, 1);
    background.fillRoundedRect(95, 250, 1090, 445, 30);

    this.drawCanopy(background);
    this.drawLearningGate(background);
    this.drawPriceBoard(background);
    this.drawExit(background);
    this.drawCrates(background);
  }

  private drawCanopy(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0x235f58, 1);
    graphics.fillRoundedRect(100, 290, 330, 245, 26);
    graphics.fillStyle(0xf0c040, 1);
    for (let index = 0; index < 6; index += 1) {
      graphics.fillRoundedRect(92 + index * 58, 255, 58, 75, 18);
    }
    graphics.fillStyle(0x3d5c98, 1);
    graphics.fillRoundedRect(850, 290, 330, 245, 26);
    graphics.fillStyle(0xf29a65, 1);
    for (let index = 0; index < 6; index += 1) {
      graphics.fillRoundedRect(842 + index * 58, 255, 58, 75, 18);
    }

    this.add.text(265, 328, "PUESTO DE ELENA", {
      color: "#ffffff",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "19px",
      fontStyle: "bold",
      stroke: "#17313c",
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(540);
    this.add.text(1015, 328, "PEDIDOS DE LEO", {
      color: "#ffffff",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "19px",
      fontStyle: "bold",
      stroke: "#273052",
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(540);
  }

  private drawLearningGate(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0x173640, 1);
    graphics.fillRoundedRect(515, 80, 250, 210, 45);
    graphics.fillStyle(0xf8e8bd, 1);
    graphics.fillTriangle(485, 125, 640, 30, 795, 125);
    graphics.fillStyle(0x0b1c25, 1);
    graphics.fillRoundedRect(590, 155, 100, 135, 42);
    graphics.lineStyle(7, 0x7d7254, 0.8);
    graphics.strokeRoundedRect(603, 168, 74, 122, 32);
    this.practiceGlow = this.add.circle(640, 225, 50, 0xf0c040, 0.02).setDepth(204);
    this.practiceGlow.setStrokeStyle(4, 0xf0c040, 0.15);
    this.add.text(640, 103, "AULA DE PRÁCTICA", {
      color: "#ffffff",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "16px",
      fontStyle: "bold",
      stroke: "#17313c",
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(205);
  }

  private drawPriceBoard(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0x14252b, 1);
    graphics.fillRoundedRect(480, 330, 320, 175, 24);
    graphics.lineStyle(5, 0xf3dfae, 0.7);
    graphics.strokeRoundedRect(480, 330, 320, 175, 24);
    this.add.text(640, 353, "PRECIO DE ENCUENTRO", {
      color: "#f0c040",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(510);
    this.add.text(640, 395, "$2.00", {
      color: "#ffffff",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "34px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(510);
    this.add.text(640, 430, "por cesta de manzanas", {
      color: "#c6d5d8",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "11px",
    }).setOrigin(0.5).setDepth(510);

    this.supplyLight = this.add.circle(545, 470, 11, 0xffffff, 0.13).setDepth(511);
    this.demandLight = this.add.circle(735, 470, 11, 0xffffff, 0.13).setDepth(511);
    this.add.text(565, 470, "OFERTA", {
      color: "#c6d5d8",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
    }).setOrigin(0, 0.5).setDepth(511);
    this.add.text(715, 470, "DEMANDA", {
      color: "#c6d5d8",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
    }).setOrigin(1, 0.5).setDepth(511);
    this.statusText = this.add.text(640, 522, "Descubre ambos lados del mercado", {
      color: "#17313c",
      backgroundColor: "#f5d465",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      padding: { x: 12, y: 7 },
    }).setOrigin(0.5).setDepth(512);
  }

  private drawExit(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0x17313c, 1);
    graphics.fillRoundedRect(28, 600, 155, 75, 24);
    this.add.text(105, 623, "← ACADEMIA", {
      color: "#ffffff",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(680);
    this.add.text(105, 647, "Salir de la plaza", {
      color: "#9eb4b9",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "9px",
    }).setOrigin(0.5).setDepth(680);
  }

  private drawCrates(graphics: Phaser.GameObjects.Graphics) {
    for (const [x, y] of [[130, 440], [350, 430], [875, 440], [1095, 430]] as const) {
      graphics.fillStyle(0x8a5735, 1);
      graphics.fillRoundedRect(x, y, 82, 62, 8);
      graphics.lineStyle(3, 0xc18a54, 1);
      graphics.lineBetween(x + 8, y + 8, x + 74, y + 54);
      graphics.lineBetween(x + 74, y + 8, x + 8, y + 54);
    }
    for (const [x, y] of [[150, 427], [175, 422], [370, 417], [395, 425]] as const) {
      graphics.fillStyle(0xd9473f, 1);
      graphics.fillCircle(x, y, 12);
      graphics.fillStyle(0x4b8a52, 1);
      graphics.fillEllipse(x + 8, y - 11, 12, 6);
    }
  }

  private createSeller() {
    const seller = this.add.container(270, 500);
    const shadow = this.add.ellipse(0, 37, 72, 22, 0x10202a, 0.25);
    const body = this.add.graphics();
    body.fillStyle(0xf0c040, 1);
    body.fillRoundedRect(-31, -10, 62, 58, 20);
    body.fillStyle(0xffcda9, 1);
    body.fillCircle(0, -30, 32);
    body.fillStyle(0x7b3f2c, 1);
    body.fillRoundedRect(-28, -54, 56, 23, 12);
    body.fillCircle(-11, -31, 3);
    body.fillCircle(11, -31, 3);
    const label = this.add.text(0, 60, "ELENA · VENDEDORA", {
      color: "#ffffff",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
      stroke: "#17313c",
      strokeThickness: 4,
    }).setOrigin(0.5);
    const icon = this.add.text(0, -82, "OFERTA", {
      color: "#17313c",
      backgroundColor: "#f5d465",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
      padding: { x: 9, y: 5 },
    }).setOrigin(0.5);
    seller.add([shadow, body, label, icon]);
    seller.setDepth(seller.y);
    this.tweens.add({ targets: icon, y: -88, duration: 950, yoyo: true, repeat: -1, ease: "Sine.InOut" });
  }

  private createBuyer() {
    const buyer = this.add.container(1010, 500);
    const shadow = this.add.ellipse(0, 37, 72, 22, 0x10202a, 0.25);
    const body = this.add.graphics();
    body.fillStyle(0x60a5fa, 1);
    body.fillRoundedRect(-31, -10, 62, 58, 20);
    body.fillStyle(0xd8a779, 1);
    body.fillCircle(0, -30, 32);
    body.fillStyle(0x26313b, 1);
    body.fillRoundedRect(-28, -53, 56, 19, 10);
    body.fillCircle(-11, -31, 3);
    body.fillCircle(11, -31, 3);
    const label = this.add.text(0, 60, "LEO · COMPRADOR", {
      color: "#ffffff",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
      stroke: "#273052",
      strokeThickness: 4,
    }).setOrigin(0.5);
    const icon = this.add.text(0, -82, "DEMANDA", {
      color: "#ffffff",
      backgroundColor: "#3d5c98",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
      padding: { x: 9, y: 5 },
    }).setOrigin(0.5);
    buyer.add([shadow, body, label, icon]);
    buyer.setDepth(buyer.y);
    this.tweens.add({ targets: icon, y: -88, duration: 1050, yoyo: true, repeat: -1, ease: "Sine.InOut" });
  }

  private createPlayer() {
    const player = this.add.container(640, 625);
    const shadow = this.add.ellipse(0, 38, 64, 20, 0x10202a, 0.3);
    const body = this.add.graphics();
    this.playerBody = body;
    this.drawPlayerBody(0xf0c040);
    const label = this.add.text(0, 59, "Explorador", {
      color: "#ffffff",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      stroke: "#1c2b35",
      strokeThickness: 4,
    }).setOrigin(0.5);
    player.add([shadow, body, label]);
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

  private createHotspots() {
    this.hotspots = [
      {
        id: "market-seller",
        area: new Phaser.Geom.Rectangle(100, 275, 335, 310),
        approach: new Phaser.Math.Vector2(390, 555),
        prompt: "Hablar con Elena sobre la oferta",
        enabled: () => true,
      },
      {
        id: "market-buyer",
        area: new Phaser.Geom.Rectangle(845, 275, 340, 310),
        approach: new Phaser.Math.Vector2(890, 555),
        prompt: "Hablar con Leo sobre la demanda",
        enabled: () => true,
      },
      {
        id: "market-board",
        area: new Phaser.Geom.Rectangle(475, 320, 330, 220),
        approach: new Phaser.Math.Vector2(640, 565),
        prompt: "Examinar el precio de encuentro",
        enabled: () => true,
      },
      {
        id: "market-practice",
        area: new Phaser.Geom.Rectangle(535, 70, 210, 230),
        approach: new Phaser.Math.Vector2(640, 330),
        prompt: "Entrar al aula de práctica M1.1",
        enabled: () => this.sellerVisited && this.buyerVisited,
      },
      {
        id: "market-practice-locked",
        area: new Phaser.Geom.Rectangle(535, 70, 210, 230),
        approach: new Phaser.Math.Vector2(640, 330),
        prompt: "Primero escucha a comprador y vendedor",
        enabled: () => !this.sellerVisited || !this.buyerVisited,
      },
      {
        id: "market-exit",
        area: new Phaser.Geom.Rectangle(15, 580, 185, 120),
        approach: new Phaser.Math.Vector2(210, 625),
        prompt: "Volver a Academia Ágora",
        enabled: () => true,
      },
    ];
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    const point = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const hotspot = this.hotspots.find((item) => item.enabled() && item.area.contains(point.x, point.y));
    if (hotspot?.id === this.hoveredTarget) return;
    this.hoveredTarget = hotspot?.id;
    this.onWorldEvent({ type: "prompt", message: hotspot?.prompt ?? "Haz clic en el suelo para caminar" });
    this.game.canvas.style.cursor = hotspot ? "pointer" : "default";
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    const point = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const hotspot = this.hotspots.find((item) => item.enabled() && item.area.contains(point.x, point.y));
    if (hotspot) {
      this.pendingTarget = hotspot.id;
      this.movePlayerTo(hotspot.approach.x, hotspot.approach.y);
      return;
    }
    this.pendingTarget = undefined;
    this.movePlayerTo(
      Phaser.Math.Clamp(point.x, 80, WORLD_WIDTH - 80),
      Phaser.Math.Clamp(point.y, 315, WORLD_HEIGHT - 55)
    );
  }

  private movePlayerTo(x: number, y: number) {
    if (!this.player || !this.destinationMarker) return;
    this.movementTween?.stop();
    this.destinationMarker.setPosition(x, y + 32).setVisible(true).setAlpha(1).setScale(1);
    this.tweens.add({ targets: this.destinationMarker, alpha: 0, scale: 1.8, duration: 420 });
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
    this.player.setScale(x < this.player.x ? -1 : 1, 1);
    this.onWorldEvent({ type: "moving", moving: true });
    this.movementTween = this.tweens.add({
      targets: this.player,
      x,
      y,
      duration: Phaser.Math.Clamp(distance * 2.1, 220, 1400),
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
        if (!this.pendingTarget) return;
        const target = this.pendingTarget;
        this.pendingTarget = undefined;
        this.onWorldEvent({ type: "interact", target });
      },
    });
  }

  private setMarketProgress(progress: { sellerVisited: boolean; buyerVisited: boolean }) {
    this.sellerVisited = progress.sellerVisited;
    this.buyerVisited = progress.buyerVisited;
    this.supplyLight?.setFillStyle(progress.sellerVisited ? 0x22c55e : 0xffffff, progress.sellerVisited ? 1 : 0.13);
    this.demandLight?.setFillStyle(progress.buyerVisited ? 0x60a5fa : 0xffffff, progress.buyerVisited ? 1 : 0.13);
    const complete = progress.sellerVisited && progress.buyerVisited;
    this.statusText?.setText(complete ? "¡El precio conecta oferta y demanda!" : "Descubre ambos lados del mercado");
    if (complete) {
      this.practiceGlow?.setFillStyle(0xf0c040, 0.22).setStrokeStyle(5, 0xffea99, 0.95);
      this.tweens.add({
        targets: this.practiceGlow,
        alpha: { from: 0.45, to: 1 },
        scale: { from: 0.9, to: 1.12 },
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
      this.onWorldEvent({ type: "prompt", message: "Aula desbloqueada: entra para demostrar lo aprendido" });
    }
  }

  private setAvatarColor(color: string) {
    this.drawPlayerBody(Phaser.Display.Color.HexStringToColor(color).color);
  }
}
