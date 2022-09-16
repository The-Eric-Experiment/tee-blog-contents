import { extension, Converter } from "showdown";
import * as path from "path";
import * as fs from "fs";

function showdownEscapes(text: string) {
  text = text.replace(/¨/g, "¨T");

  // Replace $ with ¨D
  // RegExp interprets $ as a special character
  // when it's in a replacement string
  text = text.replace(/\$/g, "¨D");

  // Standardize line endings
  text = text.replace(/\r\n/g, "\n"); // DOS to Unix
  text = text.replace(/\r/g, "\n"); // Mac to Unix

  // Stardardize line spaces
  text = text.replace(/\u00A0/g, "&nbsp;");

  return text;
}

extension("inject-md", function () {
  return [
    {
      type: "lang",
      filter(text: string, converter: Converter) {
        const INJECT_REGEX = /\[inject-md[\s]+"(.+)"\]/gm;

        return text.replace(INJECT_REGEX, function (_, injectPath) {
          const filePath = converter.getOption("filePath");
          const finalPath = path.join(filePath, injectPath);
          return showdownEscapes(fs.readFileSync(finalPath).toString("utf-8"));
        });
      },
    },
  ];
});
