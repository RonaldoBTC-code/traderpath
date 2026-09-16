#!/usr/bin/env node
// build-art.mjs — publica el arte hecho a mano en el juego.
//
// Tú dejas tus archivos en renders/assets/ con la estructura de destino:
//
//   renders/assets/missions/m1_1-apple.png   →  public/assets/missions/m1_1-apple.webp
//   renders/assets/sprites/explorer.blend    →  public/assets/sprites/explorer.webp
//   renders/assets/world/overworld.glb       →  public/assets/world/overworld.webp
//
// …y esto los convierte al formato que el juego sirve. Acepta imágenes
// (png/jpg/webp/tif/bmp/tga), archivos de Blender (.blend, se renderizan con SU
// cámara y NUNCA se sobrescriben) y modelos 3D (.gltf/.glb/.fbx/.obj/.dae, que
// se importan a un set de cámara y luz cartoon del proyecto).
//
//   npm run art            publica lo que haya cambiado
//   npm run art:watch      se queda mirando la carpeta y publica al guardar
//   npm run art:check      no escribe nada: solo dice qué haría y qué falla
//   npm run art -- --force republica todo aunque no haya cambiado
//   npm run art -- --only m1_1        filtra por subcadena del nombre
//
// El juego no sabe nada de esto: sigue pidiendo /assets/…/<nombre>.webp. Por eso
// el nombre del archivo que dejas es lo único que tiene que coincidir.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "renders", "assets");
const OUT_DIR = path.join(ROOT, "public", "assets");
const HELPER = path.join(ROOT, "renders", "blender", "import_manual_assets.py");

const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".bmp", ".tga"]);
const MODELS = new Set([".gltf", ".glb", ".fbx", ".obj", ".dae", ".stl", ".ply"]);
const IGNORED = new Set([".md", ".json", ".txt", ".gitkeep", ".blend1", ".blend2"]);

const argv = process.argv.slice(2);
const FLAG = (f) => argv.includes(f);
const VALUE = (f) => (argv.indexOf(f) >= 0 ? argv[argv.indexOf(f) + 1] : undefined);
const opts = {
  watch: FLAG("--watch"),
  check: FLAG("--check"),
  force: FLAG("--force"),
  only: VALUE("--only"),
};

// ── Lectura de cabeceras: dimensiones y alfa sin dependencias ────────────────
// Necesitamos saber el tamaño y si hay transparencia para avisar cuando el arte
// nuevo no encaja con el que sustituye (un sprite sin alfa sale como un
// rectángulo blanco sobre la escena, y es lo primero que se rompe a mano).
function imageInfo(file) {
  let buf;
  try {
    buf = fs.readFileSync(file);
  } catch {
    return null;
  }
  // PNG
  if (buf.length > 33 && buf.readUInt32BE(0) === 0x89504e47) {
    const colorType = buf[25];
    const hasTrns = buf.includes(Buffer.from("tRNS"));
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
      alpha: colorType === 4 || colorType === 6 || hasTrns,
    };
  }
  // WebP (RIFF)
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
      return {
        width: 1 + buf.readUIntLE(24, 3),
        height: 1 + buf.readUIntLE(27, 3),
        alpha: (buf[20] & 0x10) !== 0,
      };
    }
    if (chunk === "VP8L") {
      const b = buf.readUInt32LE(21);
      return {
        width: (b & 0x3fff) + 1,
        height: ((b >> 14) & 0x3fff) + 1,
        alpha: ((b >> 28) & 1) !== 0,
      };
    }
    if (chunk === "VP8 ") {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff, alpha: false };
    }
  }
  // JPEG
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5), alpha: false };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

// ── Blender ─────────────────────────────────────────────────────────────────
function findBlender() {
  if (process.env.BLENDER && fs.existsSync(process.env.BLENDER)) return process.env.BLENDER;
  const candidates = [];
  if (process.platform === "win32") {
    for (const base of ["C:/Program Files/Blender Foundation", "C:/Program Files (x86)/Blender Foundation"]) {
      if (!fs.existsSync(base)) continue;
      for (const dir of fs.readdirSync(base)) {
        const exe = path.join(base, dir, "blender.exe");
        if (fs.existsSync(exe)) candidates.push(exe);
      }
    }
  } else {
    candidates.push("/Applications/Blender.app/Contents/MacOS/Blender", "/usr/bin/blender", "/usr/local/bin/blender");
  }
  // La versión más alta primero: "Blender 5.2" gana a "Blender 4.2".
  const found = candidates.filter((c) => fs.existsSync(c)).sort().reverse();
  return found[0];
}

// ── Escaneo de fuentes ──────────────────────────────────────────────────────
function walk(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else if (!entry.name.startsWith(".")) out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out;
}

/** Rutas /assets/… que el código pide de forma estática, para cazar erratas. */
function referencedPaths() {
  const refs = new Set();
  const stack = [path.join(ROOT, "src")];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) {
        const text = fs.readFileSync(full, "utf8");
        for (const m of text.matchAll(/\/assets\/[A-Za-z0-9_\-./${}]+/g)) refs.add(m[0]);
      }
    }
  }
  return refs;
}

function isReferenced(refs, servedPath) {
  if (refs.has(servedPath)) return true;
  // Plantillas: `/assets/sprites/explorer_${index}.webp` y similares. Se parte
  // por el hueco ANTES de escapar; escapar primero convertiría el `$` de la
  // plantilla en literal y el comodín no llegaría a formarse.
  for (const ref of refs) {
    if (!ref.includes("${")) continue;
    const literal = ref.split(/\$\{[^}]*\}/g).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (new RegExp("^" + literal.join(".+") + "$").test(servedPath)) return true;
  }
  return false;
}

/** Opciones por archivo: renders/assets/x/y.png.json (todo opcional). */
function sidecar(srcAbs) {
  const file = srcAbs.replace(/\.[^.]+$/, "") + ".json";
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    console.log(`  aviso: ${path.basename(file)} no es JSON válido (${err.message}); se ignora`);
    return {};
  }
}

function plan() {
  const refs = referencedPaths();
  const jobs = [];
  for (const rel of walk(SRC_DIR)) {
    const ext = path.extname(rel).toLowerCase();
    if (IGNORED.has(ext) || path.basename(rel).toLowerCase() === "readme.md") continue;
    if (opts.only && !rel.includes(opts.only)) continue;

    const srcAbs = path.join(SRC_DIR, rel);
    const dstRel = rel.replace(/\.[^.]+$/, ".webp");
    const dstAbs = path.join(OUT_DIR, dstRel);
    const served = "/assets/" + dstRel;
    const kind = ext === ".blend" ? "blend" : RASTER.has(ext) ? "image" : MODELS.has(ext) ? "model" : null;

    if (!kind) {
      jobs.push({ rel, served, skip: `formato no soportado (${ext})`, error: true });
      continue;
    }

    const srcStat = fs.statSync(srcAbs);
    const dstStat = fs.existsSync(dstAbs) ? fs.statSync(dstAbs) : null;
    const current = dstStat ? imageInfo(dstAbs) : null;
    const source = kind === "image" ? imageInfo(srcAbs) : null;
    const cfg = sidecar(srcAbs);

    const warnings = [];
    if (!isReferenced(refs, served)) {
      warnings.push(`el código no pide ${served} — revisa el nombre`);
    }
    if (current && source) {
      const a1 = current.width / current.height;
      const a2 = source.width / source.height;
      if (Math.abs(a1 - a2) / a1 > 0.01) {
        warnings.push(
          `proporción distinta a la del arte que sustituye (${current.width}×${current.height} → ${source.width}×${source.height})`
        );
      }
      if (current.alpha && !source.alpha) {
        warnings.push("el arte anterior tenía transparencia y este no: saldrá un rectángulo opaco");
      }
    }

    // La máscara de caminabilidad no es una imagen: es un dato que el juego lee
    // píxel a píxel. Sin pérdida y sin reescalar, siempre.
    const isMask = /walkmask/i.test(rel);
    const transparent = cfg.transparent ?? (current ? current.alpha : kind !== "image" || (source?.alpha ?? false));

    const fresh = dstStat && dstStat.mtimeMs >= srcStat.mtimeMs;
    jobs.push({
      rel,
      src: srcAbs,
      dst: dstAbs,
      served,
      kind,
      transparent,
      lossless: cfg.lossless ?? isMask,
      quality: cfg.quality ?? 92,
      size: cfg.size ?? (kind === "image" ? null : current ? [current.width, current.height] : null),
      warnings,
      skip: !opts.force && fresh ? "sin cambios" : null,
      passthrough: kind === "image" && ext === ".webp" && !cfg.size && !cfg.quality,
    });
  }
  return jobs;
}

// ── Ejecución ───────────────────────────────────────────────────────────────
function runBlenderJobs(jobs) {
  const blender = findBlender();
  if (!blender) {
    console.log(
      "\n  ✖ No encuentro Blender. Instálalo o define la variable BLENDER con la ruta\n" +
        "    al ejecutable (p. ej. BLENDER=\"C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe\").\n" +
        "    Mientras tanto, exporta tu arte a .webp y vuelve a ejecutar: esos se copian sin Blender."
    );
    return jobs.map((j) => ({ ...j, failed: "sin Blender" }));
  }
  const jobFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "tp-art-")), "jobs.json");
  fs.writeFileSync(jobFile, JSON.stringify(jobs.map(({ src, dst, kind, transparent, lossless, quality, size }) => ({
    src, dst, kind, transparent, lossless, quality, size,
  })), null, 2));

  const res = spawnSync(blender, ["--background", "--python", HELPER, "--", "--jobs", jobFile], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const lines = `${res.stdout || ""}\n${res.stderr || ""}`.split(/\r?\n/).filter((l) => l.startsWith("[art]"));
  const byDst = new Map();
  for (const line of lines) {
    const m = line.match(/^\[art\] (OK|FALLO) (.+?) \| (.*)$/);
    if (m) byDst.set(path.normalize(m[2]), { ok: m[1] === "OK", detail: m[3] });
  }
  return jobs.map((j) => {
    const r = byDst.get(path.normalize(j.dst));
    if (!r) return { ...j, failed: "Blender no reportó este archivo (mira la salida completa con --verbose)" };
    return r.ok ? { ...j, detail: r.detail } : { ...j, failed: r.detail };
  });
}

function execute(jobs) {
  const todo = jobs.filter((j) => !j.skip);
  const done = [];

  for (const job of todo.filter((j) => j.passthrough)) {
    fs.mkdirSync(path.dirname(job.dst), { recursive: true });
    fs.copyFileSync(job.src, job.dst);
    const info = imageInfo(job.dst);
    done.push({ ...job, detail: info ? `${info.width}×${info.height} · copiado tal cual` : "copiado" });
  }

  const needBlender = todo.filter((j) => !j.passthrough);
  if (needBlender.length) done.push(...runBlenderJobs(needBlender));

  return [...done, ...jobs.filter((j) => j.skip)];
}

function report(results) {
  const pad = (s, n) => String(s).padEnd(n);
  const publicados = results.filter((r) => !r.skip && !r.failed && !r.error);
  const fallos = results.filter((r) => r.failed || r.error);
  const saltados = results.filter((r) => r.skip);

  console.log(`\n  ARTE MANUAL — renders/assets → public/assets`);
  console.log(`  ${"-".repeat(74)}`);
  if (!results.length) {
    console.log("  (renders/assets está vacío: deja ahí tus archivos y vuelve a ejecutar)");
  }
  for (const r of publicados) {
    console.log(`  ✔ ${pad(r.rel, 34)} → ${pad(r.served, 32)}`);
    if (r.detail) console.log(`      ${r.detail}`);
    for (const w of r.warnings ?? []) console.log(`      ⚠ ${w}`);
  }
  for (const r of saltados) {
    console.log(`  · ${pad(r.rel, 34)} ${r.skip}`);
    for (const w of r.warnings ?? []) console.log(`      ⚠ ${w}`);
  }
  for (const r of fallos) {
    console.log(`  ✖ ${pad(r.rel, 34)} ${r.failed ?? r.skip}`);
  }
  console.log(`  ${"-".repeat(74)}`);
  console.log(`  ${publicados.length} publicados · ${saltados.length} sin cambios · ${fallos.length} con problemas`);
  if (publicados.length) {
    console.log(`  Recarga fuerte la pestaña del juego (Ctrl+Shift+R) para verlo.`);
  }
  return fallos.length;
}

function once() {
  const jobs = plan();
  if (opts.check) {
    console.log("\n  (--check: no se escribe nada)");
    const pending = jobs.filter((j) => !j.skip);
    for (const j of jobs) {
      const estado = j.error ? `✖ ${j.skip}` : j.skip ? `· ${j.skip}` : `→ publicaría como ${j.served}`;
      console.log(`  ${j.rel.padEnd(34)} ${estado}`);
      for (const w of j.warnings ?? []) console.log(`      ⚠ ${w}`);
    }
    console.log(`\n  ${pending.length} pendientes de publicar.`);
    return jobs.filter((j) => j.error).length;
  }
  return report(execute(jobs));
}

if (opts.watch) {
  fs.mkdirSync(SRC_DIR, { recursive: true });
  once();
  console.log(`\n  Mirando ${path.relative(ROOT, SRC_DIR)} … (Ctrl+C para salir)\n`);
  let timer = null;
  fs.watch(SRC_DIR, { recursive: true }, (_event, file) => {
    if (!file || path.basename(file).startsWith(".")) return;
    clearTimeout(timer);
    // Los programas de diseño escriben en varias pasadas (temporal + rename):
    // esperar medio segundo evita convertir un archivo a medio guardar.
    timer = setTimeout(() => {
      console.log(`\n  cambio: ${file}`);
      try {
        once();
      } catch (err) {
        console.log(`  ✖ ${err.message}`);
      }
    }, 500);
  });
} else {
  process.exit(once());
}
