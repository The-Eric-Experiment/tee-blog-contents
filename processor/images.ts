import { PostMetadata } from "./types";

// const ytRegex = /\!yt\[(.+)\]\((.+)\)/gi;

function parseProperties(rest: string) {
  let src: string;
  let alt: string;
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

function isSrcWithDomain(src: string): boolean {
  // Check if src starts with a domain name
  return /^(http:\/\/|https:\/\/|\/\/)/i.test(src);
}

function isContentPublic(url: string): boolean {
  const contentPublicRegex = /^\/contents\/public\/.+/i;
  return contentPublicRegex.test(url);
}

function getImageTagPath(ln: string) {
  const imgRegex = /<img(.*?)\/?>/gi;
  const match = imgRegex.exec(ln);
  if (!match || !match.length) {
    return undefined;
  }

  const { src } = parseProperties(match[1]);

  // Check if src starts with a domain name
  if (isSrcWithDomain(src) || isContentPublic(src)) {
    return undefined;
  }

  return src;
}

function getImageMdPath(ln: string) {
  const imgMdRegex = /\!\[([^\[]+)\]\(([^\)]+)\)/gi;
  const match = imgMdRegex.exec(ln);
  if (!match || !match.length) {
    return undefined;
  }

  const src = match[2];

  // Check if src starts with a domain name
  if (isSrcWithDomain(src) || isContentPublic(src)) {
    return undefined;
  }

  return src;
}

function getContentImagesFromMD(content: string) {
  const lines = content.split(/\r?\n/);

  const imgs = lines
    .map((line) => {
      let img = getImageTagPath(line);

      if (!img) {
        img = getImageMdPath(line);
      }

      return img;
    })
    .filter((o) => !!o);

  return imgs;
}

export function getContentImages(posts: PostMetadata[]): string[] {
  let imgs = posts.map((p) => getContentImagesFromMD(p.content));
  return [].concat.apply([], imgs);
}
