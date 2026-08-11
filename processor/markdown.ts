import * as fs from "fs";
import * as path from "path";
import showdown from "showdown";
import type { ConverterOptions } from "showdown";
const { Converter } = showdown;
import "./markdown-extensions/file-download.ts";
import "./markdown-extensions/fix-block-elements.ts";
import "./markdown-extensions/gallery.ts";
import "./markdown-extensions/hash-html-blocks.ts";
import "./markdown-extensions/headers.ts";
import "./markdown-extensions/image-wrap.ts";
import "./markdown-extensions/inject-md.ts";
import "./markdown-extensions/music.ts";
import "./markdown-extensions/no-retro.ts";
import "./markdown-extensions/page-layout.ts";
import "./markdown-extensions/page-menu.ts";
import "./markdown-extensions/png-to-jpg.ts";
import "./markdown-extensions/youtube.ts";
import "./markdown-extensions/show-for.ts";

const COMMON: string[] = [];
const EXTENSIONS = [
  ...COMMON,
  "fix-block-elements",
  "inject-md",
  "music",
  "no-retro",
  "headers",
  "youtube",
  "page-layout",
  "gallery",
  "image-wrap",
  "page-menu",
  "png-to-jpg",
  "file-download",
  "show-for",
];

export function convertToHtml(
  filePath: string,
  input: string,
  opts: ConverterOptions = {}
) {
  const converter = new Converter({
    extensions: EXTENSIONS,
    filePath,
    ...opts,
  });
  let output = converter.makeHtml(input);
  // remove empty paragraphs
  let match: RegExpExecArray | null;
  const pRegex = /<p>\s*<\/p>/gm;
  while ((match = pRegex.exec(output))) {
    output = output.replace(match[0], "");
  }
  return output;
}

export function loadFromMarkdown(
  filePath: string,
  ...pathParts: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(...pathParts);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const content = data.toString("utf-8");
      const result = convertToHtml(filePath, content, {
        parseBlockHTML: true,
        omitExtraWLInCodeBlocks: true,
        literalMidWordUnderscores: true,
        disableForced4SpacesIndentedSublists: true,
      });
      resolve(result);
    });
  });
}
