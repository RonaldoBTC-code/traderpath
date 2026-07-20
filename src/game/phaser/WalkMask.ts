import Phaser from "phaser";

/**
 * Zona caminable de una sala, leída de la máscara que produce Blender.
 *
 * blender/build_overworld.py renderiza el diorama y, desde la misma cámara y la
 * misma geometría, una segunda pasada donde lo pisable sale blanco y todo lo
 * demás negro. Por eso cada píxel de la máscara corresponde exactamente al
 * mismo píxel del mapa: no hay que mantener una colisión aparte del arte.
 *
 * La textura se vuelca una sola vez a un canvas fuera de pantalla; a partir de
 * ahí consultar un píxel es O(1). Muestrear con textures.getPixel() habría
 * costado un canvas nuevo por llamada, y el pathfinding hace miles.
 */

/**
 * Lado de la celda del grid de búsqueda, en píxeles de mundo.
 *
 * Era 16 con una prueba de celda que además exigía los cuatro flancos libres.
 * Esa combinación erosionaba la zona caminable ~5 px por lado y cerraba del
 * todo los pasos estrechos entre edificios: quedaban puntos pisables encerrados
 * en bolsillos sin ningún vecino válido, y el jugador no encontraba salida.
 * A 8 px la rejilla resuelve esos huecos y basta con mirar el centro, porque
 * dos centros contiguos distan 8 px y un obstáculo de ~14 px no cabe entre
 * ellos sin bloquear al menos uno.
 */
const CELL = 8;
/**
 * Paso de muestreo al comprobar visibilidad entre dos puntos. Corto a
 * propósito: los árboles miden ~14 px y con pasos más largos la recta les
 * pasaba por encima sin detectarlos.
 */
const LOS_STEP = 3;
/** Umbral: la máscara es binaria, pero los bordes salen antialiaseados. */
const WALKABLE_THRESHOLD = 128;
/** Alcance al buscar celda transitable, en píxeles de mundo (no en celdas). */
const NEAREST_CELL_RADIUS_PX = 384;

export interface Point {
  x: number;
  y: number;
}

export class WalkMask {
  private constructor(
    private readonly pixels: Uint8ClampedArray,
    private readonly maskWidth: number,
    private readonly maskHeight: number,
    private readonly worldWidth: number,
    private readonly worldHeight: number
  ) {}

  private cachedGrid?: { cols: number; rows: number; passable: Uint8Array };
  /** Búferes del recorrido en anchura, reutilizados entre llamadas. */
  private parent?: Int32Array;
  private seen?: Uint8Array;

  /**
   * Construye la máscara desde una textura ya cargada. Devuelve undefined si la
   * textura no existe o el canvas no se deja leer, y entonces la escena sigue
   * con su rectángulo de walkArea: un PNG que falta no rompe el mundo.
   */
  static fromTexture(
    scene: Phaser.Scene,
    key: string,
    worldWidth: number,
    worldHeight: number
  ): WalkMask | undefined {
    if (!scene.textures.exists(key)) return undefined;
    const source = scene.textures.get(key).getSourceImage();
    const width = source.width;
    const height = source.height;
    if (!width || !height) return undefined;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return undefined;
    context.drawImage(source as CanvasImageSource, 0, 0);

    try {
      const data = context.getImageData(0, 0, width, height).data;
      return new WalkMask(data, width, height, worldWidth, worldHeight);
    } catch {
      // getImageData lanza si el canvas quedara marcado; degradamos en silencio.
      return undefined;
    }
  }

  isWalkable(worldX: number, worldY: number): boolean {
    const x = Math.round((worldX / this.worldWidth) * this.maskWidth);
    const y = Math.round((worldY / this.worldHeight) * this.maskHeight);
    if (x < 0 || y < 0 || x >= this.maskWidth || y >= this.maskHeight) return false;
    return this.pixels[(y * this.maskWidth + x) * 4] >= WALKABLE_THRESHOLD;
  }

  /**
   * Punto pisable más cercano, buscando en anillos.
   *
   * El radio por defecto cubre la diagonal del mundo a propósito: con un tope
   * corto, un clic en una esquina lejana no encontraba tierra, la función
   * devolvía undefined y el clic se perdía en silencio. Preferimos gastar unos
   * milisegundos a que el juego parezca colgado.
   */
  nearestWalkable(worldX: number, worldY: number, maxRadius = 1600): Point | undefined {
    if (this.isWalkable(worldX, worldY)) return { x: worldX, y: worldY };
    for (let radius = 8; radius <= maxRadius; radius += 8) {
      const steps = Math.max(12, Math.round((2 * Math.PI * radius) / 8));
      for (let step = 0; step < steps; step += 1) {
        const angle = (2 * Math.PI * step) / steps;
        const x = worldX + radius * Math.cos(angle);
        const y = worldY + radius * Math.sin(angle);
        if (this.isWalkable(x, y)) return { x, y };
      }
    }
    return undefined;
  }

  /** ¿Se puede ir en línea recta sin pisar agua? */
  hasLineOfSight(from: Point, to: Point): boolean {
    const distance = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);
    const steps = Math.max(1, Math.ceil(distance / LOS_STEP));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      if (!this.isWalkable(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Rejilla de celdas transitables, construida una sola vez.
   *
   * La máscara no cambia en toda la vida de la escena, así que no tiene sentido
   * recalcular ~58.000 celdas en cada clic.
   */
  private grid() {
    if (!this.cachedGrid) {
      const cols = Math.ceil(this.worldWidth / CELL);
      const rows = Math.ceil(this.worldHeight / CELL);
      const passable = new Uint8Array(cols * rows);
      for (let cy = 0; cy < rows; cy += 1) {
        for (let cx = 0; cx < cols; cx += 1) {
          const x = cx * CELL + CELL / 2;
          const y = cy * CELL + CELL / 2;
          passable[cy * cols + cx] = this.isWalkable(x, y) ? 1 : 0;
        }
      }
      this.cachedGrid = { cols, rows, passable };
    }
    return this.cachedGrid;
  }

  /** Índice de la celda transitable más cercana a un punto, o -1. */
  private nearestPassableCell(point: Point): number {
    const { cols, rows, passable } = this.grid();
    const cx = Phaser.Math.Clamp(Math.floor(point.x / CELL), 0, cols - 1);
    const cy = Phaser.Math.Clamp(Math.floor(point.y / CELL), 0, rows - 1);
    if (passable[cy * cols + cx]) return cy * cols + cx;
    // Recorre sólo el perímetro de cada anillo. Barrer el cuadrado entero y
    // descartar el interior costaba O(r²) por anillo para mirar O(r) celdas.
    // El radio se expresa en píxeles para que no dependa del tamaño de celda:
    // al bajar CELL de 16 a 8 el alcance se habría reducido a la mitad sin que
    // nada lo dijera.
    const maxRadius = Math.ceil(NEAREST_CELL_RADIUS_PX / CELL);
    for (let radius = 1; radius <= maxRadius; radius += 1) {
      for (let offset = -radius; offset <= radius; offset += 1) {
        const candidates: Array<[number, number]> = [
          [cx + offset, cy - radius],
          [cx + offset, cy + radius],
          [cx - radius, cy + offset],
          [cx + radius, cy + offset],
        ];
        for (const [nx, ny] of candidates) {
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          if (passable[ny * cols + nx]) return ny * cols + nx;
        }
      }
    }
    return -1;
  }

  /**
   * Ruta desde `from` hasta `to` que no cruza agua.
   *
   * Recorrido en anchura sobre un grid grueso: uniforme, así que BFS ya da el
   * camino más corto en número de celdas y no hace falta A*. Si el destino es
   * inalcanzable —otra isla sin puente— devuelve la ruta a la celda alcanzable
   * más próxima al objetivo, para que el clic siempre produzca movimiento.
   *
   * El resultado se alisa por visibilidad: se salta todo waypoint intermedio
   * que se pueda esquivar en recta, y así el personaje no zigzaguea siguiendo
   * la cuadrícula.
   */
  findPath(from: Point, to: Point): Point[] {
    // Si el origen no es pisable, el recorrido en anchura arranca en una celda
    // bloqueada, no puede expandirse y la ruta degenera en una recta que cruza
    // lo que sea. En juego el jugador siempre está en tierra, pero un empujón
    // o una posición inicial mal puesta no deben poder mandarlo por el mar.
    const origin = this.isWalkable(from.x, from.y)
      ? from
      : this.nearestWalkable(from.x, from.y) ?? from;
    if (this.hasLineOfSight(origin, to)) return [to];

    const { cols, rows, passable } = this.grid();
    const index = (cx: number, cy: number) => cy * cols + cx;
    const centre = (cx: number, cy: number): Point => ({
      x: cx * CELL + CELL / 2,
      y: cy * CELL + CELL / 2,
    });

    // Se siembra en la celda transitable más próxima al origen, no en la que
    // lo contiene: el centro de esa celda puede caer sobre un obstáculo aunque
    // el punto exacto sea pisable, y entonces la búsqueda no arrancaba.
    const startCell = this.nearestPassableCell(origin);
    const goalCell = this.nearestPassableCell(to);
    // Sin celda de salida no hay ruta posible: quedarse quieto. Devolver [to]
    // era exactamente la recta sin validar que este módulo existe para evitar.
    if (startCell < 0) return [origin];
    const goalX = goalCell >= 0 ? goalCell % cols : Phaser.Math.Clamp(Math.floor(to.x / CELL), 0, cols - 1);
    const goalY = goalCell >= 0 ? Math.floor(goalCell / cols) : Phaser.Math.Clamp(Math.floor(to.y / CELL), 0, rows - 1);

    // Los búferes se reutilizan entre llamadas: con celdas de 8 px son ~58.000
    // entradas, y reservarlos en cada clic eran ~290 KB de basura por clic.
    if (!this.parent || this.parent.length !== cols * rows) {
      this.parent = new Int32Array(cols * rows);
      this.seen = new Uint8Array(cols * rows);
    }
    const parent = this.parent;
    const seen = this.seen!;
    parent.fill(-1);
    seen.fill(0);
    const queue: number[] = [startCell];
    seen[startCell] = 1;

    let best = startCell;
    let bestDistance = Number.POSITIVE_INFINITY;
    let head = 0;
    while (head < queue.length) {
      const current = queue[head];
      head += 1;
      const cx = current % cols;
      const cy = Math.floor(current / cols);

      const distance = Phaser.Math.Distance.Between(cx, cy, goalX, goalY);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = current;
      }
      if (cx === goalX && cy === goalY) break;

      for (const [dx, dy] of NEIGHBOURS) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const next = index(nx, ny);
        if (seen[next] || !passable[next]) continue;
        // Nada de cortar esquinas: en diagonal exigimos los dos ortogonales,
        // si no el personaje se cuela por el vértice entre dos rocas.
        if (dx !== 0 && dy !== 0) {
          if (!passable[index(cx + dx, cy)] || !passable[index(cx, cy + dy)]) continue;
        }
        seen[next] = 1;
        parent[next] = current;
        queue.push(next);
      }
    }

    const cells: number[] = [];
    for (let node = best; node !== -1; node = parent[node]) cells.push(node);
    cells.reverse();

    const waypoints = cells.map((node) => centre(node % cols, Math.floor(node / cols)));
    // El destino real se añade sólo si es pisable Y si se ve en recta desde la
    // última celda. Sin esa segunda condición el salto final cortaba esquinas
    // por encima del agua: entre celdas contiguas siempre hay visibilidad, pero
    // entre la última celda y el destino puede no haberla.
    const lastCell = waypoints[waypoints.length - 1];
    if (
      this.isWalkable(to.x, to.y) &&
      (!lastCell || this.hasLineOfSight(lastCell, to))
    ) {
      waypoints.push(to);
    }

    return this.smooth(origin, waypoints);
  }

  /** Quita waypoints que se puedan saltar en línea recta. */
  private smooth(from: Point, waypoints: Point[]): Point[] {
    const result: Point[] = [];
    let anchor = from;
    let cursor = 0;
    while (cursor < waypoints.length) {
      let furthest = cursor;
      for (let candidate = waypoints.length - 1; candidate > cursor; candidate -= 1) {
        if (this.hasLineOfSight(anchor, waypoints[candidate])) {
          furthest = candidate;
          break;
        }
      }
      result.push(waypoints[furthest]);
      anchor = waypoints[furthest];
      cursor = furthest + 1;
    }
    return result.length ? result : [from];
  }
}

const NEIGHBOURS: ReadonlyArray<readonly [number, number]> = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];
