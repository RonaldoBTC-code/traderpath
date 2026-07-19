import Phaser from "phaser";
import {
  ACADEMY_GAME_EVENTS,
  type AcademyTarget,
  type AcademyWorldEventHandler,
} from "@/game/phaser/worldEvents";
import { drawAriaBody } from "@/game/phaser/characterArt";
import { BaseWorldScene, WORLD_HEIGHT, WORLD_WIDTH } from "@/game/phaser/BaseWorldScene";

const ACADEMY_MAP_KEY = "academy-agora-map";

export default class AcademyAgoraScene extends BaseWorldScene {
  constructor(onWorldEvent: AcademyWorldEventHandler) {
    super(
      {
        room: "academy-agora",
        idlePrompt: "Haz clic en el suelo para caminar",
        walkArea: { minX: 80, maxX: WORLD_WIDTH - 80, minY: 170, maxY: WORLD_HEIGHT - 55 },
        player: {
          x: 730,
          y: 520,
          shadowColor: 0x1e2a44,
          shadowAlpha: 0.3,
          fallbackColor: 0xe5960a,
          labelStyle: {
            color: "#ffffff",
            fontFamily: "Baloo 2, DM Sans, sans-serif",
            fontSize: "11px",
            fontStyle: "bold",
            stroke: "#1e2a44",
            strokeThickness: 4,
          },
        },
        markerColor: 0xe5960a,
        walkSpeed: 2.2,
      },
      onWorldEvent
    );
  }

  preload() {
    super.preload();
    this.load.image(ACADEMY_MAP_KEY, "/assets/traderpath-world-hero.png");
  }

  create() {
    this.cameras.main.setBackgroundColor("#8ecdea");
    this.drawRoom();
    this.createHotspots();
    this.createAria();
    this.createWorldBase();
    this.registerGameEvent(ACADEMY_GAME_EVENTS.focusTarget, this.focusTarget);

    this.onWorldEvent({ type: "ready", room: "academy-agora" });
    this.onWorldEvent({ type: "prompt", message: "Haz clic en el suelo para caminar" });
  }

  private drawRoom() {
    this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, ACADEMY_MAP_KEY)
      .setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT)
      .setDepth(0);

    const atmosphere = this.add.graphics();
    atmosphere.setDepth(1);
    // Warm daylight wash: subtle sunny tint at the top, soft haze at the bottom
    atmosphere.fillGradientStyle(0xfff3cf, 0xfff3cf, 0xffffff, 0xffffff, 0.14, 0.14, 0.0, 0.06);
    atmosphere.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const hub = this.add.graphics();
    hub.setDepth(2);
    hub.lineStyle(3, 0xffffff, 0.55);
    hub.strokeCircle(730, 410, 66);
    hub.lineStyle(2, 0xe5960a, 0.4);
    hub.strokeCircle(730, 410, 88);

    this.drawDistrictMarker(965, 262, 0x33b77a, "Mercado Plaza", "Aprende: oferta y demanda", "M1.1");
    this.drawDistrictMarker(516, 504, 0xe8743b, "Taller de Velas", "Aprende: velas OHLC", "M1.2");
    this.drawDistrictMarker(372, 394, 0x8b72ff, "Observatorio", "Aprende: tendencias", "M1.3");
    this.drawDistrictMarker(805, 196, 0xf7931a, "Ciudad Bitcoin", "Se abre al dominar la isla", "BTC");
    this.drawDistrictMarker(730, 410, 0xe5960a, "Academia Ágora", "Tu punto de partida", "TP");

    this.add.text(36, 28, "ACADEMIA ÁGORA", {
      color: "#ffffff",
      fontFamily: "Baloo 2, DM Sans, sans-serif",
      fontSize: "26px",
      fontStyle: "bold",
      stroke: "#1e2a44",
      strokeThickness: 6,
    }).setDepth(20);
    this.add.text(38, 62, "Isla inicial · aprende fundamentos antes de viajar a otros mercados", {
      color: "#ffffff",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "12px",
      stroke: "#1e2a44",
      strokeThickness: 4,
    }).setDepth(20);
  }

  private drawDistrictMarker(
    x: number,
    y: number,
    color: number,
    title: string,
    subtitle: string,
    tag: string
  ) {
    const marker = this.add.container(x, y).setDepth(y + 120);
    const pulse = this.add.circle(0, 0, 34, color, 0.12);
    pulse.setStrokeStyle(2, color, 0.42);

    const pin = this.add.graphics();
    pin.fillStyle(0xffffff, 0.95);
    pin.fillCircle(0, 0, 20);
    pin.lineStyle(4, color, 1);
    pin.strokeCircle(0, 0, 20);
    pin.fillStyle(color, 1);
    pin.fillCircle(0, 0, 7);

    const label = this.add.container(0, -48);
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.95);
    panel.fillRoundedRect(-92, -31, 184, 56, 16);
    panel.lineStyle(2.5, color, 0.9);
    panel.strokeRoundedRect(-92, -31, 184, 56, 16);
    const titleText = this.add.text(0, -19, title, {
      color: "#1e2a44",
      fontFamily: "Baloo 2, DM Sans, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
      align: "center",
    }).setOrigin(0.5);
    const subtitleText = this.add.text(0, 1, subtitle, {
      color: "#5d6e8c",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "9px",
      align: "center",
    }).setOrigin(0.5);
    const tagText = this.add.text(0, 18, tag, {
      color: "#ffffff",
      backgroundColor: Phaser.Display.Color.IntegerToColor(color).rgba,
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "8px",
      fontStyle: "bold",
      padding: { x: 7, y: 2 },
    }).setOrigin(0.5);
    label.add([panel, titleText, subtitleText, tagText]);

    marker.add([pulse, pin, label]);
    this.tweens.add({
      targets: pulse,
      alpha: { from: 0.65, to: 0.15 },
      scale: { from: 0.85, to: 1.35 },
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  private createHotspots() {
    this.hotspots = [
      {
        id: "market-plaza",
        area: new Phaser.Geom.Rectangle(890, 195, 190, 160),
        approach: new Phaser.Math.Vector2(850, 370),
        prompt: "Entrar a Mercado Plaza · Misión 1.1",
      },
      {
        id: "candle-workshop",
        area: new Phaser.Geom.Rectangle(430, 440, 215, 145),
        approach: new Phaser.Math.Vector2(620, 535),
        prompt: "Entrar al Taller de Velas · Misión 1.2",
      },
      {
        id: "trend-observatory",
        area: new Phaser.Geom.Rectangle(290, 315, 200, 150),
        approach: new Phaser.Math.Vector2(510, 440),
        prompt: "Entrar al Observatorio · Misión 1.3",
      },
      {
        id: "bitcoin-portal",
        area: new Phaser.Geom.Rectangle(720, 115, 190, 160),
        approach: new Phaser.Math.Vector2(770, 310),
        prompt: "Examinar el portal hacia Ciudad Bitcoin",
      },
      {
        id: "aria",
        area: new Phaser.Geom.Rectangle(660, 340, 165, 135),
        approach: new Phaser.Math.Vector2(730, 500),
        prompt: "Hablar con ARIA",
      },
    ];
  }

  private createAria() {
    const aria = this.add.container(730, 440);
    const shadow = this.add.ellipse(0, 38, 70, 22, 0x1e2a44, 0.18);
    const body = this.add.graphics();
    drawAriaBody(body);
    const label = this.add.text(0, 58, "ARIA", {
      color: "#ffffff",
      fontFamily: "Baloo 2, DM Sans, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      stroke: "#2563eb",
      strokeThickness: 4,
    }).setOrigin(0.5);
    const icon = this.add.text(0, -96, "!", {
      color: "#1e2a44",
      backgroundColor: "#f5b301",
      fontFamily: "Baloo 2, DM Sans, sans-serif",
      fontSize: "17px",
      fontStyle: "bold",
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5);
    aria.add([shadow, body, label, icon]);
    aria.setDepth(aria.y);
    this.tweens.add({ targets: icon, y: -102, duration: 900, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    this.tweens.add({ targets: body, y: -3, duration: 1600, yoyo: true, repeat: -1, ease: "Sine.InOut" });
  }

  private focusTarget(target: AcademyTarget) {
    const hotspot = this.hotspots.find((item) => item.id === target);
    if (!hotspot) return;
    this.pendingTarget = target;
    this.movePlayerTo(hotspot.approach.x, hotspot.approach.y);
  }
}
