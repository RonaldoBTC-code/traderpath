import * as Phaser from "phaser";
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

/**
 * Distritos de la isla, fuente única de sus coordenadas. Alimenta a la vez los
 * marcadores dibujados en el mundo y los destinos del minimapa: así el pin del
 * minimapa no puede desalinearse del marcador. Las entradas con `target` son
 * lugares a los que se viaja; la del hub (Academia Ágora) no lo tiene.
 */
interface District {
  x: number;
  y: number;
  color: number;
  title: string;
  subtitle: string;
  tag: string;
  target?: AcademyTarget;
}

const DISTRICTS: District[] = [
  { target: "market-plaza", x: 2080, y: 760, color: 0x33b77a, title: "Mercado Plaza", subtitle: "Aprende: oferta y demanda", tag: "M1.1" },
  { target: "candle-workshop", x: 520, y: 1080, color: 0xe8743b, title: "Taller de Velas", subtitle: "Aprende: velas OHLC", tag: "M1.2" },
  { target: "trend-observatory", x: 420, y: 560, color: 0x8b72ff, title: "Observatorio", subtitle: "Aprende: tendencias", tag: "M1.3" },
  { target: "risk-vault", x: 1000, y: 1240, color: 0x2563eb, title: "La Bóveda", subtitle: "Aprende: gestión de riesgo", tag: "M1.4" },
  { target: "challenge-arena", x: 1660, y: 1120, color: 0xa855f7, title: "Arena del Desafío", subtitle: "Pon a prueba lo aprendido", tag: "M1.5" },
  { target: "bitcoin-portal", x: 1760, y: 380, color: 0xf7931a, title: "Ciudad Bitcoin", subtitle: "Se abre al dominar la isla", tag: "BTC" },
  { x: 1180, y: 780, color: 0xe5960a, title: "Academia Ágora", subtitle: "Tu punto de partida", tag: "TP" },
];

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
          path: "/assets/world/overworld_walkmask.webp",
        },
        player: {
          x: 1180,
          y: 1000,
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
    // Diorama de renders/blender/build_overworld.py. Sustituye al hero generado por IA:
    // este render y la máscara de caminabilidad salen de la misma cámara y la
    // misma geometría, así que el terreno y la colisión no pueden desalinearse.
    // WebP: en PNG este diorama pesaba ~4 MB y el presupuesto de carga inicial
    // del roadmap es de 8 MB para todo el juego.
    this.load.image(ACADEMY_MAP_KEY, "/assets/world/overworld.webp");
  }

  create() {
    this.cameras.main.setBackgroundColor("#8ecdea");
    this.drawRoom();
    this.createHotspots();
    this.createAria();
    this.createWorldBase();
    this.registerGameEvent(ACADEMY_GAME_EVENTS.focusTarget, this.focusTarget);

    this.onWorldEvent({ type: "ready", room: "academy-agora" });
    // Destinos para el minimapa: mismas coordenadas que los marcadores.
    this.onWorldEvent({
      type: "world",
      room: "academy-agora",
      width: ACADEMY_WORLD_WIDTH,
      height: ACADEMY_WORLD_HEIGHT,
      destinations: DISTRICTS.filter((d) => d.target).map((d) => ({
        id: d.target as AcademyTarget,
        x: d.x,
        y: d.y,
      })),
    });
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
    hub.strokeCircle(1180, 780, 132);
    hub.lineStyle(2, 0xe5960a, 0.4);
    hub.strokeCircle(1180, 780, 176);

    for (const d of DISTRICTS) {
      this.drawDistrictMarker(d.x, d.y, d.color, d.title, d.subtitle, d.tag);
    }

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
        area: new Phaser.Geom.Rectangle(1900, 580, 400, 340),
        approach: new Phaser.Math.Vector2(1815, 758),
        prompt: "Entrar a Mercado Plaza · Misión 1.1",
      },
      {
        id: "candle-workshop",
        area: new Phaser.Geom.Rectangle(330, 900, 400, 340),
        approach: new Phaser.Math.Vector2(786, 1011),
        prompt: "Entrar al Taller de Velas · Misión 1.2",
      },
      {
        id: "trend-observatory",
        area: new Phaser.Geom.Rectangle(240, 390, 380, 330),
        approach: new Phaser.Math.Vector2(661, 598),
        prompt: "Entrar al Observatorio · Misión 1.3",
      },
      {
        id: "risk-vault",
        area: new Phaser.Geom.Rectangle(830, 1080, 360, 300),
        approach: new Phaser.Math.Vector2(1120, 1200),
        prompt: "Entrar a La Bóveda · Misión 1.4",
      },
      {
        id: "challenge-arena",
        area: new Phaser.Geom.Rectangle(1490, 960, 360, 320),
        approach: new Phaser.Math.Vector2(1467, 1163),
        prompt: "Entrar a la Arena del Desafío · Misión 1.5",
      },
      {
        id: "bitcoin-portal",
        area: new Phaser.Geom.Rectangle(1580, 200, 380, 340),
        // Movido de (770,310) a (772,296). Con el hero pintado daba igual —
        // todo el mapa era pisable. En el diorama de Blender ese punto cae en
        // el canal entre la isla central y la de Ciudad Bitcoin; la máscara de
        // caminabilidad lo marca como agua: el punto está sobre el puente
        // norte, que es la única vía a la isla. Ver renders/blender/build_overworld.py.
        approach: new Phaser.Math.Vector2(1660, 640),
        prompt: "Examinar el portal hacia Ciudad Bitcoin",
      },
      {
        id: "aria",
        area: new Phaser.Geom.Rectangle(1080, 830, 300, 250),
        approach: new Phaser.Math.Vector2(1225, 976),
        prompt: "Hablar con ARIA",
      },
    ];
  }

  private createAria() {
    const aria = this.add.container(1225, 900);
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
