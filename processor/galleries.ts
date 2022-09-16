export type Gallery = {
  id: string;
  title: string;
  slug: string;
  images: Record<string, string>[];
};
export const galleries: Record<string, Gallery> = {};

export function addGallery(id: string, gal: Gallery) {
  galleries[id] = gal;
}

export function getGalleries() {
  return galleries;
}
