import * as ejs from "ejs";
import * as fs from "fs";
import * as path from "path";

export function renderTemplate(template: string, data: object) {
  const layoutEjs = fs.readFileSync(
    path.join(__dirname, "templates", template),
    { encoding: "utf-8" }
  );

  const renderedLayout = ejs.render(layoutEjs, data);

  return renderedLayout;
}
