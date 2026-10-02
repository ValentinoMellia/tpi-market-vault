#!/usr/bin/env node
// Vault lint: frontmatter, summary line, wikilinks, orphans, disputes and legacy references.
// Usage: node scripts/lint-vault.mjs   (exit 1 when there are errors)
import {
  baseName,
  buildResolver,
  extractSummary,
  listMarkdown,
  parseNote,
  read,
  stripCode,
  wikilinks,
} from "./lib/vault.mjs";

const REQUIRED_FM = ["tipo", "estado", "actualizado"];
const TIPOS = ["entidad", "concepto", "decision", "pregunta", "integracion", "estado", "historia", "guia", "indice"];
const ESTADOS = ["vigente", "borrador", "en-disputa", "archivado"];

// Root notes that are entry points and may have no inbound links.
const ENTRY_POINTS = new Set(["Market Service - Overview"]);
// The only note allowed to mention the legacy docs folder.
const LEGACY_ALLOWED = new Set(["Plan de migración"]);
const LEGACY_PATTERNS = [
  /tpi\/docs/,
  /tpi\\docs/,
  /\.docx\b/i,
  /\.pdf\b/i,
  /CONTEXTO-MERCADO/,
  /CONTRATOS-COMUNICACION/,
  /KAFKA_EVENT_STANDARD/,
];

// Generated files that may not exist on a fresh clone.
const VIRTUAL_TARGETS = new Set(["index", "log"]);

const ROOT_EXCLUDED_FILES = new Set(["AGENTS.md", "CLAUDE.md", "README.md"]);
const EXCLUDED_PREFIXES = ["00 - Inbox/", "03 - Resources/Templates/", "log/"];

const all = listMarkdown();
const resolve = buildResolver(all);

const isGenerated = (f) => f === "index.md" || f === "log.md";
const isExcluded = (f) => ROOT_EXCLUDED_FILES.has(f) || EXCLUDED_PREFIXES.some((p) => f.startsWith(p));
// Notes subject to the full rule set.
const notes = all.filter((f) => !isExcluded(f) && !isGenerated(f));
// Files whose links are resolved and scanned for legacy references.
const linkChecked = all.filter((f) => !ROOT_EXCLUDED_FILES.has(f) && !f.startsWith("00 - Inbox/") && !f.startsWith("03 - Resources/Templates/"));

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push({ file, msg });
const warn = (file, msg) => warnings.push({ file, msg });

const data = new Map(); // file -> { fm, body, text }
for (const f of linkChecked) {
  const text = read(f);
  data.set(f, { ...parseNote(text), text });
}

// 1-2. Frontmatter and summary line.
for (const f of notes) {
  const { fm, body } = data.get(f);
  if (!fm) {
    err(f, "falta el frontmatter");
  } else {
    for (const key of REQUIRED_FM) if (!fm[key]) err(f, `frontmatter sin \`${key}\``);
    if (fm.tipo && !TIPOS.includes(fm.tipo)) warn(f, `tipo desconocido: ${fm.tipo}`);
    if (fm.estado && !ESTADOS.includes(fm.estado)) warn(f, `estado desconocido: ${fm.estado}`);
    if (fm.actualizado && !/^\d{4}-\d{2}-\d{2}$/.test(fm.actualizado)) warn(f, `\`actualizado\` no es AAAA-MM-DD: ${fm.actualizado}`);
    for (const key of ["verificado_contra", "tags"]) if (!fm[key]) warn(f, `frontmatter sin \`${key}\``);
  }
  const { h1, summary } = extractSummary(body);
  if (!h1) err(f, "falta el título H1");
  else if (!summary) err(f, "la nota no abre con un resumen `> ` después del H1");
}

// 3. Wikilinks and inbound graph.
const inbound = new Map(all.map((f) => [f, new Set()]));
for (const f of linkChecked) {
  const { body, text } = data.get(f);
  const seen = new Set();
  for (const target of wikilinks(f.startsWith("log/") || f === "log.md" ? text : body)) {
    if (seen.has(target)) continue;
    seen.add(target);
    if (/\.(png|jpe?g|gif|svg|pdf|webp)$/i.test(target)) continue;
    const dest = resolve(target);
    // index.md and log.md are generated locally and may be absent.
    if (!dest && VIRTUAL_TARGETS.has(target.toLowerCase())) continue;
    if (!dest) err(f, `wikilink roto: [[${target}]]`);
    else if (dest !== f) inbound.get(dest).add(f);
  }
}

// 4. Orphans: need at least one inbound link from a non-index, non-log note.
for (const f of notes) {
  const name = baseName(f);
  if (ENTRY_POINTS.has(name)) continue;
  const sources = [...inbound.get(f)].filter((s) => !isGenerated(s) && !s.startsWith("log/"));
  if (sources.length > 0) continue;
  if (f.startsWith("04 - Archive/")) continue; // archived notes may be reachable only from the generated index
  err(f, "nota huérfana: ningún enlace entrante desde otra nota");
}

// 5. Disputed notes must point to an open question (or be one).
const isOpenQuestion = (f) => baseName(f).startsWith("Q-") && data.get(f)?.fm?.estado === "en-disputa";
for (const f of notes) {
  const { fm, body } = data.get(f);
  if (fm?.estado !== "en-disputa") continue;
  if (isOpenQuestion(f)) continue;
  const linksOpenQ = wikilinks(body).some((t) => {
    const dest = resolve(t);
    return dest && isOpenQuestion(dest);
  });
  if (!linksOpenQ) err(f, "estado `en-disputa` sin enlace a una pregunta `Q-` abierta");
}

// 6. Legacy documentation references.
for (const f of linkChecked) {
  if (LEGACY_ALLOWED.has(baseName(f))) continue;
  const text = stripCode(data.get(f).text);
  for (const re of LEGACY_PATTERNS) {
    const m = text.match(re);
    if (m) err(f, `referencia a documentación histórica: \`${m[0]}\``);
  }
}

// Report.
const fmt = (list) =>
  list
    .sort((a, b) => a.file.localeCompare(b.file, "es"))
    .map((x) => `  - ${x.file}: ${x.msg}`)
    .join("\n");

console.log(`Notas revisadas: ${notes.length} (archivos totales: ${all.length})`);
if (warnings.length) console.log(`\nAdvertencias (${warnings.length}):\n${fmt(warnings)}`);
if (errors.length) {
  console.error(`\nErrores (${errors.length}):\n${fmt(errors)}`);
  process.exit(1);
}
console.log("\nLint OK: sin errores.");
