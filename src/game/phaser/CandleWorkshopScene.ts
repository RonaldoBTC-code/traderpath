import Phaser from "phaser";
import {
  ACADEMY_GAME_EVENTS,
  type AcademyWorldEventHandler,
  type CandleTarget,
} from "@/game/phaser/worldEvents";
import { BaseWorldScene, WORLD_HEIGHT, WORLD_WIDTH } from "@/game/phaser/BaseWorldScene";

/** Demo candle: O=100, H=110, L=95, C=108 (alcista) */
const DEMO = { open: 100, high: 110, low: 95, close: 108 };

export default class CandleWorkshopScene extends BaseWorldScene {
  private candleGraphics?: Phaser.GameObjects.Graphics;
  private practiceGlow?: Phaser.GameObjects.Arc;
  private statusText?: Phaser.GameObjects.Text;

  private openVisited = false;
  private highVisited = false;
  private lowVisited = false;
  private closeVisited = false;
  private directionVisited = false;
  private bodyVisited = false;
  private upperWickVisited = false;
  private lowerWickVisited = false;

  constructor(onWorldEvent: AcademyWorldEventHandler) {
    super(
      {
        room: "candle-workshop",
        idlePrompt: "Haz clic en el suelo para caminar",
        walkArea: { minX: 80, maxX: WORLD_WIDTH - 80, minY: 520, maxY: WORLD_HEIGHT - 55 },
        player: {
          x: 640,
          y: 620,
          shadowColor: 0x1e2a44,
          shadowAlpha: 0.4,
          fallbackColor: 0xe5960a,
          labelStyle: {
            color: "#1e2a44",
            fontFamily: "DM Sans, sans-serif",
            fontSize: "11px",
            fontStyle: "bold",
          },
        },
        markerColor: 0xe5960a,
        walkSpeed: 2.1,
      },
      onWorldEvent
    );
  }

  create() {
    this.cameras.main.setBackgroundColor("#f6e7cd");
    this.drawWorkshop();
    this.createCentralCandle();
    this.createHotspots();
    this.createWorldBase();

    this.registerGameEvent(ACADEMY_GAME_EVENTS.candleProgress, this.setCandleProgress);

    this.cameras.main.fadeIn(450, 10, 14, 26);
    this.onWorldEvent({ type: "ready", room: "candle-workshop" });
    this.onWorldEvent({ type: "prompt", message: "Visita las estaciones OHLC para construir tu primera vela" });
  }

  private drawWorkshop() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xf6e7cd, 0xf6e7cd, 0xffffff, 0xffffff, 1);
    bg.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Neon grid floor
    bg.lineStyle(1, 0xd9c9a8, 0.6);
    for (let x = 0; x < WORLD_WIDTH; x += 64) bg.lineBetween(x, 380, x, WORLD_HEIGHT);
    for (let y = 380; y < WORLD_HEIGHT; y += 48) bg.lineBetween(0, y, WORLD_WIDTH, y);

    // Workshop walls
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(40, 60, 1200, 300, 20);
    bg.lineStyle(3, 0xe5960a, 0.25);
    bg.strokeRoundedRect(40, 60, 1200, 300, 20);

    // Central workbench
    bg.fillStyle(0xfdf3e0, 1);
    bg.fillRoundedRect(440, 280, 400, 200, 18);
    bg.lineStyle(4, 0xe5960a, 0.4);
    bg.strokeRoundedRect(440, 280, 400, 200, 18);
    this.add.text(640, 298, "MESA CENTRAL · VELA OHLC", {
      color: "#e5960a",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(310);

    this.drawStation(120, 200, 0x2563eb, "OPEN", "Apertura · O", "candle-open");
    this.drawStation(1060, 200, 0xe5960a, "HIGH", "Máximo · H", "candle-high");
    this.drawStation(120, 420, 0xdc2626, "LOW", "Mínimo · L", "candle-low");
    this.drawStation(1060, 420, 0x16a34a, "CLOSE", "Cierre · C", "candle-close");

    this.drawConceptStation(310, 130, "DIRECCIÓN", "Alcista / Bajista", 0x16a34a);
    this.drawConceptStation(970, 130, "CUERPO", "|C − O|", 0xe5960a);
    this.drawConceptStation(310, 490, "MECHA SUP.", "H − max(O,C)", 0x2563eb);
    this.drawConceptStation(970, 490, "MECHA INF.", "min(O,C) − L", 0xdc2626);

    this.drawPracticeGate(bg);
    this.drawExit(bg);

    this.add.text(36, 28, "TALLER DE VELAS", {
      color: "#e5960a",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "22px",
      fontStyle: "bold",
      stroke: "#f6e7cd",
      strokeThickness: 5,
    }).setDepth(20);
    this.add.text(38, 58, "Misión 1.2 · Construye y comprende una vela japonesa", {
      color: "#5d6e8c",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "12px",
    }).setDepth(20);
  }

  private drawStation(x: number, y: number, color: number, label: string, subtitle: string, _id: string) {
    const g = this.add.graphics();
    g.fillStyle(0xf6e7cd, 0.5);
    g.fillRoundedRect(x - 8, y - 8, 176, 130, 16);
    g.fillStyle(color, 0.15);
    g.fillRoundedRect(x, y, 160, 114, 14);
    g.lineStyle(3, color, 0.7);
    g.strokeRoundedRect(x, y, 160, 114, 14);
    this.add.text(x + 80, y + 28, label, {
      color: "#1e2a44",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "14px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(y + 120);
    this.add.text(x + 80, y + 52, subtitle, {
      color: "#5d6e8c",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "10px",
    }).setOrigin(0.5).setDepth(y + 120);
  }

  private drawConceptStation(x: number, y: number, label: string, formula: string, color: number) {
    const g = this.add.graphics();
    g.fillStyle(color, 0.08);
    g.fillRoundedRect(x, y, 155, 72, 12);
    g.lineStyle(2, color, 0.35);
    g.strokeRoundedRect(x, y, 155, 72, 12);
    this.add.text(x + 77, y + 22, label, {
      color: "#1e2a44",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(y + 80);
    this.add.text(x + 77, y + 44, formula, {
      color: "#5d6e8c",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "9px",
    }).setOrigin(0.5).setDepth(y + 80);
  }

  private drawPracticeGate(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(530, 95, 220, 155, 32);
    graphics.lineStyle(5, 0x16a34a, 0.3);
    graphics.strokeRoundedRect(530, 95, 220, 155, 32);
    this.practiceGlow = this.add.circle(640, 172, 42, 0x16a34a, 0.02).setDepth(204);
    this.practiceGlow.setStrokeStyle(4, 0x16a34a, 0.12);
    this.add.text(640, 118, "EVALUACIÓN", {
      color: "#1e2a44",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(205);
    this.add.text(640, 140, "M1.2", {
      color: "#e5960a",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "10px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(205);
    this.statusText = this.add.text(640, 228, "Completa la práctica física primero", {
      color: "#5d6e8c",
      backgroundColor: "#fdf3e0",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "10px",
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setDepth(206);
  }

  private drawExit(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0xfdf3e0, 1);
    graphics.fillRoundedRect(28, 600, 155, 75, 24);
    graphics.lineStyle(2, 0xe5960a, 0.3);
    graphics.strokeRoundedRect(28, 600, 155, 75, 24);
    this.add.text(105, 623, "← ACADEMIA", {
      color: "#1e2a44",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(680);
    this.add.text(105, 647, "Salir del taller", {
      color: "#5d6e8c",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "9px",
    }).setOrigin(0.5).setDepth(680);
  }

  private createCentralCandle() {
    this.candleGraphics = this.add.graphics().setDepth(305);
    this.redrawCandle();
  }

  private priceToY(price: number, mid: number, cy: number, scale: number) {
    return cy - (price - mid) * scale;
  }

  private redrawCandle() {
    if (!this.candleGraphics) return;
    this.candleGraphics.clear();

    const cx = 640;
    const cy = 390;
    const scale = 6;
    const { open, high, low, close } = DEMO;
    const mid = (high + low) / 2;
    const bullish = close >= open;
    const bodyTop = Math.max(open, close);
    const bodyBottom = Math.min(open, close);
    const bodyColor = bullish ? 0x16a34a : 0xdc2626;

    const topY = this.priceToY(high, mid, cy, scale);
    const bottomY = this.priceToY(low, mid, cy, scale);
    const bodyTopY = this.priceToY(bodyTop, mid, cy, scale);
    const bodyBottomY = this.priceToY(bodyBottom, mid, cy, scale);

    this.candleGraphics.lineStyle(1, 0xd9c9a8, 0.8);
    this.candleGraphics.lineBetween(cx - 70, cy + 70, cx + 70, cy + 70);

    if (!this.openVisited && !this.highVisited && !this.lowVisited && !this.closeVisited) {
      this.candleGraphics.fillStyle(0xd9c9a8, 0.5);
      this.candleGraphics.fillRoundedRect(cx - 30, cy - 20, 60, 40, 6);
      return;
    }

    if (this.openVisited && this.highVisited && this.lowVisited && this.closeVisited) {
      this.candleGraphics.lineStyle(2, bodyColor, 0.55);
      this.candleGraphics.lineBetween(cx, topY, cx, bodyTopY);
      this.candleGraphics.lineBetween(cx, bodyBottomY, cx, bottomY);
    }

    if (this.bodyVisited || (this.openVisited && this.closeVisited)) {
      const bodyH = Math.max(bodyBottomY - bodyTopY, 4);
      this.candleGraphics.fillStyle(bodyColor, this.bodyVisited ? 1 : 0.4);
      this.candleGraphics.fillRect(cx - 18, bodyTopY, 36, bodyH);
    }

    const labelStyle = { color: "#5d6e8c", fontSize: "9px", fontFamily: "JetBrains Mono, monospace" };
    if (this.openVisited) {
      const y = this.priceToY(open, mid, cy, scale);
      this.candleGraphics.lineStyle(2, 0x2563eb, 0.8);
      this.candleGraphics.lineBetween(cx - 55, y, cx + 55, y);
      this.add.text(cx + 62, y, `O ${open}`, labelStyle).setOrigin(0, 0.5).setDepth(306);
    }
    if (this.highVisited) {
      const y = topY;
      this.candleGraphics.lineStyle(2, 0xe5960a, 0.8);
      this.candleGraphics.lineBetween(cx - 55, y, cx + 55, y);
      this.add.text(cx + 62, y, `H ${high}`, labelStyle).setOrigin(0, 0.5).setDepth(306);
    }
    if (this.lowVisited) {
      const y = bottomY;
      this.candleGraphics.lineStyle(2, 0xdc2626, 0.8);
      this.candleGraphics.lineBetween(cx - 55, y, cx + 55, y);
      this.add.text(cx + 62, y, `L ${low}`, labelStyle).setOrigin(0, 0.5).setDepth(306);
    }
    if (this.closeVisited) {
      const y = this.priceToY(close, mid, cy, scale);
      this.candleGraphics.lineStyle(2, 0x16a34a, 0.8);
      this.candleGraphics.lineBetween(cx - 55, y, cx + 55, y);
      this.add.text(cx + 62, y, `C ${close}`, labelStyle).setOrigin(0, 0.5).setDepth(306);
    }

    if (this.directionVisited) {
      this.add.text(cx, cy + 58, bullish ? "▲ ALCISTA" : "▼ BAJISTA", {
        color: bullish ? "#16a34a" : "#dc2626",
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: "11px",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(307);
    }
    if (this.bodyVisited) {
      const bodySize = Math.abs(close - open);
      this.add.text(cx - 90, cy, `Cuerpo: ${bodySize}`, {
        color: "#e5960a",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "9px",
      }).setOrigin(1, 0.5).setDepth(307);
    }
    if (this.upperWickVisited) {
      const upper = high - bodyTop;
      this.add.text(cx + 90, bodyTopY - 12, `Mecha sup: ${upper}`, {
        color: "#2563eb",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "9px",
      }).setOrigin(0, 0.5).setDepth(307);
    }
    if (this.lowerWickVisited) {
      const lower = bodyBottom - low;
      this.add.text(cx + 90, bodyBottomY + 12, `Mecha inf: ${lower}`, {
        color: "#dc2626",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "9px",
      }).setOrigin(0, 0.5).setDepth(307);
    }
  }

  private allOhlcVisited() {
    return this.openVisited && this.highVisited && this.lowVisited && this.closeVisited;
  }

  private allConceptsVisited() {
    return this.directionVisited && this.bodyVisited && this.upperWickVisited && this.lowerWickVisited;
  }

  private practiceReady() {
    return this.allOhlcVisited() && this.allConceptsVisited();
  }

  private createHotspots() {
    this.hotspots = [
      {
        id: "candle-open",
        area: new Phaser.Geom.Rectangle(110, 190, 180, 130),
        approach: new Phaser.Math.Vector2(280, 520),
        prompt: "Estación Open · leer la apertura",
        enabled: () => true,
      },
      {
        id: "candle-high",
        area: new Phaser.Geom.Rectangle(1050, 190, 180, 130),
        approach: new Phaser.Math.Vector2(1000, 520),
        prompt: "Estación High · leer el máximo",
        enabled: () => true,
      },
      {
        id: "candle-low",
        area: new Phaser.Geom.Rectangle(110, 410, 180, 130),
        approach: new Phaser.Math.Vector2(280, 560),
        prompt: "Estación Low · leer el mínimo",
        enabled: () => true,
      },
      {
        id: "candle-close",
        area: new Phaser.Geom.Rectangle(1050, 410, 180, 130),
        approach: new Phaser.Math.Vector2(1000, 560),
        prompt: "Estación Close · leer el cierre",
        enabled: () => true,
      },
      {
        id: "candle-direction",
        area: new Phaser.Geom.Rectangle(300, 120, 165, 85),
        approach: new Phaser.Math.Vector2(400, 350),
        prompt: "Calcular dirección de la vela",
        enabled: () => this.allOhlcVisited(),
      },
      {
        id: "candle-direction-locked",
        area: new Phaser.Geom.Rectangle(300, 120, 165, 85),
        approach: new Phaser.Math.Vector2(400, 350),
        prompt: "Primero visita Open, High, Low y Close",
        enabled: () => !this.allOhlcVisited(),
      },
      {
        id: "candle-body",
        area: new Phaser.Geom.Rectangle(960, 120, 165, 85),
        approach: new Phaser.Math.Vector2(880, 350),
        prompt: "Calcular el cuerpo de la vela",
        enabled: () => this.allOhlcVisited() && this.directionVisited,
      },
      {
        id: "candle-body-locked",
        area: new Phaser.Geom.Rectangle(960, 120, 165, 85),
        approach: new Phaser.Math.Vector2(880, 350),
        prompt: "Primero comprende la dirección",
        enabled: () => this.allOhlcVisited() && !this.directionVisited,
      },
      {
        id: "candle-upper-wick",
        area: new Phaser.Geom.Rectangle(300, 480, 165, 85),
        approach: new Phaser.Math.Vector2(400, 580),
        prompt: "Calcular la mecha superior",
        enabled: () => this.allOhlcVisited() && this.directionVisited && this.bodyVisited,
      },
      {
        id: "candle-upper-wick-locked",
        area: new Phaser.Geom.Rectangle(300, 480, 165, 85),
        approach: new Phaser.Math.Vector2(400, 580),
        prompt: "Primero calcula el cuerpo",
        enabled: () => this.allOhlcVisited() && this.directionVisited && !this.bodyVisited,
      },
      {
        id: "candle-lower-wick",
        area: new Phaser.Geom.Rectangle(960, 480, 165, 85),
        approach: new Phaser.Math.Vector2(880, 580),
        prompt: "Calcular la mecha inferior",
        enabled: () => this.allOhlcVisited() && this.bodyVisited && this.upperWickVisited,
      },
      {
        id: "candle-lower-wick-locked",
        area: new Phaser.Geom.Rectangle(960, 480, 165, 85),
        approach: new Phaser.Math.Vector2(880, 580),
        prompt: "Primero calcula la mecha superior",
        enabled: () => this.allOhlcVisited() && this.bodyVisited && this.upperWickVisited && !this.lowerWickVisited,
      },
      {
        id: "candle-practice",
        area: new Phaser.Geom.Rectangle(520, 85, 240, 175),
        approach: new Phaser.Math.Vector2(640, 310),
        prompt: "Entrar a la evaluación M1.2",
        enabled: () => this.practiceReady(),
      },
      {
        id: "candle-practice-locked",
        area: new Phaser.Geom.Rectangle(520, 85, 240, 175),
        approach: new Phaser.Math.Vector2(640, 310),
        prompt: "Completa todas las estaciones primero",
        enabled: () => !this.practiceReady(),
      },
      {
        id: "candle-exit",
        area: new Phaser.Geom.Rectangle(15, 590, 185, 95),
        approach: new Phaser.Math.Vector2(210, 625),
        prompt: "Volver a Academia Ágora",
        enabled: () => true,
      },
    ];
  }

  private setCandleProgress(progress: {
    openVisited: boolean;
    highVisited: boolean;
    lowVisited: boolean;
    closeVisited: boolean;
    directionVisited: boolean;
    bodyVisited: boolean;
    upperWickVisited: boolean;
    lowerWickVisited: boolean;
  }) {
    this.openVisited = progress.openVisited;
    this.highVisited = progress.highVisited;
    this.lowVisited = progress.lowVisited;
    this.closeVisited = progress.closeVisited;
    this.directionVisited = progress.directionVisited;
    this.bodyVisited = progress.bodyVisited;
    this.upperWickVisited = progress.upperWickVisited;
    this.lowerWickVisited = progress.lowerWickVisited;

    // Remove old price labels before redraw
    this.children.list
      .filter((child) => child instanceof Phaser.GameObjects.Text && child.depth === 306)
      .forEach((child) => child.destroy());
    this.children.list
      .filter((child) => child instanceof Phaser.GameObjects.Text && child.depth === 307)
      .forEach((child) => child.destroy());

    this.redrawCandle();

    const ohlcCount = [this.openVisited, this.highVisited, this.lowVisited, this.closeVisited].filter(Boolean).length;
    const conceptCount = [this.directionVisited, this.bodyVisited, this.upperWickVisited, this.lowerWickVisited].filter(Boolean).length;

    if (this.practiceReady()) {
      this.statusText?.setText("¡Vela completa! Evaluación desbloqueada");
      this.practiceGlow?.setFillStyle(0x16a34a, 0.22).setStrokeStyle(5, 0x16a34a, 0.95);
      this.tweens.add({
        targets: this.practiceGlow,
        alpha: { from: 0.45, to: 1 },
        scale: { from: 0.9, to: 1.12 },
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
      this.onWorldEvent({ type: "prompt", message: "Evaluación desbloqueada: demuestra lo aprendido" });
    } else if (ohlcCount === 4 && conceptCount < 4) {
      this.statusText?.setText(`Conceptos: ${conceptCount}/4 · continúa explorando`);
    } else {
      this.statusText?.setText(`OHLC: ${ohlcCount}/4 · visita cada estación`);
    }
  }
}
