import ejs from "ejs";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function renderTemplate(template: string, data: object) {
  const layoutEjs = fs.readFileSync(
    path.join(__dirname, "templates", template),
    { encoding: "utf-8" }
  );

  const renderedLayout = ejs.render(layoutEjs, data);

  return renderedLayout;
}
