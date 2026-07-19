import Phaser from "phaser";
import {
  ACADEMY_GAME_EVENTS,
  type AcademyTarget,
  type AcademyWorldEventHandler,
} from "@/game/phaser/worldEvents";
import { drawAriaBody } from "@/game/phaser/characterArt";
import { BaseWorldScene } from "@/game/phaser/BaseWorldScene";

const ACADEMY_MAP_KEY = "academy-agora-map";
const ACADEMY_MASK_KEY = "academy-agora-walkmask";

/**
 * El overworld mide el doble del lienzo en cada eje: la cámara sigue al
 * jugador y sólo se ve un cuarto del mundo a la vez, que es lo que da sensación
 * de territorio. Al ser exactamente 2×, cada coordenada heredada del mapa de
 * 1280×720 es la vieja multiplicada por dos, y el diorama de Blender se autora
 * en este mismo espacio.
 */
const ACADEMY_WORLD_WIDTH = 2560;
const ACADEMY_WORLD_HEIGHT = 1440;

export default class AcademyAgoraScene extends BaseWorldScene {
  constructor(onWorldEvent: AcademyWorldEventHandler) {
    super(
      {
        room: "academy-agora",
        idlePrompt: "Haz clic en el suelo para caminar",
        world: { width: ACADEMY_WORLD_WIDTH, height: ACADEMY_WORLD_HEIGHT },
        // Sólo se usa si la máscara no cargara; con ella, el destino se
        // resuelve contra el terreno real y este rectángulo queda sin efecto.
        walkArea: {
          minX: 160,
          maxX: ACADEMY_WORLD_WIDTH - 160,
          minY: 340,
          maxY: ACADEMY_WORLD_HEIGHT - 110,
        },
        walkMask: {
          key: ACADEMY_MASK_KEY,
          path: "/assets/world/overworld_walkmask.png",
        },
        player: {
          x: 1460,
          y: 1040,
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
    // Diorama de blender/build_overworld.py. Sustituye al hero generado por IA:
    // este render y la máscara de caminabilidad salen de la misma cámara y la
    // misma geometría, así que el terreno y la colisión no pueden desalinearse.
    this.load.image(ACADEMY_MAP_KEY, "/assets/world/overworld.png");
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
    this.add.image(ACADEMY_WORLD_WIDTH / 2, ACADEMY_WORLD_HEIGHT / 2, ACADEMY_MAP_KEY)
      .setDisplaySize(ACADEMY_WORLD_WIDTH, ACADEMY_WORLD_HEIGHT)
      .setDepth(0);

    const atmosphere = this.add.graphics();
    atmosphere.setDepth(1);
    // Warm daylight wash: subtle sunny tint at the top, soft haze at the bottom
    atmosphere.fillGradientStyle(0xfff3cf, 0xfff3cf, 0xffffff, 0xffffff, 0.14, 0.14, 0.0, 0.06);
    atmosphere.fillRect(0, 0, ACADEMY_WORLD_WIDTH, ACADEMY_WORLD_HEIGHT);

    const hub = this.add.graphics();
    hub.setDepth(2);
    hub.lineStyle(3, 0xffffff, 0.55);
    hub.strokeCircle(1460, 820, 132);
    hub.lineStyle(2, 0xe5960a, 0.4);
    hub.strokeCircle(1460, 820, 176);

    this.drawDistrictMarker(1930, 524, 0x33b77a, "Mercado Plaza", "Aprende: oferta y demanda", "M1.1");
    this.drawDistrictMarker(1032, 1008, 0xe8743b, "Taller de Velas", "Aprende: velas OHLC", "M1.2");
    this.drawDistrictMarker(744, 788, 0x8b72ff, "Observatorio", "Aprende: tendencias", "M1.3");
    this.drawDistrictMarker(1610, 392, 0xf7931a, "Ciudad Bitcoin", "Se abre al dominar la isla", "BTC");
    this.drawDistrictMarker(1460, 820, 0xe5960a, "Academia Ágora", "Tu punto de partida", "TP");

    // Rótulos anclados al lienzo: con la cámara desplazándose, en coordenadas
    // de mundo se irían de pantalla en cuanto el jugador caminara.
    this.add.text(36, 28, "ACADEMIA ÁGORA", {
      color: "#ffffff",
      fontFamily: "Baloo 2, DM Sans, sans-serif",
      fontSize: "26px",
      fontStyle: "bold",
      stroke: "#1e2a44",
      strokeThickness: 6,
    }).setDepth(20).setScrollFactor(0);
    this.add.text(38, 62, "Isla inicial · aprende fundamentos antes de viajar a otros mercados", {
      color: "#ffffff",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "12px",
      stroke: "#1e2a44",
      strokeThickness: 4,
    }).setDepth(20).setScrollFactor(0);
  }

  private drawDistrictMarker(
    x: number,
    y: number,
    color: number,
    title: string,
    subtitle: string,
    tag: string
  ) {
    // Profundidad = su posición en el mundo, igual que el jugador y ARIA. Antes
    // era y + 120, que metía al jugador por detrás de marcadores más lejanos
    // que él: un pin en y=262 quedaba delante de alguien parado en y=300.
    const marker = this.add.container(x, y).setDepth(y);
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
        area: new Phaser.Geom.Rectangle(1780, 390, 380, 320),
        approach: new Phaser.Math.Vector2(1700, 740),
        prompt: "Entrar a Mercado Plaza · Misión 1.1",
      },
      {
        id: "candle-workshop",
        area: new Phaser.Geom.Rectangle(860, 880, 430, 290),
        approach: new Phaser.Math.Vector2(1240, 1070),
        prompt: "Entrar al Taller de Velas · Misión 1.2",
      },
      {
        id: "trend-observatory",
        area: new Phaser.Geom.Rectangle(580, 630, 400, 300),
        approach: new Phaser.Math.Vector2(1020, 880),
        prompt: "Entrar al Observatorio · Misión 1.3",
      },
      {
        id: "bitcoin-portal",
        area: new Phaser.Geom.Rectangle(1440, 230, 380, 320),
        // Movido de (770,310) a (772,296). Con el hero pintado daba igual —
        // todo el mapa era pisable. En el diorama de Blender ese punto cae en
        // el canal entre la isla central y la de Ciudad Bitcoin; la máscara de
        // caminabilidad lo marca como agua. (772,296) era el caminable más
        // cercano, sobre el puente; ×2 en el mundo actual. Ver
        // blender/build_overworld.py.
        approach: new Phaser.Math.Vector2(1544, 592),
        prompt: "Examinar el portal hacia Ciudad Bitcoin",
      },
      {
        id: "aria",
        area: new Phaser.Geom.Rectangle(1320, 680, 330, 270),
        approach: new Phaser.Math.Vector2(1460, 1000),
        prompt: "Hablar con ARIA",
      },
    ];
  }

  private createAria() {
    const aria = this.add.container(1460, 880);
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
