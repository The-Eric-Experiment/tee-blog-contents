import { Converter, extension } from "showdown";
import { renderTemplate } from "../template";

extension("show-for", function () {
  return [
    {
      type: "lang",
      filter(text: string, converter: Converter) {
        const SHOW_FOR_REGEX =
          /\<!--\s+\[ShowFor\s+"([^"]+)"\]\s+--\>([\s\S]*?)\<!--\s+\[EndShowFor\]\s+--\>/gm;

        return text.replace(SHOW_FOR_REGEX, (_, variant, content) => {
          return renderTemplate("show-for.ejs", { variant, content });
        });
      },
    },
  ];
});
