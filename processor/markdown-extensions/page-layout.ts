import { extension, Converter, ConverterOptions } from "showdown";
import * as fs from "fs";
import * as path from "path";
import * as ejs from "ejs";

type Layout = Record<string, string>;

const getLayout = (layout: Layout, converter: Converter) => {
  const layoutEjs = fs.readFileSync(
    path.join(__dirname, "../templates/page-layout.ejs"),
    { encoding: "utf-8" }
  );

  const model = {
    leftContent: layout["left-content"],
    content: layout["content"],
    rightContent: layout["right-content"],
  };

  const renderedLayout = ejs.render(layoutEjs, model);

  // The regex in the markdown processor for php is weird.
  return "\n\n" + renderedLayout;
};

function removeParagraph(text: string) {
  const PARAGRAPH_REGEX =
    /(<p>\s*)(¨D¨D\s(content|right-content|left-content)\s¨D¨D)(\s*<\/p>)/g;

  let match: RegExpExecArray | null;

  while ((match = PARAGRAPH_REGEX.exec(text))) {
    text = text.replace(match[0], match[2]);
  }

  return text;
}

function parser() {
  return [
    {
      type: "lang",
      filter(text: string, converter: Converter, options?: ConverterOptions) {
        let output = removeParagraph(text);
        const LAYOUT_REGEX =
          /¨D¨D\s(content|right-content|left-content)\s¨D¨D([\s\S]*?(?=[\n\r].*?¨D|$))/g;

        const layout: Layout = {};

        let match: RegExpExecArray | null;

        while ((match = LAYOUT_REGEX.exec(output))) {
          const layoutPart = match[1];
          const content = match[2];
          layout[layoutPart] = converter.makeHtml(content);
        }

        if (Object.keys(layout).length < 1) {
          return output;
        }

        return getLayout(layout, converter);
      },
    },
  ];
}

extension("page-layout", parser);
