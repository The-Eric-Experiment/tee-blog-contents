import { Converter, extension } from "showdown";
import { renderTemplate } from "../template";

extension("file-download", function () {
  return [
    {
      type: "lang",
      filter(text: string, converter: Converter) {
        const FILE_DOWNLOAD_REGEX =
          /\[file-download\]([\s\S]*?)\[\/file-download\]/gm;

        return text.replace(FILE_DOWNLOAD_REGEX, function (_, content) {
          const [, name] = /name: "(.+)"/gm.exec(content) as RegExpExecArray;
          const [, file] = /file: "(.+)"/gm.exec(content) as RegExpExecArray;
          const [, url] = /url: "(.+)"/gm.exec(content) as RegExpExecArray;
          const [, description] = /description:[\n\r]+([.\s\S]+)/gm.exec(
            content
          ) as RegExpExecArray;

          const id = name.toLowerCase().replace(/[\s\.]/gm, "");

          return renderTemplate("file-download.ejs", {
            id: id.trim(),
            name: name.trim(),
            file: file.trim(),
            url: url.trim(),
            description: converter.makeHtml(description.trim()),
          });
        });
      },
    },
  ];
});
