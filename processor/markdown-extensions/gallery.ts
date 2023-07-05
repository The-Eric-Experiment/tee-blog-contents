import { Converter, extension } from "showdown";
import { v4 } from "uuid";
import { addGallery } from "../galleries";
import { renderTemplate } from "../template";
import * as path from "path";

extension("gallery", function () {
  return [
    {
      type: "lang",
      filter(text: string, converter: Converter) {
        const GALLERY_REGEX = /\[gallery\]([\s\S]*?)\[\/gallery\]/gm;

        const slug = converter.getOption("slug");

        return text.replace(GALLERY_REGEX, (_, content) => {
          const ITEMS_REGEX = /\-\s+\[(.*)\]\((.+)\)/gi;
          const images: Record<string, string>[] = [];

          const TITLE_REGEX = /title: ([^\n\r]+)/g;

          const titleMatch = TITLE_REGEX.exec(content);
          const title = titleMatch ? titleMatch[1] || "" : "";

          let itemMatch: RegExpExecArray | null;
          while ((itemMatch = ITEMS_REGEX.exec(content))) {
            images.push({
              src: itemMatch[2],
              text: itemMatch[1],
            });
          }

          const id = v4();

          // Pass the original images to addGallery
          addGallery(id, { id, slug, images, title });

          // Map the images to change the extension for the template
          const imagesForTemplate = images.map((image) => {
            const extension = path.extname(image.src);
            const isPng = extension === ".png";
            return {
              src: isPng ? image.src.replace(".png", ".jpg") : image.src,
              text: image.text,
            };
          });

          // Pass the images with modified extensions to renderTemplate
          return renderTemplate("gallery-widget.ejs", {
            id,
            slug,
            images: imagesForTemplate,
            title,
          });
        });
      },
    },
  ];
});
