import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import { ContentConfig } from "./types";

const currentDir = path.join(__dirname, "..");
const configContent = fs.readFileSync(
  path.join(currentDir, "content-config.yaml"),
  { encoding: "utf-8" }
);
const config: ContentConfig = yaml.parse(configContent);

export default config;
