import { extension } from "showdown";
import { renderTemplate } from "../template";

/**
 * Replace with video iframes
 */
extension("youtube", function () {
  return [
    {
      type: "lang",
      filter: function (text, converter, options) {
        const ytRegex = /\^\^youtube\s+\[([^\]]*)\]\(([^\)]+)\)/gim;
        const fullYoutubeRegex =
          /(?:(?:https?:)?(?:\/\/)?)(?:(?:www)?\.)?youtube\.(?:.+?)\/(?:(?:watch\?v=)|(?:embed\/))([a-zA-Z0-9_-]{11})/i;
        const shortYoutubeRegex =
          /(?:(?:https?:)?(?:\/\/)?)?youtu\.be\/([a-zA-Z0-9_-]{11})/i;
        const vimeoRegex =
          /(?:(?:https?:)?(?:\/\/)?)(?:(?:www)?\.)?vimeo.com\/(\d+)/;

        return text.replace(ytRegex, function (match, title, url) {
          let fUrl = url;
          let m: RegExpMatchArray | null;
          let vid: string | undefined;
          if (
            (m = shortYoutubeRegex.exec(url)) ||
            (m = fullYoutubeRegex.exec(url))
          ) {
            vid = m[1];
            fUrl = "https://www.youtube.com/embed/" + vid + "?rel=0";
          } else if ((m = vimeoRegex.exec(url))) {
            vid = m[1];
            fUrl = "https://player.vimeo.com/video/" + vid;
          } else {
            return match;
          }
          return renderTemplate("youtube.ejs", {
            url: fUrl,
            videoId: vid,
            title,
          });
        });
      },
    },
  ];
});
