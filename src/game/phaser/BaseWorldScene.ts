import Phaser from "phaser";
import {
  ACADEMY_GAME_EVENTS,
  type AcademyWorldEventHandler,
  type WorldRoom,
  type WorldTarget,
} from "@/game/phaser/worldEvents";
import {
  createExplorerAvatar,
  preloadExplorerSprite,
  setExplorerAvatarColor,
  setExplorerAvatarFacing,
  type ExplorerAvatar,
} from "@/game/phaser/characterArt";

/**
 * Shared behaviour for every explorable room: the player avatar, click-to-walk
 * movement, hotspot hit-testing and the pointer prompts.
 *
 * Everything that differs between rooms is data in WorldSceneConfig. Scene
 * subclasses keep their own art, their own hotspot lists and their own game
 * events — this base deliberately owns only the four things that were
 * copy-pasted across all four scenes.
 */

export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 720;

/**
 * A clickable region in a room.
 *
 * `enabled` is optional: a hotspot without it is always active, which is how
 * AcademyAgora's hotspots behave today. Phase 3 (locked cities greyed out on
 * the map) adds `enabled` there without changing this contract.
 */
export interface WorldHotspot {
  id: WorldTarget;
  area: Phaser.Geom.Rectangle;
  approach: Phaser.Math.Vector2;
  prompt: string;
  enabled?: () => boolean;
}

export interface WorldSceneConfig {
  room: WorldRoom;
  /** Prompt shown while the pointer is not over any active hotspot. */
  idlePrompt: string;
  /** Region the player can be sent to by clicking empty ground. */
  walkArea: { minX: number; maxX: number; minY: number; maxY: number };
  player: {
    x: number;
    y: number;
    shadowColor: number;
    shadowAlpha: number;
    /** Body colour for the vector fallback, until an avatar colour arrives. */
    fallbackColor: number;
    labelStyle: Phaser.Types.GameObjects.Text.TextStyle;
  };
  /** Colour of the click-destination ring. */
  markerColor: number;
  /** Milliseconds of travel per pixel of distance. */
  walkSpeed: number;
}

export abstract class BaseWorldScene extends Phaser.Scene {
  protected player?: Phaser.GameObjects.Container;
  protected avatar?: ExplorerAvatar;
  protected destinationMarker?: Phaser.GameObjects.Arc;
  protected movementTween?: Phaser.Tweens.Tween;
  protected pendingTarget?: WorldTarget;
  protected hoveredTarget?: WorldTarget;
  protected hotspots: WorldHotspot[] = [];

  protected constructor(
    protected readonly worldConfig: WorldSceneConfig,
    protected readonly onWorldEvent: AcademyWorldEventHandler
  ) {
    super(worldConfig.room);
  }

  preload() {
    preloadExplorerSprite(this);
  }

  /**
   * Player, destination marker, pointer handlers and the avatar-colour
   * listener. Scenes call this from create() after drawing their room and
   * building their hotspot list, then register any extra game events with
   * registerGameEvent.
   */
  protected createWorldBase() {
    this.createPlayer();
    this.createDestinationMarker();
    this.input.on("pointermove", this.handlePointerMove, this);
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.registerGameEvent(ACADEMY_GAME_EVENTS.avatarColor, this.setAvatarColor);
  }

  /** Subscribe to a game-level event and drop it automatically on shutdown. */
  protected registerGameEvent<A extends unknown[]>(event: string, handler: (...args: A) => void) {
    const bound = (...args: A) => handler.apply(this, args);
    this.game.events.on(event, bound);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(event, bound);
    });
  }

  private createPlayer() {
    const config = this.worldConfig.player;
    const player = this.add.container(config.x, config.y);
    const shadow = this.add.ellipse(0, 38, 64, 20, config.shadowColor, config.shadowAlpha);

    // Prefer the Blender-rendered sprite; fall back to the vector body so the
    // world keeps working before build_explorer.py has produced the PNG.
    const avatar = createExplorerAvatar(this, {
      y: -6,
      height: 132,
      fallbackColor: config.fallbackColor,
    });
    this.avatar = avatar;

    const label = this.add.text(0, 59, "Explorador", config.labelStyle).setOrigin(0.5);
    player.add([shadow, avatar.object, label]);
    player.setDepth(player.y);
    this.player = player;
  }

  private createDestinationMarker() {
    const color = this.worldConfig.markerColor;
    this.destinationMarker = this.add.circle(0, 0, 13, color, 0.15);
    this.destinationMarker.setStrokeStyle(3, color, 0.9);
    this.destinationMarker.setVisible(false);
    this.destinationMarker.setDepth(1000);
  }

  /** First hotspot under the point that is currently active. */
  private activeHotspotAt(x: number, y: number) {
    return this.hotspots.find((item) => (item.enabled?.() ?? true) && item.area.contains(x, y));
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    const point = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const hotspot = this.activeHotspotAt(point.x, point.y);
    if (hotspot?.id === this.hoveredTarget) return;
    this.hoveredTarget = hotspot?.id;
    this.onWorldEvent({
      type: "prompt",
      message: hotspot?.prompt ?? this.worldConfig.idlePrompt,
    });
    this.game.canvas.style.cursor = hotspot ? "pointer" : "default";
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    const point = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const hotspot = this.activeHotspotAt(point.x, point.y);
    if (hotspot) {
      this.pendingTarget = hotspot.id;
      this.movePlayerTo(hotspot.approach.x, hotspot.approach.y);
      return;
    }
    this.pendingTarget = undefined;
    const { minX, maxX, minY, maxY } = this.worldConfig.walkArea;
    this.movePlayerTo(
      Phaser.Math.Clamp(point.x, minX, maxX),
      Phaser.Math.Clamp(point.y, minY, maxY)
    );
  }

  protected movePlayerTo(x: number, y: number) {
    if (!this.player || !this.destinationMarker) return;
    this.movementTween?.stop();
    this.destinationMarker.setPosition(x, y + 32).setVisible(true).setAlpha(1).setScale(1);
    this.tweens.add({ targets: this.destinationMarker, alpha: 0, scale: 1.8, duration: 420 });

    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
    setExplorerAvatarFacing(this.avatar, x < this.player.x ? -1 : 1);
    this.onWorldEvent({ type: "moving", moving: true });
    this.movementTween = this.tweens.add({
      targets: this.player,
      x,
      y,
      duration: Phaser.Math.Clamp(distance * this.worldConfig.walkSpeed, 220, 1400),
      ease: "Sine.InOut",
      onUpdate: () => {
        if (!this.player) return;
        this.player.setDepth(this.player.y);
        this.player.rotation = Math.sin(this.time.now / 75) * 0.025;
      },
      onComplete: () => {
        if (!this.player) return;
        this.player.rotation = 0;
        // Facing is deliberately kept: the explorer stays looking the way it
        // last walked.
        this.onWorldEvent({ type: "moving", moving: false });
        if (!this.pendingTarget) return;
        const target = this.pendingTarget;
        this.pendingTarget = undefined;
        this.onArrive(target);
        this.onWorldEvent({ type: "interact", target });
      },
    });
  }

  /**
   * Scene-specific side effect right before the interact event fires.
   * Only WelcomeHarbor uses it today (collecting the intro token).
   */
  protected onArrive(target: WorldTarget) {
    void target;
  }

  protected setAvatarColor(color: string) {
    setExplorerAvatarColor(this, this.avatar, color);
  }
}
