import { extension } from "showdown";
import { renderTemplate } from "../template";

function parseProperties(rest: string) {
  let src: string = "";
  let alt: string = "";
  let d;

  if (rest) {
    src = (d = /src="(.+?)"/.exec(rest)) ? d[1] : "";
    alt = (d = /alt="(.+?)"/.exec(rest)) ? d[1] : "";
  }

  return {
    src,
    alt,
  };
}

extension("image-wrap", function () {
  return [
    {
      // It's a bit hackish but we let the core parsers replace the reference image for an image tag
      // then we replace the full img tag in the output with our iframe
      type: "output",
      filter: function (text) {
        const imgRegex = /<p><img(.*?)\/?><\/p>?/gi;
        return text.replace(imgRegex, function (_, rest) {
          const props = parseProperties(rest);
          return renderTemplate("image.ejs", props);
        });
      },
    },
  ];
});
