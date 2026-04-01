import fs from "node:fs";
import { siriusConfigSchema, type SiriusConfig } from "@siriusly/shared";
import { resolveSiriusConfigPath } from "./paths.js";

export function readConfigFile(): SiriusConfig | null {
  const configPath = resolveSiriusConfigPath();

  if (!fs.existsSync(configPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return siriusConfigSchema.parse(raw);
  } catch {
    return null;
  }
}
