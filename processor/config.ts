import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import { fileURLToPath } from "url";
import type { ContentConfig } from "./types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const currentDir = path.join(__dirname, "..");
const configContent = fs.readFileSync(
  path.join(currentDir, "content-config.yaml"),
  { encoding: "utf-8" }
);
const config: ContentConfig = yaml.parse(configContent);

export default config;
