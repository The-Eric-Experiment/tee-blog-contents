import { extension } from "showdown";
import { renderTemplate } from "../template";

extension("headers", () => {
  return [
    {
      type: "output",
      filter(text, converter, options) {
        const HEADER_HTML =
          /(?:<p>)?<h([\d]).*?\/?>([^<{]+)(?:(?:\s+){(#[^\s]+)})?<\/h[\d]>(?:<\/p>)?/gi;

        return text.replace(
          HEADER_HTML,
          function (wholeMatch, hIdent, text, anchor) {
            return renderTemplate("header.ejs", {
              text,
              anchor,
              size: hIdent,
            });
          }
        );
      },
    },
  ];
});
