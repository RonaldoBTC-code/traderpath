import * as Phaser from "phaser";
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
  stopExplorerAvatar,
  walkExplorerAvatar,
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

/** How far ahead on the route the explorer looks to decide where it faces (px). */
const WALK_LOOKAHEAD = 140;

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

  /**
   * Cámara. Sólo el overworld la usa: en los interiores mundo y lienzo
   * coinciden y `cameraEnabled` queda en false, con lo que el zoom y el envío
   * de estado quedan inertes.
   */
  private cameraEnabled = false;
  /**
   * `follow` = la cámara sigue al jugador (caminar desplaza la vista).
   * `free`   = el usuario alejó/miró con rueda o pinza; la vista queda donde la
   *            dejó hasta que vuelva a hacer clic para caminar.
   * Desacoplar el zoom del seguimiento es lo que permite anclar el zoom al
   * puntero sin pelearse con el seguimiento del avatar.
   */
  private cameraMode: "follow" | "free" = "follow";
  private minZoom = 1;
  private maxZoom = 1.5;
  /** Distancia entre dedos en el gesto de pinza anterior; 0 = sin pinza. */
  private pinchPrev = 0;
  /** Último estado de cámara emitido, para no re-emitir sin cambios. */
  private lastCamera = { px: NaN, py: NaN, sx: NaN, sy: NaN, z: NaN };

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
   * Acota la cámara al mundo y, si éste no cabe en el lienzo, activa el
   * seguimiento y el zoom.
   *
   * En los interiores mundo y lienzo coinciden: acotar deja el scroll clavado
   * en cero y `startFollow` sería ruido, así que `cameraEnabled` queda en false
   * y ni el zoom ni el envío de estado hacen nada.
   */
  private setUpCamera(width: number, height: number) {
    const camera = this.cameras.main;
    camera.setBounds(0, 0, width, height);
    this.cameraEnabled = width > VIEWPORT_WIDTH || height > VIEWPORT_HEIGHT;
    if (!this.cameraEnabled) return;

    // Zoom mínimo = el que hace caber el mundo entero en el lienzo. Con un mundo
    // que es N× el lienzo, sale 1/N (p. ej. 1/3 para 3840×2160). El máximo lo
    // fija la nitidez del diorama: por encima de 1.5× se ven los píxeles.
    this.minZoom = Math.max(VIEWPORT_WIDTH / width, VIEWPORT_HEIGHT / height);
    this.maxZoom = 1.5;
    camera.setZoom(1);
    this.cameraMode = "follow";
    this.refreshCameraFollow();
    camera.centerOn(this.player?.x ?? width / 2, this.player?.y ?? height / 2);

    // Un segundo puntero para el gesto de pinza (móvil). El primero ya existe.
    this.input.addPointer(1);
    this.input.on("wheel", this.handleWheel, this);
    this.registerGameEvent(ACADEMY_GAME_EVENTS.zoomStep, this.handleZoomStep);
    this.registerGameEvent(ACADEMY_GAME_EVENTS.travelTo, this.handleTravelTo);
    this.emitCamera();
  }

  /**
   * Decide si la cámara sigue al jugador o se queda quieta, según el zoom.
   *
   * A `minZoom` el mundo entero cabe en pantalla: no hay nada que seguir, así
   * que se centra en el mundo. Por encima, en modo `follow` persigue al jugador
   * con un lerp bajo; en modo `free` deja el scroll donde lo dejó el usuario
   * (Phaser lo acota a los límites del mundo en cada render).
   */
  private refreshCameraFollow() {
    if (!this.cameraEnabled) return;
    const camera = this.cameras.main;
    const { width, height } = this.worldSize;
    const visibleW = VIEWPORT_WIDTH / camera.zoom;
    const visibleH = VIEWPORT_HEIGHT / camera.zoom;
    if (visibleW >= width && visibleH >= height) {
      camera.stopFollow();
      camera.centerOn(width / 2, height / 2);
      return;
    }
    if (this.cameraMode === "follow" && this.player) {
      camera.startFollow(this.player, true, 0.12, 0.12);
    } else {
      camera.stopFollow();
    }
  }

  /**
   * Aplica un nuevo zoom manteniendo fijo el punto del mundo que hay bajo
   * (screenX, screenY). Manipulación directa: lo que señalas no se te escapa.
   *
   * Se calcula el scroll de forma analítica desde `worldView` en vez de leer la
   * matriz de la cámara justo después de `setZoom`, que se actualiza un frame
   * más tarde y desplazaría el ancla.
   */
  private zoomAt(screenX: number, screenY: number, nextZoom: number) {
    const camera = this.cameras.main;
    const zoom = Phaser.Math.Clamp(nextZoom, this.minZoom, this.maxZoom);
    if (Math.abs(zoom - camera.zoom) < 0.0001) return;

    // Punto del mundo bajo el cursor, con el zoom actual.
    const worldX = camera.worldView.x + screenX / camera.zoom;
    const worldY = camera.worldView.y + screenY / camera.zoom;
    camera.setZoom(zoom);
    // Borde de la vista que deja ese punto bajo el cursor con el zoom nuevo…
    const viewLeft = worldX - screenX / zoom;
    const viewTop = worldY - screenY / zoom;
    // …convertido a scroll (con origen de cámara 0.5, worldView.x = scrollX +
    // ½·lienzo·(1 − 1/zoom)).
    camera.setScroll(
      viewLeft - 0.5 * VIEWPORT_WIDTH * (1 - 1 / zoom),
      viewTop - 0.5 * VIEWPORT_HEIGHT * (1 - 1 / zoom)
    );
    this.refreshCameraFollow();
    this.emitCamera();
  }

  /** Rueda del ratón: zoom continuo anclado al cursor. Pasa a modo libre. */
  private handleWheel(
    pointer: Phaser.Input.Pointer,
    _over: unknown,
    _dx: number,
    dy: number
  ) {
    const camera = this.cameras.main;
    const factor = dy > 0 ? 0.9 : 1.1; // rueda abajo = alejar
    this.cameraMode = "free";
    this.zoomAt(pointer.x, pointer.y, camera.zoom * factor);
  }

  /**
   * Botones +/− del HUD. Anclan al centro del lienzo y conservan el modo: si la
   * cámara seguía al jugador, sigue siguiéndolo (el centro es el jugador).
   */
  private handleZoomStep(direction: number) {
    if (!this.cameraEnabled) return;
    const camera = this.cameras.main;
    const step = 1.25;
    const nextZoom = direction > 0 ? camera.zoom * step : camera.zoom / step;
    this.zoomAt(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, nextZoom);
  }

  /** Viajar a un punto del mundo desde el minimapa, resuelto por la máscara. */
  private handleTravelTo(x: number, y: number) {
    const target = this.resolveDestination(x, y);
    this.pendingTarget = undefined;
    this.movePlayerTo(target.x, target.y);
  }

  /**
   * Empuja el estado de cámara a React (minimapa).
   *
   * El rectángulo visible se calcula desde `scroll` y `zoom` (ambos síncronos)
   * en vez de leer `camera.worldView`, que Phaser sólo recalcula en el preRender
   * siguiente: leerlo justo tras `setZoom` daría un marco un paso desfasado.
   * Con origen de cámara 0.5, worldView.x = scrollX + ½·lienzo·(1 − 1/zoom).
   */
  private emitCamera() {
    if (!this.cameraEnabled || !this.player) return;
    const camera = this.cameras.main;
    const zoom = camera.zoom;
    const viewWidth = VIEWPORT_WIDTH / zoom;
    const viewHeight = VIEWPORT_HEIGHT / zoom;
    this.lastCamera = {
      px: this.player.x,
      py: this.player.y,
      sx: camera.scrollX,
      sy: camera.scrollY,
      z: zoom,
    };
    this.onWorldEvent({
      type: "camera",
      playerX: this.player.x,
      playerY: this.player.y,
      viewX: camera.scrollX + 0.5 * VIEWPORT_WIDTH * (1 - 1 / zoom),
      viewY: camera.scrollY + 0.5 * VIEWPORT_HEIGHT * (1 - 1 / zoom),
      viewWidth,
      viewHeight,
      zoom,
    });
  }

  /**
   * Emite el estado de cámara sólo cuando algo se movió de verdad (jugador,
   * scroll o zoom), acotado por el propio ritmo de `update`. Evita re-render de
   * React en frames idénticos.
   */
  update() {
    if (!this.cameraEnabled || !this.player) return;
    const camera = this.cameras.main;
    const moved =
      Math.abs(this.player.x - this.lastCamera.px) >= 1 ||
      Math.abs(this.player.y - this.lastCamera.py) >= 1 ||
      Math.abs(camera.scrollX - this.lastCamera.sx) >= 1 ||
      Math.abs(camera.scrollY - this.lastCamera.sy) >= 1 ||
      camera.zoom !== this.lastCamera.z;
    if (moved) this.emitCamera();
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

    // Walk sheet, then static sprite, then vector body — whatever art exists.
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

  /**
   * Zoom por pinza: dos dedos abajo → escala por la razón de distancias,
   * anclada al punto medio. Devuelve true mientras la pinza esté activa para
   * que el resto del manejador de puntero se aparte.
   */
  private handlePinch(): boolean {
    if (!this.cameraEnabled) return false;
    const p1 = this.input.pointer1;
    const p2 = this.input.pointer2;
    if (!p1?.isDown || !p2?.isDown) {
      this.pinchPrev = 0;
      return false;
    }
    const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
    if (this.pinchPrev > 0 && dist > 0) {
      this.cameraMode = "free";
      this.zoomAt((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, this.cameras.main.zoom * (dist / this.pinchPrev));
    }
    this.pinchPrev = dist;
    return true;
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (this.handlePinch()) return;
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
    // Protección multitáctil: si hay una pinza en curso o dos dedos abajo, no
    // se camina — ese gesto es zoom, no un destino.
    if (this.cameraEnabled && (this.pinchPrev > 0 || (this.input.pointer1?.isDown && this.input.pointer2?.isDown))) {
      return;
    }
    const point = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const hotspot = this.activeHotspotAt(point.x, point.y);
    if (hotspot) {
      this.pendingTarget = hotspot.id;
      this.movePlayerTo(hotspot.approach.x, hotspot.approach.y);
      return;
    }
    this.pendingTarget = undefined;
    const target = this.resolveDestination(point.x, point.y);
    this.movePlayerTo(target.x, target.y);
  }

  /**
   * Where a click on empty ground actually sends the player.
   *
   * With a mask, a click on water resolves to the nearest walkable point rather
   * than being dropped — clicking and having nothing happen reads as the game
   * being broken. Without a mask we keep the old rectangular clamp, which is
   * exactly right for the flat interiors.
   */
  private resolveDestination(x: number, y: number): { x: number; y: number } {
    const { minX, maxX, minY, maxY } = this.worldConfig.walkArea;
    const clamped = {
      x: Phaser.Math.Clamp(x, minX, maxX),
      y: Phaser.Math.Clamp(y, minY, maxY),
    };
    if (!this.walkMask) return clamped;
    // Si la máscara no encontrara nada pisable, se recurre al rectángulo en vez
    // de descartar el clic: quedarse sin respuesta se lee como juego roto.
    return this.walkMask.nearestWalkable(x, y) ?? clamped;
  }

  protected movePlayerTo(x: number, y: number) {
    if (!this.player || !this.destinationMarker) return;
    // Hacer clic para caminar reengancha el seguimiento: tras mirar el mundo en
    // modo libre, la cámara vuelve a acompañar el recorrido.
    if (this.cameraEnabled && this.cameraMode !== "follow") {
      this.cameraMode = "follow";
      this.refreshCameraFollow();
    }
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
    const heading = this.routeLookahead(waypoints, index, player);
    walkExplorerAvatar(this.avatar, heading.x - player.x, heading.y - player.y);
    // The wobble stands in for a walk cycle; with a real one it would fight it.
    const wobble = !this.avatar?.animated;
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
        this.player.rotation = wobble ? Math.sin(this.time.now / 75) * 0.025 : 0;
      },
      onComplete: () => this.walkSegment(waypoints, index + 1),
    });
  }

  /**
   * Point WALK_LOOKAHEAD px further along the route. The walk-mask path zigzags
   * across its 8 px grid (45° nudges, short sideways steps), and facing each
   * segment made the explorer flip and swap rows mid-stride. Aiming at a point
   * ahead follows real detours around water but ignores that noise.
   */
  private routeLookahead(
    waypoints: { x: number; y: number }[],
    index: number,
    from: { x: number; y: number }
  ): { x: number; y: number } {
    let remaining = WALK_LOOKAHEAD;
    let prev = { x: from.x, y: from.y };
    for (let i = index; i < waypoints.length; i += 1) {
      const next = waypoints[i];
      const distance = Phaser.Math.Distance.Between(prev.x, prev.y, next.x, next.y);
      if (distance >= remaining) {
        const t = remaining / distance;
        return { x: prev.x + (next.x - prev.x) * t, y: prev.y + (next.y - prev.y) * t };
      }
      remaining -= distance;
      prev = next;
    }
    return prev;
  }

  private finishWalk() {
    if (!this.player) return;
    this.player.rotation = 0;
    // Facing is deliberately kept: the explorer idles looking the way it
    // last walked.
    stopExplorerAvatar(this.avatar);
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
