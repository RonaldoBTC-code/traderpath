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
import { WalkMask } from "@/game/phaser/WalkMask";

/**
 * Shared behaviour for every explorable room: the player avatar, click-to-walk
 * movement, hotspot hit-testing and the pointer prompts.
 *
 * Everything that differs between rooms is data in WorldSceneConfig. Scene
 * subclasses keep their own art, their own hotspot lists and their own game
 * events — this base deliberately owns only the four things that were
 * copy-pasted across all four scenes.
 */

/**
 * Tamaño del lienzo, fijado en createAcademyGame. NO es el tamaño del mundo.
 *
 * Los interiores planos (puerto, plaza, taller) miden exactamente esto y por
 * eso dibujan sus fondos con estas constantes. El overworld es mayor y declara
 * su tamaño en `world`; ahí la cámara sigue al jugador.
 */
export const VIEWPORT_WIDTH = 1280;
export const VIEWPORT_HEIGHT = 720;

/**
 * Alias históricos. Las tres salas interiores los usan para pintar su
 * escenario, donde mundo y lienzo coinciden; conservarlos evita reescribir
 * cientos de coordenadas de dibujo que no cambian.
 */
export const WORLD_WIDTH = VIEWPORT_WIDTH;
export const WORLD_HEIGHT = VIEWPORT_HEIGHT;

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
  /**
   * Rectangle the player can be sent to by clicking empty ground.
   *
   * This is the fallback for rooms drawn as flat interiors, where every pixel
   * is floor and a rectangle describes it perfectly. Rooms with real terrain
   * set `walkMask` instead and the rectangle is ignored.
   */
  walkArea: { minX: number; maxX: number; minY: number; maxY: number };
  /**
   * Tamaño del mundo. Por defecto coincide con el lienzo, que es el caso de
   * los interiores. Si es mayor, la cámara acota a él y sigue al jugador.
   */
  world?: { width: number; height: number };
  /**
   * Optional walkability mask rendered alongside the room art. When present it
   * replaces `walkArea`: clicks resolve against the mask and movement follows a
   * path around obstacles. Only the overworld has one today.
   */
  walkMask?: { key: string; path: string };
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
  /** Set only in rooms whose config declares a walkMask and whose PNG loaded. */
  protected walkMask?: WalkMask;

  protected constructor(
    protected readonly worldConfig: WorldSceneConfig,
    protected readonly onWorldEvent: AcademyWorldEventHandler
  ) {
    super(worldConfig.room);
  }

  preload() {
    preloadExplorerSprite(this);
    const mask = this.worldConfig.walkMask;
    if (mask) {
      this.load.image(mask.key, mask.path);
    }
  }

  /** Tamaño del mundo de esta sala; por defecto, el del lienzo. */
  protected get worldSize() {
    return this.worldConfig.world ?? { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT };
  }

  /**
   * Player, destination marker, camera, pointer handlers y el listener de
   * color de avatar. Las escenas lo llaman desde create() tras pintar su
   * escenario y construir sus hotspots, y luego registran sus propios eventos
   * con registerGameEvent.
   */
  protected createWorldBase() {
    const { width, height } = this.worldSize;
    const mask = this.worldConfig.walkMask;
    if (mask) {
      // La máscara se escala al mundo: puede venir a menor resolución que el
      // diorama sin que las consultas dejen de ser correctas.
      this.walkMask = WalkMask.fromTexture(this, mask.key, width, height);
    }
    this.createPlayer();
    this.createDestinationMarker();
    this.setUpCamera(width, height);
    this.input.on("pointermove", this.handlePointerMove, this);
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.registerGameEvent(ACADEMY_GAME_EVENTS.avatarColor, this.setAvatarColor);
  }

  /**
   * Acota la cámara al mundo y, si éste no cabe en el lienzo, la pone a seguir
   * al jugador.
   *
   * En los interiores mundo y lienzo coinciden: acotar deja el scroll clavado
   * en cero y `startFollow` sería ruido, así que no se activa. Un lerp bajo
   * evita que la cámara persiga con brusquedad cada paso del recorrido.
   */
  private setUpCamera(width: number, height: number) {
    const camera = this.cameras.main;
    camera.setBounds(0, 0, width, height);
    if (width <= VIEWPORT_WIDTH && height <= VIEWPORT_HEIGHT) return;
    if (this.player) {
      camera.startFollow(this.player, true, 0.08, 0.08);
      camera.centerOn(this.player.x, this.player.y);
    }
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
    const target = this.resolveDestination(point.x, point.y);
    if (target) this.movePlayerTo(target.x, target.y);
  }

  /**
   * Where a click on empty ground actually sends the player.
   *
   * With a mask, a click on water resolves to the nearest walkable point rather
   * than being dropped — clicking and having nothing happen reads as the game
   * being broken. Without a mask we keep the old rectangular clamp, which is
   * exactly right for the flat interiors.
   */
  private resolveDestination(x: number, y: number): { x: number; y: number } | undefined {
    if (this.walkMask) {
      return this.walkMask.nearestWalkable(x, y);
    }
    const { minX, maxX, minY, maxY } = this.worldConfig.walkArea;
    return {
      x: Phaser.Math.Clamp(x, minX, maxX),
      y: Phaser.Math.Clamp(y, minY, maxY),
    };
  }

  protected movePlayerTo(x: number, y: number) {
    if (!this.player || !this.destinationMarker) return;
    this.movementTween?.stop();
    this.destinationMarker.setPosition(x, y + 32).setVisible(true).setAlpha(1).setScale(1);
    this.tweens.add({ targets: this.destinationMarker, alpha: 0, scale: 1.8, duration: 420 });

    // Con máscara la ruta rodea el agua; sin ella es un único tramo recto,
    // que es lo que hacían las cuatro escenas antes.
    const from = { x: this.player.x, y: this.player.y };
    const waypoints = this.walkMask
      ? this.walkMask.findPath(from, { x, y })
      : [{ x, y }];

    this.onWorldEvent({ type: "moving", moving: true });
    this.walkSegment(waypoints, 0);
  }

  /** Recorre un tramo de la ruta y encadena el siguiente al terminar. */
  private walkSegment(waypoints: { x: number; y: number }[], index: number) {
    const player = this.player;
    if (!player) return;
    const step = waypoints[index];
    if (!step) {
      this.finishWalk();
      return;
    }

    const distance = Phaser.Math.Distance.Between(player.x, player.y, step.x, step.y);
    if (distance < 1) {
      this.walkSegment(waypoints, index + 1);
      return;
    }
    setExplorerAvatarFacing(this.avatar, step.x < player.x ? -1 : 1);
    this.movementTween = this.tweens.add({
      targets: player,
      x: step.x,
      y: step.y,
      duration: Phaser.Math.Clamp(distance * this.worldConfig.walkSpeed, 120, 1400),
      // Sólo se suaviza la salida del primer tramo y la llegada del último: en
      // los intermedios un ease completo frenaría en cada esquina del camino.
      ease: index === waypoints.length - 1 ? "Sine.Out" : "Linear",
      onUpdate: () => {
        if (!this.player) return;
        this.player.setDepth(this.player.y);
        this.player.rotation = Math.sin(this.time.now / 75) * 0.025;
      },
      onComplete: () => this.walkSegment(waypoints, index + 1),
    });
  }

  private finishWalk() {
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
