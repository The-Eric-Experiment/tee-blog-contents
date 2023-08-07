import {
  CanvasRenderingContext2D,
  createCanvas,
  Image,
  loadImage,
  registerFont,
} from "canvas";
import * as ejs from "ejs";
import { promises as fs } from "fs";
import { GifCodec, GifFrame, GifUtil } from "gifwrap";
import { join } from "path";
import sharp from "sharp";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const currentDir = join(__dirname, "..");
const yargies = yargs(hideBin(process.argv));
const args = yargies.argv as { dest?: string; ["no-image"]?: string };
let destDir = join(currentDir, ".temp/");

if (args.dest) {
  destDir = join(currentDir, args.dest);
}

registerFont(join(__dirname, "..", "public/font/W95FA.otf"), {
  family: "W95FA",
});

registerFont(join(__dirname, "..", "public/font/Windows Regular.ttf"), {
  family: "Windows Regular",
});

registerFont(join(__dirname, "..", "public/font/MS Sans Serif 8pt.ttf"), {
  family: "MSF",
});

type MenuItem = {
  icon: string;
  path: string;
  label: string;
};

type FinalMenuItem = {
  label: string;
  path?: string;
  icon?: string;
  imageOn?: string;
  imageOff: string;
  width: string;
  height: string;
};

async function createTextImage(
  text: string,
  fontColor: string,
  strokeColor: string
) {
  const fontSize = 72;
  const lineWidth = 12;
  const fontSizeAfterResize = 12;
  const font = `MSF`;

  // Create a temporary canvas to measure text size
  const tempCanvas = createCanvas(1, 1);
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.font = `${fontSize}px ${font}`;

  const textMetrics = tempCtx.measureText(text);

  // Take into account the stroke width
  const canvasWidth = textMetrics.width + lineWidth * 1.5;
  const canvasHeight = fontSize + lineWidth * 2;

  // Create a canvas with an exact size of text plus the stroke width
  const textCanvas = createCanvas(canvasWidth, canvasHeight);
  const textCtx = textCanvas.getContext("2d");
  textCtx.font = `${fontSize}px ${font}`;
  textCtx.fillStyle = fontColor;
  textCtx.strokeStyle = strokeColor;
  textCtx.lineWidth = lineWidth;
  textCtx.textBaseline = "top";
  textCtx.strokeText(text, lineWidth, lineWidth);
  textCtx.fillText(text, lineWidth, lineWidth);
  // textCtx.antialias = "none";

  // Convert the text canvas to buffer
  const textBuffer = textCanvas.toBuffer();

  // Calculate the new height taking the stroke into consideration.

  const newHeight = Math.ceil(
    fontSizeAfterResize + (lineWidth * 2) / fontSizeAfterResize
  );
  const newWidth = Math.round(
    (textCanvas.width / textCanvas.height) * newHeight
  );

  // Use sharp to resize the text image and convert to 1-bit bitmap
  const resizedTextBuffer = await sharp(textBuffer)
    .threshold(100) // Convert to 1-bit image
    .toBuffer();

  const anotherBuffer = await sharp(resizedTextBuffer)
    .resize({
      width: newWidth,
      height: newHeight,
      kernel: sharp.kernel.lanczos3,
    })
    .toBuffer();

  return anotherBuffer;
}

async function getRotatedImage(image: Image, angleY: number): Promise<Image> {
  return new Promise((resolve, reject) => {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Calculate the scale for simulating 3D rotation
    const scale = Math.abs(Math.cos(angleY));

    // Calculate new width after scaling
    const newWidth = image.width * scale;

    // Draw the image on the canvas with scaling
    ctx.drawImage(
      image,
      (canvas.width - newWidth) / 2,
      0,
      newWidth,
      image.height
    );

    // Convert the canvas to a Buffer
    const buffer = canvas.toBuffer();

    // Create a new Image using node-canvas Image class
    const rotatedImage = new Image();
    rotatedImage.onload = () => {
      resolve(rotatedImage);
    };
    rotatedImage.onerror = (err) => {
      reject(err);
    };
    rotatedImage.src = buffer;
  });
}

async function drawAndSaveFrame(
  ctx: CanvasRenderingContext2D,
  bgImage: Image,
  iconImage: Image,
  textImage: Image,
  fileNameBase: string,
  onOffState: string,
  isAnimated: boolean
) {
  const frames = [];

  const numFrames = isAnimated ? 30 : 1;
  const frameDelay = isAnimated ? 5 : 0;

  for (let i = 0; i < numFrames; i++) {
    ctx.drawImage(bgImage, 0, 0, bgImage.width, 21);

    // If it's the 'on' state and animation is enabled, rotate the icon
    if (onOffState === "on" && isAnimated) {
      const angleY = (i / numFrames) * (2 * Math.PI); // angle in radians
      const rotatedIcon = await getRotatedImage(iconImage, angleY);
      ctx.drawImage(rotatedIcon, 5, 3, 16, 16);
    } else {
      ctx.drawImage(iconImage, 5, 3, 16, 16);
    }

    ctx.drawImage(
      textImage,
      24,
      (bgImage.height - textImage.height) / 2 + 2,
      textImage.width,
      textImage.height
    );

    // Get image data
    const frameData = ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    ).data;

    // Create a new GifFrame
    const frame = new GifFrame(
      ctx.canvas.width,
      ctx.canvas.height,
      Buffer.from(frameData),
      {
        delayCentisecs: frameDelay,
      }
    );

    // Quantize frame
    GifUtil.quantizeDekker(frame, 256);

    frames.push(frame);

    // Clear the canvas for the next frame
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  // Create the GIF
  const gifCodec = new GifCodec();
  const gifBuffer = await gifCodec.encodeGif(frames, { loops: 0 });

  // Save the GIF to file
  const outputFilePath = join(
    destDir,
    `/public/menu/${fileNameBase}-${onOffState}.gif`
  );
  await fs.writeFile(outputFilePath, gifBuffer.buffer);

  console.log(`Gif written to ${outputFilePath}`);
}

async function createImages(
  menuItems: MenuItem[],
  normalBgImage: string,
  hoverBgImage: string
) {
  try {
    // Load background images
    const normalBg = await loadImage(normalBgImage);
    const hoverBg = await loadImage(hoverBgImage);

    const devicePixelRatio = 1;
    const canvas = createCanvas(
      normalBg.width * devicePixelRatio,
      21 * devicePixelRatio
    );
    const ctx = canvas.getContext("2d");
    ctx.scale(devicePixelRatio, devicePixelRatio);

    for (const item of menuItems) {
      let fileNameBase = item.path.replace(/\//g, "");

      if (!fileNameBase) {
        fileNameBase = "home";
      }

      // Load and resize the icon
      const iconImage = await loadImage(join(__dirname, "..", item.icon));
      const iconBuffer = await sharp(iconImage.src)
        .resize(16, 16, {
          kernel: sharp.kernel.cubic,
        })
        .toBuffer();
      const loadedIcon = await loadImage(iconBuffer);

      // ctx.antialias = "none";

      // Generate the resized text image
      const resizedTextOffBuffer = await createTextImage(
        item.label,
        "black",
        "transparent"
      );
      const loadedResizedOffText = await loadImage(resizedTextOffBuffer);

      // Normal State
      await drawAndSaveFrame(
        ctx,
        normalBg,
        loadedIcon,
        loadedResizedOffText,
        fileNameBase,
        "off",
        false
      );

      const resizedTextOnBuffer = await createTextImage(
        item.label,
        "white",
        "black"
      );
      const loadedResizedOnText = await loadImage(resizedTextOnBuffer);

      // Hover State
      await drawAndSaveFrame(
        ctx,
        hoverBg,
        loadedIcon,
        loadedResizedOnText,
        fileNameBase,
        "on",
        true
      );
    }
  } catch (error) {
    console.error("Error while creating images:", error);
  }
}

async function exportHTML(
  menuItems: MenuItem[],
  imagesDir: string,
  outputDir: string
) {
  const outputFilePath = join(outputDir, "main-menu.php");
  const tableWidth = 700;
  const emptyFullWidth = 100; // Width for menu-empty-full.gif
  const itemWidth = 120; // Replace 120 with the actual width of your items

  let currentRowWidth = 0;

  const lines: FinalMenuItem[] = [];

  for (const item of menuItems) {
    const fileNameBase = item.path.replace(/\//g, "") || "home";
    const offGifPath = `${fileNameBase}-off.gif`;
    const onGifPath = `${fileNameBase}-on.gif`;
    const fullPath = join(imagesDir, offGifPath);

    let gifSize;
    try {
      gifSize = await sharp(fullPath).metadata();
    } catch (error) {
      console.error(`Error reading metadata for file ${fullPath}:`, error);
      continue; // Skip this iteration
    }

    // Check if we need to start a new row
    if (currentRowWidth + itemWidth > tableWidth) {
      // Calculate the remaining width
      const remainingWidth = tableWidth - currentRowWidth;

      // Check if the remaining space is exactly 100px
      if (remainingWidth === emptyFullWidth) {
        lines.push({
          width: `${remainingWidth}px`,
          height: "21px",
          imageOff: "menu-empty-full.gif",
          label: "",
        });
      } else {
        let remainingSpace = remainingWidth;
        if (remainingSpace > itemWidth) {
          lines.push({
            width: `${itemWidth}px`,
            height: "21px",
            imageOff: "menu-empty-left.gif",
            label: "",
          });
          remainingSpace -= itemWidth;

          while (remainingSpace > emptyFullWidth) {
            lines.push({
              width: `${itemWidth}px`,
              height: "21px",
              imageOff: "menu-empty-middle.gif",
              label: "",
            });
            remainingSpace -= itemWidth;
          }
        }

        lines.push({
          width: `${emptyFullWidth}px`,
          height: "21px",
          imageOff: "menu-empty-right.gif",
          label: "",
        });
      }

      currentRowWidth = 0;
    }

    lines.push({
      imageOff: offGifPath,
      imageOn: onGifPath,
      width: `${gifSize.width}px`,
      height: `${gifSize.height}px`,
      label: item.label,
      path: item.path,
      icon: item.icon,
    });
    currentRowWidth += itemWidth;
  }

  // If the last row doesn't reach the maximum width, add the required images to fill it
  const remainingWidth = tableWidth - currentRowWidth;
  if (remainingWidth > 0) {
    let remainingSpace = remainingWidth;
    if (remainingSpace === emptyFullWidth) {
      lines.push({
        width: `${remainingWidth}px`,
        height: "21px",
        imageOff: "menu-empty-full.gif",
        label: "",
      });
    } else {
      if (remainingSpace > itemWidth) {
        lines.push({
          width: `${itemWidth}px`,
          height: "21px",
          imageOff: "menu-empty-left.gif",
          label: "",
        });
        remainingSpace -= itemWidth;

        while (remainingSpace > emptyFullWidth) {
          lines.push({
            width: `${itemWidth}px`,
            height: "21px",
            imageOff: "menu-empty-middle.gif",
            label: "",
          });
          remainingSpace -= itemWidth;
        }
      }

      lines.push({
        width: `${emptyFullWidth}px`,
        height: "21px",
        imageOff: "menu-empty-right.gif",
        label: "",
      });
    }
  }

  const mainMenuTemplate = await fs.readFile(
    join(__dirname, "templates/main-menu.ejs"),
    { encoding: "utf-8" }
  );

  const html = ejs.render(mainMenuTemplate, { menuLines: lines });

  // Write HTML content to file
  await fs.writeFile(outputFilePath, html);
}

export async function makeMenu(): Promise<void> {
  const menuItems: MenuItem[] = JSON.parse(
    await fs.readFile(join(__dirname, "../main-menu.json"), "utf8")
  );
  const normalBgImage = join(__dirname, "../public/menu/menu-2-off.gif");
  const hoverBgImage = join(__dirname, "../public/menu/menu-2-on.gif");

  await createImages(menuItems, normalBgImage, hoverBgImage);

  // Specify the directory where the gif images are saved
  const outputDir = destDir;
  const imagesDir = join(destDir, "/public/menu");

  // Export HTML
  await exportHTML(menuItems, imagesDir, outputDir);
}
