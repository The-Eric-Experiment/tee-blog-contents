import { extension } from "showdown";
import { renderTemplate } from "../template";
import path, { join } from "path";
import config from "../config";

type YoutubeThumb = {
  path: string;
  videoId: string;
};

export const YOUTUBE_THUMBS: YoutubeThumb[] = [];

function slugJoin(filePath: string, slug: string): string {
  // Normalize paths (replace '\\' with '/') and split into segments
  const filePathSegments = filePath.replace(/\\/g, "/").split("/");
  const slugSegments = slug.replace(/\\/g, "/").split("/");

  // Check if the last segment of filePath is the same as the first segment of slug
  if (
    filePathSegments.length > 0 &&
    slugSegments.length > 0 &&
    filePathSegments[filePathSegments.length - 1] === slugSegments[0]
  ) {
    // Remove the first segment of slug
    slugSegments.shift();
  }

  // Join the segments back into paths and concatenate them
  return join(filePathSegments.join("/"), slugSegments.join("/"));
}

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

          if (options.slug && options.filePath) {
            YOUTUBE_THUMBS.push({
              path: slugJoin(options.filePath, options.slug),
              videoId: vid,
            });
          }

          return renderTemplate("youtube.ejs", {
            url: fUrl,
            videoId: vid,
            title,
            thumbPath:
              options.contentPath &&
              path.join(options.contentPath, `${vid}.jpg`),
          });
        });
      },
    },
  ];
});
