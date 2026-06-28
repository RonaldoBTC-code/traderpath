import Phaser from "phaser";
import {
  ACADEMY_GAME_EVENTS,
  type AcademyWorldEventHandler,
  type WelcomeTarget,
} from "@/game/phaser/worldEvents";

interface WelcomeHotspot {
  id: WelcomeTarget;
  area: Phaser.Geom.Rectangle;
  approach: Phaser.Math.Vector2;
  prompt: string;
  enabled: () => boolean;
}

const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 720;
const WALK_MIN_Y = 340;

export default class WelcomeHarborScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Container;
  private playerBody?: Phaser.GameObjects.Graphics;
  private destinationMarker?: Phaser.GameObjects.Arc;
  private movementTween?: Phaser.Tweens.Tween;
  private pendingTarget?: WelcomeTarget;
  private hoveredTarget?: WelcomeTarget;
  private token?: Phaser.GameObjects.Container;
  private gateGlow?: Phaser.GameObjects.Arc;
  private tokenEnabled = false;
  private gateEnabled = false;
  private hotspots: WelcomeHotspot[] = [];

  constructor(private readonly onWorldEvent: AcademyWorldEventHandler) {
    super("welcome-harbor");
  }

  create() {
    this.cameras.main.setBackgroundColor("#6bc5d1");
    this.drawHarbor();
    this.createGuide();
    this.createToken();
    this.createPlayer();
    this.createDestinationMarker();
    this.createHotspots();

    this.input.on("pointermove", this.handlePointerMove, this);
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.game.events.on(ACADEMY_GAME_EVENTS.avatarColor, this.setAvatarColor, this);
    this.game.events.on(ACADEMY_GAME_EVENTS.enableIntroToken, this.enableToken, this);
    this.game.events.on(ACADEMY_GAME_EVENTS.enableIntroGate, this.enableGate, this);
    this.game.events.on(ACADEMY_GAME_EVENTS.enterAcademy, this.enterAcademy, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(ACADEMY_GAME_EVENTS.avatarColor, this.setAvatarColor, this);
      this.game.events.off(ACADEMY_GAME_EVENTS.enableIntroToken, this.enableToken, this);
      this.game.events.off(ACADEMY_GAME_EVENTS.enableIntroGate, this.enableGate, this);
      this.game.events.off(ACADEMY_GAME_EVENTS.enterAcademy, this.enterAcademy, this);
    });

    this.cameras.main.fadeIn(600, 8, 20, 34);
    this.onWorldEvent({ type: "ready", room: "welcome-harbor" });
    this.onWorldEvent({ type: "prompt", message: "Haz clic en ARIA para comenzar tu aventura" });
  }

  private drawHarbor() {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x75d0dc, 0x9fdae2, 0xf7ca86, 0xf3b86a, 1);
    sky.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Sun, clouds and distant market city.
    sky.fillStyle(0xffe49c, 0.9);
    sky.fillCircle(1050, 105, 62);
    sky.fillStyle(0xffffff, 0.42);
    for (const [x, y, scale] of [[170, 100, 1], [850, 145, 0.7], [1110, 210, 0.55]] as const) {
      sky.fillEllipse(x, y, 150 * scale, 42 * scale);
      sky.fillCircle(x - 45 * scale, y - 9 * scale, 34 * scale);
      sky.fillCircle(x + 32 * scale, y - 13 * scale, 42 * scale);
    }

    sky.fillStyle(0x2c6770, 0.38);
    const skyline = [
      [40, 250, 90, 145], [150, 220, 100, 175], [270, 255, 82, 140],
      [900, 245, 88, 150], [1010, 205, 115, 190], [1145, 240, 95, 155],
    ];
    for (const [x, y, width, height] of skyline) {
      sky.fillRoundedRect(x, y, width, height, 8);
    }

    // Academy gate in the distance.
    const gate = this.add.graphics();
    gate.fillStyle(0x183846, 1);
    gate.fillRoundedRect(515, 140, 250, 210, 45);
    gate.fillStyle(0xf4e6c1, 1);
    gate.fillTriangle(490, 185, 640, 92, 790, 185);
    gate.fillStyle(0x0c202b, 1);
    gate.fillRoundedRect(592, 208, 96, 142, 44);
    gate.lineStyle(7, 0xf0c040, 0.9);
    gate.strokeRoundedRect(604, 220, 72, 132, 34);
    this.gateGlow = this.add.circle(640, 274, 48, 0xf0c040, 0.06);
    this.gateGlow.setStrokeStyle(4, 0xf0c040, 0.25);
    this.gateGlow.setDepth(205);
    this.tweens.add({
      targets: this.gateGlow,
      alpha: { from: 0.25, to: 0.6 },
      scale: { from: 0.9, to: 1.08 },
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
    this.add.text(640, 163, "ACADEMIA ÁGORA", {
      color: "#ffffff",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "19px",
      fontStyle: "bold",
      stroke: "#17313c",
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(206);

    // Sea and curved pier.
    const ground = this.add.graphics();
    ground.fillStyle(0x258ea5, 1);
    ground.fillRect(0, 330, WORLD_WIDTH, 390);
    ground.fillStyle(0x5fc9d2, 0.72);
    for (let row = 0; row < 6; row += 1) {
      ground.fillEllipse(120 + row * 225, 390 + (row % 2) * 35, 180, 18);
    }
    ground.fillStyle(0xe8d09a, 1);
    ground.fillTriangle(470, 720, 810, 720, 720, 320);
    ground.fillRoundedRect(250, 470, 780, 250, 80);
    ground.fillStyle(0xc89558, 1);
    ground.fillRoundedRect(270, 490, 740, 230, 70);
    ground.lineStyle(5, 0xf6e4bb, 0.55);
    for (let x = 310; x < 980; x += 72) {
      ground.lineBetween(x, 505, x + 30, 705);
    }

    // Harbor rails.
    ground.fillStyle(0x794f32, 1);
    for (const [x, y] of [[285, 520], [300, 625], [980, 520], [965, 625]] as const) {
      ground.fillRoundedRect(x - 8, y - 35, 16, 75, 5);
    }
    ground.lineStyle(8, 0x9d6b43, 1);
    ground.lineBetween(285, 500, 300, 610);
    ground.lineBetween(980, 500, 965, 610);

    this.drawMarketStalls();
    this.drawHarborDetails();
  }

  private drawMarketStalls() {
    const stalls = this.add.graphics();
    const data = [
      { x: 95, color: 0x2f7c6f, awning: 0xf4d36c, sign: "CAMBIO" },
      { x: 985, color: 0x4763a1, awning: 0xf29a65, sign: "NOTICIAS" },
    ];
    for (const stall of data) {
      stalls.fillStyle(0x142b33, 0.2);
      stalls.fillRoundedRect(stall.x + 10, 365, 205, 155, 22);
      stalls.fillStyle(stall.color, 1);
      stalls.fillRoundedRect(stall.x, 350, 205, 155, 22);
      stalls.fillStyle(stall.awning, 1);
      for (let index = 0; index < 5; index += 1) {
        stalls.fillRoundedRect(stall.x + index * 41, 335, 41, 55, 13);
      }
      this.add.text(stall.x + 102, 410, stall.sign, {
        color: "#ffffff",
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: "15px",
        fontStyle: "bold",
        stroke: "#17313c",
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(510);
    }
  }

  private drawHarborDetails() {
    const details = this.add.graphics();
    details.fillStyle(0xf0c040, 1);
    details.fillRoundedRect(34, 28, 248, 58, 22);
    details.fillStyle(0x102b35, 1);
    details.fillCircle(68, 57, 22);
    this.add.text(68, 57, "TP", {
      color: "#f0c040",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(901);
    this.add.text(98, 45, "MERCADO VIVO", {
      color: "#102b35",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "18px",
      fontStyle: "bold",
    }).setDepth(901);
    this.add.text(99, 67, "Puerto de Bienvenida", {
      color: "#31505a",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "10px",
    }).setDepth(901);

    // Animated flags and birds make the room feel inhabited.
    for (const x of [380, 900]) {
      details.fillStyle(0x554331, 1);
      details.fillRoundedRect(x, 275, 7, 110, 3);
      details.fillStyle(x === 380 ? 0xf0c040 : 0x60a5fa, 1);
      details.fillTriangle(x + 7, 285, x + 72, 305, x + 7, 330);
    }
    for (const [x, y] of [[350, 115], [405, 145], [820, 95]] as const) {
      const bird = this.add.text(x, y, "⌁", {
        color: "#244e58",
        fontFamily: "serif",
        fontSize: "30px",
      }).setOrigin(0.5).setAlpha(0.62);
      this.tweens.add({
        targets: bird,
        x: x + 70,
        y: y - 8,
        duration: 4200 + x,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
    }
  }

  private createGuide() {
    const aria = this.add.container(470, 480);
    const shadow = this.add.ellipse(0, 43, 78, 24, 0x10202a, 0.28);
    const body = this.add.graphics();
    body.fillStyle(0x335f9c, 1);
    body.fillRoundedRect(-31, -10, 62, 64, 22);
    body.fillStyle(0x8bc8ff, 1);
    body.fillCircle(0, -28, 37);
    body.fillStyle(0x13243b, 1);
    body.fillRoundedRect(-24, -39, 48, 22, 11);
    body.fillStyle(0x65e7ff, 1);
    body.fillCircle(-11, -28, 4);
    body.fillCircle(11, -28, 4);
    body.lineStyle(3, 0x65e7ff, 1);
    body.strokeCircle(0, -28, 42);
    const label = this.add.text(0, 65, "ARIA", {
      color: "#ffffff",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      stroke: "#17313c",
      strokeThickness: 4,
    }).setOrigin(0.5);
    const bubble = this.add.text(0, -94, "¡HOLA!", {
      color: "#18313a",
      backgroundColor: "#f5d465",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5);
    aria.add([shadow, body, label, bubble]);
    aria.setDepth(aria.y);
    this.tweens.add({ targets: bubble, y: -101, duration: 900, yoyo: true, repeat: -1, ease: "Sine.InOut" });
  }

  private createToken() {
    const token = this.add.container(835, 500);
    const glow = this.add.circle(0, 0, 42, 0xf0c040, 0.18);
    const coin = this.add.graphics();
    coin.fillStyle(0xf0c040, 1);
    coin.fillCircle(0, 0, 27);
    coin.lineStyle(4, 0xffec9a, 1);
    coin.strokeCircle(0, 0, 22);
    const mark = this.add.text(0, 0, "M", {
      color: "#523f12",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "18px",
      fontStyle: "bold",
    }).setOrigin(0.5);
    token.add([glow, coin, mark]);
    token.setDepth(token.y);
    token.setVisible(false);
    this.token = token;
    this.tweens.add({
      targets: token,
      y: 485,
      scaleX: 0.72,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  private createPlayer() {
    const player = this.add.container(640, 625);
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

  private createHotspots() {
    this.hotspots = [
      {
        id: "intro-aria",
        area: new Phaser.Geom.Rectangle(400, 380, 145, 175),
        approach: new Phaser.Math.Vector2(580, 505),
        prompt: "Hablar con ARIA",
        enabled: () => true,
      },
      {
        id: "intro-token",
        area: new Phaser.Geom.Rectangle(780, 430, 120, 125),
        approach: new Phaser.Math.Vector2(745, 520),
        prompt: "Recoger la Ficha de Mercado",
        enabled: () => this.tokenEnabled,
      },
      {
        id: "intro-gate",
        area: new Phaser.Geom.Rectangle(545, 120, 190, 235),
        approach: new Phaser.Math.Vector2(640, 385),
        prompt: "Entrar a Academia Ágora",
        enabled: () => this.gateEnabled,
      },
      {
        id: "intro-gate-locked",
        area: new Phaser.Geom.Rectangle(545, 120, 190, 235),
        approach: new Phaser.Math.Vector2(640, 385),
        prompt: "La entrada necesita una Ficha de Mercado",
        enabled: () => !this.gateEnabled,
      },
    ];
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const hotspot = this.hotspots.find(
      (item) => item.enabled() && item.area.contains(worldPoint.x, worldPoint.y)
    );
    if (hotspot?.id === this.hoveredTarget) return;
    this.hoveredTarget = hotspot?.id;
    this.onWorldEvent({
      type: "prompt",
      message: hotspot?.prompt ?? "Haz clic en el muelle para caminar",
    });
    this.game.canvas.style.cursor = hotspot ? "pointer" : "default";
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const hotspot = this.hotspots.find(
      (item) => item.enabled() && item.area.contains(worldPoint.x, worldPoint.y)
    );
    if (hotspot) {
      this.pendingTarget = hotspot.id;
      this.movePlayerTo(hotspot.approach.x, hotspot.approach.y);
      return;
    }
    this.pendingTarget = undefined;
    this.movePlayerTo(
      Phaser.Math.Clamp(worldPoint.x, 280, 1000),
      Phaser.Math.Clamp(worldPoint.y, WALK_MIN_Y, WORLD_HEIGHT - 55)
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
        if (target === "intro-token") this.collectToken();
        this.onWorldEvent({ type: "interact", target });
      },
    });
  }

  private enableToken() {
    this.tokenEnabled = true;
    this.token?.setVisible(true);
    this.onWorldEvent({ type: "prompt", message: "Busca la ficha dorada junto al puesto de noticias" });
  }

  private collectToken() {
    if (!this.token || !this.tokenEnabled) return;
    this.tokenEnabled = false;
    this.tweens.add({
      targets: this.token,
      y: this.token.y - 90,
      alpha: 0,
      scale: 1.7,
      duration: 500,
      ease: "Back.In",
      onComplete: () => this.token?.setVisible(false),
    });
    for (let index = 0; index < 12; index += 1) {
      const sparkle = this.add.circle(835, 485, 4 + (index % 3), 0xffdc68, 1).setDepth(1000);
      const angle = (Math.PI * 2 * index) / 12;
      this.tweens.add({
        targets: sparkle,
        x: 835 + Math.cos(angle) * 95,
        y: 485 + Math.sin(angle) * 75,
        alpha: 0,
        duration: 650,
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  private enableGate() {
    this.gateEnabled = true;
    this.gateGlow?.setFillStyle(0xf0c040, 0.24).setStrokeStyle(5, 0xffe48a, 0.95);
    this.onWorldEvent({ type: "prompt", message: "La puerta está abierta. Entra a Academia Ágora" });
  }

  private enterAcademy() {
    this.cameras.main.fadeOut(650, 8, 20, 34);
    this.time.delayedCall(620, () => this.onWorldEvent({ type: "introComplete" }));
  }

  private setAvatarColor(color: string) {
    this.drawPlayerBody(Phaser.Display.Color.HexStringToColor(color).color);
  }
}
