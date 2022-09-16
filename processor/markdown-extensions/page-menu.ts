import { Converter, extension } from "showdown";
import { renderTemplate } from "../template";

extension("page-menu", function () {
  return [
    {
      type: "lang",
      filter(text: string, converter: Converter) {
        const MENU_REGEX = /\[page-menu\]([\s\S]*?)\[\/page-menu\]/gm;

        return text.replace(MENU_REGEX, (_, content) => {
          const ITEMS_REGEX = /\-\s+\[(.+)\]\((.+)\)/gi;
          const menuItems: Record<string, string>[] = [];

          let itemMatch: RegExpExecArray | null;
          while ((itemMatch = ITEMS_REGEX.exec(content))) {
            menuItems.push({
              href: itemMatch[2],
              text: itemMatch[1],
            });
          }

          return renderTemplate("page-menu.ejs", { menuItems });
        });
      },
    },
  ];
});
