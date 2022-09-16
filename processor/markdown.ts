import * as fs from "fs";
import * as path from "path";
import { Converter } from "showdown";
import "./markdown-extensions/file-download";
import "./markdown-extensions/gallery";
import "./markdown-extensions/hash-html-blocks";
import "./markdown-extensions/headers";
import "./markdown-extensions/image-wrap";
import "./markdown-extensions/inject-md";
import "./markdown-extensions/page-layout";
import "./markdown-extensions/page-menu";
import "./markdown-extensions/youtube";
import "./markdown-extensions/show-for";

const COMMON: string[] = [];
const EXTENSIONS = [
  ...COMMON,
  "inject-md",
  "headers",
  "youtube",
  "page-layout",
  "gallery",
  "image-wrap",
  "page-menu",
  "file-download",
  "show-for",
];

export function convertToHtml(
  filePath: string,
  input: string,
  opts: Record<string, string> = {}
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
      const result = convertToHtml(filePath, content);
      resolve(result);
    });
  });
}
