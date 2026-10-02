#!/usr/bin/env node
// Generates index.md (catalog of notes) and log.md (concatenation of log/*.md).
// Both files are GENERATED: never edit them by hand.
// Usage: node scripts/generate-index.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, baseName, extractSummary, listMarkdown, parseNote, read } from "./lib/vault.mjs";

const SUMMARY_MAX = 200;
const PROJECT_DIR = "01 - Projects/Market Service/";
// Curated reading order for the project root notes; anything else follows alphabetically.
const PROJECT_ORDER = [
  "Market Service - Overview",
  "Estado actual del código",
  "Roadmap de entendimiento",
  "Roadmap de trabajo",
  "Plan del Sprint 2",
  "Taller de decisiones",
  "Plan de migración",
];

const collator = new Intl.Collator("es", { numeric: true, sensitivity: "base" });
const byName = (a, b) => collator.compare(a.name, b.name);

function cleanSummary(text) {
  const plain = text
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|[\s(])\*(?!\s)(.+?)\*(?=[\s).,;:]|$)/g, "$1$2")
    .replace(/(^|[\s(])_(?!\s)(.+?)_(?=[\s).,;:]|$)/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= SUMMARY_MAX) return plain;
  // Prefer whole sentences; fall back to a word boundary with an ellipsis.
  const sentences = plain.match(/[^.!?]+[.!?]+(?=\s|$)/g) || [];
  let acc = "";
  for (const sentence of sentences) {
    const next = (acc + sentence.trim()).trim();
    if (next.length > SUMMARY_MAX) break;
    acc = next + " ";
  }
  if (acc.trim().length >= 40) return acc.trim();
  const cut = plain.slice(0, SUMMARY_MAX - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > SUMMARY_MAX * 0.6 ? lastSpace : cut.length).replace(/[\s,;:.]+$/, "") + "…";
}

/** Status marker shown next to notes that are not plainly in force. */
function statusLabel(n) {
  const estado = n.fm.estado;
  if (!estado || estado === "vigente") return "";
  if (n.name.startsWith("Q-")) return estado === "en-disputa" ? "(abierta) " : estado === "archivado" ? "(archivada) " : "(" + estado + ") ";
  return "(" + estado.replace("-", " ") + ") ";
}

// ---- Collect notes -------------------------------------------------------
const EXCLUDED_ROOT = new Set(["AGENTS.md", "CLAUDE.md", "README.md", "index.md", "log.md"]);
const EXCLUDED_PREFIXES = ["00 - Inbox/", "03 - Resources/Templates/", "log/"];

const notes = listMarkdown()
  .filter((f) => !EXCLUDED_ROOT.has(f) && !EXCLUDED_PREFIXES.some((p) => f.startsWith(p)))
  .map((f) => {
    const { fm, body } = parseNote(read(f));
    const { summary } = extractSummary(body);
    return { file: f, name: baseName(f), fm: fm || {}, summary: summary ? cleanSummary(summary) : "(sin resumen)" };
  });

// ---- Group ---------------------------------------------------------------
const sections = [
  { title: "Proyecto", match: (n) => n.file.startsWith(PROJECT_DIR) && !n.file.slice(PROJECT_DIR.length).includes("/"), sort: projectSort },
  { title: "Propuestas", match: (n) => n.file.startsWith(PROJECT_DIR + "Propuestas/"), sort: byName },
  { title: "Decisiones", match: (n) => n.file.startsWith(PROJECT_DIR + "Decisiones/"), sort: (a, b) => hubFirst(a, b, /Índice$/) },
  { title: "Preguntas", match: (n) => n.file.startsWith(PROJECT_DIR + "Preguntas abiertas/"), sort: questionSort },
  { title: "Backlog", match: (n) => n.file.startsWith(PROJECT_DIR + "Backlog/"), sort: (a, b) => hubFirst(a, b, /Índice$/) },
  { title: "Plataforma", match: (n) => n.file.startsWith("02 - Areas/Plataforma AulaQuest/"), sort: byName },
  { title: "Dominio", match: (n) => n.file.startsWith("02 - Areas/Dominio Mercado/"), sort: byName },
  { title: "Convenciones", match: (n) => n.file.startsWith("02 - Areas/Convenciones/"), sort: byName },
  { title: "Conceptos", match: (n) => n.file.startsWith("03 - Resources/Conceptos/"), sort: byName },
  { title: "Recursos", match: (n) => n.file.startsWith("03 - Resources/") && !n.file.slice("03 - Resources/".length).includes("/"), sort: byName },
  { title: "Archivo", match: (n) => n.file.startsWith("04 - Archive/"), sort: byName },
];

function projectSort(a, b) {
  const ia = PROJECT_ORDER.indexOf(a.name);
  const ib = PROJECT_ORDER.indexOf(b.name);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  return byName(a, b);
}
function hubFirst(a, b, re) {
  const ha = re.test(a.name);
  const hb = re.test(b.name);
  if (ha !== hb) return ha ? -1 : 1;
  return byName(a, b);
}
function questionSort(a, b) {
  const archived = (n) => (n.fm.estado === "archivado" ? 1 : 0);
  if (archived(a) !== archived(b)) return archived(a) - archived(b);
  return byName(a, b);
}

const used = new Set();
const lines = [];
for (const s of sections) {
  const items = notes.filter((n) => !used.has(n.file) && s.match(n)).sort(s.sort);
  items.forEach((n) => used.add(n.file));
  const entries = items.map((n) => `- [[${n.name}]]: ${statusLabel(n)}${n.summary}`);
  if (s.title === "Proyecto") entries.push("- [[log]]: registro cronológico de operaciones.");
  if (entries.length) lines.push(`## ${s.title}`, ...entries, "");
}
const rest = notes.filter((n) => !used.has(n.file)).sort(byName);
if (rest.length) lines.push("## Otros", ...rest.map((n) => `- [[${n.name}]]: ${statusLabel(n)}${n.summary}`), "");

// ---- index.md ------------------------------------------------------------
const latest = (dates) => dates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().at(-1);

function splitHeader(file, fallbackTitle, fallbackSummary) {
  const full = path.join(ROOT, file);
  const text = fs.existsSync(full) ? read(file) : "";
  const { fm, body } = parseNote(text);
  const firstSection = body.search(/^## /m);
  const intro = (firstSection === -1 ? body : body.slice(0, firstSection)).trim();
  return { fm: fm || {}, intro: intro || `# ${fallbackTitle}\n\n> ${fallbackSummary}` };
}

function frontmatter(fm, actualizado) {
  const keys = ["tipo", "estado", "verificado_contra", "actualizado", "tags"];
  const merged = { tipo: "indice", estado: "vigente", verificado_contra: "ninguno", tags: "[mercado, indice]", ...fm, actualizado };
  return ["---", ...keys.map((k) => `${k}: ${merged[k]}`), "---"].join("\n");
}

const index = splitHeader("index.md", "Índice", "Catálogo de todas las notas del vault de Mercado. Leer primero al consultar. Reglas del vault en `AGENTS.md`.");
const indexDate = latest(notes.map((n) => n.fm.actualizado)) || index.fm.actualizado;
const indexOut = `${frontmatter(index.fm, indexDate)}\n${index.intro}\n\n${lines.join("\n").trimEnd()}\n`;

// ---- log.md --------------------------------------------------------------
const logDir = path.join(ROOT, "log");
const logFiles = fs.existsSync(logDir) ? fs.readdirSync(logDir).filter((f) => f.endsWith(".md")).sort() : [];
const logEntries = logFiles.map((f) => read(`log/${f}`).trim());
const logHeader = splitHeader("log.md", "Log", "Registro cronológico de operaciones sobre el vault, la más reciente abajo. Formato definido en `AGENTS.md`.");
const logDate = latest(logFiles.map((f) => f.slice(0, 10))) || logHeader.fm.actualizado;
const logOut = `${frontmatter({ ...logHeader.fm, tags: "[mercado, log]" }, logDate)}\n${logHeader.intro}\n\n${logEntries.join("\n\n")}\n`;

function write(file, content) {
  const full = path.join(ROOT, file);
  if (fs.existsSync(full) && read(file) === content) return false;
  fs.writeFileSync(full, content, "utf8");
  return true;
}

const changed = [write("index.md", indexOut) && "index.md", write("log.md", logOut) && "log.md"].filter(Boolean);
console.log(`Notas indexadas: ${used.size + rest.length}; entradas de log: ${logEntries.length}.`);
console.log(changed.length ? `Actualizado: ${changed.join(", ")}` : "Sin cambios.");
