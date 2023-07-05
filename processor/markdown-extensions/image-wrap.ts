import { extension } from "showdown";
import { renderTemplate } from "../template";
import path from "path";

function parseProperties(rest: string) {
  let src: string = "";
  let alt: string = "";
  let d;

  if (rest) {
    src = (d = /src="(.+?)"/.exec(rest)) ? d[1] : "";
    alt = (d = /alt="(.+?)"/.exec(rest)) ? d[1] : "";
  }

  // Check if the src is a PNG and change the extension to jpg
  const extension = path.extname(src);
  if (extension === ".png") {
    src = src.replace(".png", ".jpg");
  }

  return {
    src,
    alt,
  };
}

extension("image-wrap", function () {
  return [
    {
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
