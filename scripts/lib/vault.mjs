// Shared helpers for the vault scripts (no dependencies).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// Directories never scanned at all.
const SKIP_DIRS = new Set([".obsidian", ".github", ".git", ".atl", ".claude", ".trash", "node_modules", "scripts", "integrations"]);

/** Returns all .md files under ROOT as POSIX-style relative paths, sorted. */
export function listMarkdown() {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        out.push(path.relative(ROOT, path.join(dir, entry.name)).split(path.sep).join("/"));
      }
    }
  };
  walk(ROOT);
  return out.sort((a, b) => a.localeCompare(b, "es"));
}

export function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^﻿/, "").replace(/\r\n/g, "\n");
}

export function baseName(rel) {
  return path.posix.basename(rel, ".md");
}

/** Splits a note into frontmatter fields (flat key: value) and the body. */
export function parseNote(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: null, body: text };
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return { fm, body: text.slice(m[0].length) };
}

/** Removes fenced code blocks and inline code so their content is ignored. */
export function stripCode(text) {
  return text.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, "").replace(/`[^`\n]*`/g, "");
}

/** Wikilink targets in a text: alias and heading stripped, code ignored. */
export function wikilinks(text) {
  const targets = [];
  for (const m of stripCode(text).matchAll(/\[\[([^\]\n]+?)\]\]/g)) {
    const target = m[1].split("|")[0].split("#")[0].trim();
    if (target) targets.push(target);
  }
  return targets;
}

/** Returns { h1, summary } where summary is the `> ` line right after the H1 (or null). */
export function extractSummary(body) {
  const lines = body.split("\n");
  const h1 = lines.findIndex((l) => /^#\s+/.test(l));
  if (h1 === -1) return { h1: null, summary: null };
  const title = lines[h1].replace(/^#\s+/, "").trim();
  for (let i = h1 + 1; i < lines.length; i++) {
    if (lines[i].trim() === "") continue;
    return { h1: title, summary: lines[i].startsWith("> ") ? lines[i].slice(2).trim() : null };
  }
  return { h1: title, summary: null };
}

/** Resolves a wikilink target to a relative path, Obsidian-style (case-insensitive, name or path). */
export function buildResolver(files) {
  const byName = new Map();
  const byPath = new Map();
  for (const f of files) {
    byName.set(baseName(f).toLowerCase(), f);
    byPath.set(f.replace(/\.md$/, "").toLowerCase(), f);
  }
  return (target) => {
    const t = target.replace(/\.md$/, "").toLowerCase();
    if (byName.has(t)) return byName.get(t);
    if (byPath.has(t)) return byPath.get(t);
    for (const [p, f] of byPath) if (p.endsWith("/" + t)) return f;
    return null;
  };
}
