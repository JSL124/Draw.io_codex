import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from "dotenv";

let loaded = false;

export function loadBackendEnv() {
  if (loaded) {
    return;
  }

  const currentFile = fileURLToPath(import.meta.url);
  const backendDir = path.dirname(currentFile);
  const projectRoot = path.resolve(backendDir, "..");

  const candidatePaths = [
    path.join(projectRoot, ".env.local"),
    path.join(projectRoot, ".env"),
    path.join(backendDir, ".env.local"),
    path.join(backendDir, ".env")
  ];

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: false });
    }
  }

  loaded = true;
}
