#!/usr/bin/env node
/**
 * Frees ACKO demo dev ports (5173–5175) before starting dev:all.
 * Prevents "Port already in use" when a stale Vite process is left behind.
 */
import { execSync } from "node:child_process";

const PORTS = [5173, 5174, 5175, 5176];

for (const port of PORTS) {
  try {
    const pids = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
    for (const pid of pids) {
      process.kill(Number(pid), "SIGTERM");
      console.log(`Freed port ${port} (pid ${pid})`);
    }
  } catch {
    // No listener on this port — expected.
  }
}
