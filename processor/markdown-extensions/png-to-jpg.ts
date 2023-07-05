import * as Showdown from "showdown";

// Function to detect if a URL is relative
function isRelativeUrl(url: string): boolean {
  // A URL is considered relative if it doesn't start with "http://", "https://", or "//"
  return !/^(https?:)?\/\//i.test(url);
}

// Define the Showdown extension
const changeImageExtension: Showdown.ShowdownExtension[] = [
  {
    type: "output",
    regex: /<img\s+[^>]*src="([^"]*)"[^>]*>/gi,
    replace: (match: string, p1: string) => {
      // p1 contains the value of the "src" attribute in the img tag.
      // Check if the URL is relative and ends with ".png"
      if (isRelativeUrl(p1) && p1.endsWith(".png")) {
        // Change the extension from .png to .jpg
        const newUrl = p1.replace(/\.png$/i, ".jpg");
        // Replace the URL in the img tag
        return match.replace(p1, newUrl);
      }
      // If the URL isn't relative or doesn't end with ".png", leave it unchanged
      return match;
    },
  },
];

// Register the extension with Showdown
Showdown.extension("png-to-jpg", changeImageExtension);
