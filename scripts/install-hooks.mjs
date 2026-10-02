#!/usr/bin/env node
// Run once after cloning: points git at the versioned hooks in .githooks/.
import { execFileSync } from "node:child_process";
import { ROOT } from "./lib/vault.mjs";

execFileSync("git", ["config", "core.hooksPath", ".githooks"], { cwd: ROOT, stdio: "inherit" });
console.log("Hooks instalados (core.hooksPath=.githooks).");
