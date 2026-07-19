import Phaser from "phaser";
import {
  ACADEMY_GAME_EVENTS,
  type AcademyTarget,
  type AcademyWorldEventHandler,
} from "@/game/phaser/worldEvents";
import {
  drawAriaBody,
  drawExplorerBody,
  explorerTextureKey,
  preloadExplorerSprite,
} from "@/game/phaser/characterArt";

interface Hotspot {
  id: AcademyTarget;
  area: Phaser.Geom.Rectangle;
  approach: Phaser.Math.Vector2;
  prompt: string;
}

const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 720;
const WALK_MIN_Y = 170;
const ACADEMY_MAP_KEY = "academy-agora-map";

export default class AcademyAgoraScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Container;
  private playerBody?: Phaser.GameObjects.Graphics;
  private playerSprite?: Phaser.GameObjects.Image;
  private destinationMarker?: Phaser.GameObjects.Arc;
  private movementTween?: Phaser.Tweens.Tween;
  private pendingTarget?: AcademyTarget;
  private hoveredTarget?: AcademyTarget;
  private hotspots: Hotspot[] = [];

  constructor(private readonly onWorldEvent: AcademyWorldEventHandler) {
    super("academy-agora");
  }

  preload() {
    this.load.image(ACADEMY_MAP_KEY, "/assets/traderpath-world-hero.png");
    preloadExplorerSprite(this);
  }

  create() {
    this.cameras.main.setBackgroundColor("#8ecdea");
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

  private createPlayer() {
    const player = this.add.container(730, 520);
    const shadow = this.add.ellipse(0, 38, 64, 20, 0x1e2a44, 0.3);

    // Prefer the Blender-rendered sprite; fall back to the vector body so the
    // world keeps working before build_explorer.py has produced the PNG.
    let avatar: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
    const textureKey = explorerTextureKey(this);
    if (textureKey) {
      const sprite = this.add.image(0, -6, textureKey);
      this.sizeAvatarSprite(sprite);
      this.playerBody = undefined;
      this.playerSprite = sprite;
      avatar = sprite;
    } else {
      const body = this.add.graphics();
      this.playerBody = body;
      this.playerSprite = undefined;
      this.drawPlayerBody(0xe5960a);
      avatar = body;
    }

    const name = this.add.text(0, 59, "Explorador", {
      color: "#ffffff",
      fontFamily: "Baloo 2, DM Sans, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      stroke: "#1e2a44",
      strokeThickness: 4,
    }).setOrigin(0.5);
    player.add([shadow, avatar, name]);
    player.setDepth(player.y);
    this.player = player;
  }

  private drawPlayerBody(color: number) {
    if (!this.playerBody) return;
    drawExplorerBody(this.playerBody, color);
  }

  private createDestinationMarker() {
    this.destinationMarker = this.add.circle(0, 0, 13, 0xe5960a, 0.15);
    this.destinationMarker.setStrokeStyle(3, 0xe5960a, 0.9);
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

  /** Keeps the sprite at a fixed 132px height, preserving its aspect ratio. */
  private sizeAvatarSprite(sprite: Phaser.GameObjects.Image) {
    sprite.setDisplaySize((sprite.width / sprite.height) * 132, 132);
  }

  private setAvatarColor(color: string) {
    // With the Blender sprites loaded we swap texture instead of redrawing:
    // the vector body doesn't exist in that branch, so drawPlayerBody no-ops.
    const textureKey = explorerTextureKey(this, color);
    if (this.playerSprite && textureKey) {
      this.playerSprite.setTexture(textureKey);
      // Defensive: Phaser keeps the display size across setTexture (verified in
      // runtime), and every variant is currently 512x640, so this is a no-op
      // today. It only earns its keep if a future variant ships at a different
      // resolution, which would otherwise resize the avatar mid-game.
      this.sizeAvatarSprite(this.playerSprite);
      return;
    }
    this.drawPlayerBody(Phaser.Display.Color.HexStringToColor(color).color);
  }

  private focusTarget(target: AcademyTarget) {
    const hotspot = this.hotspots.find((item) => item.id === target);
    if (!hotspot) return;
    this.pendingTarget = target;
    this.movePlayerTo(hotspot.approach.x, hotspot.approach.y);
  }
}
