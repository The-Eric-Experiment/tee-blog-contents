const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Configuration constants
const INPUT_FOLDER = "../pages/windows3x/webbrowsing";
const OUTPUT_FOLDER = "../pages/windows3x/webbrowsing/cropped";
const LOGO_PATH = "../../the-eric-experiment-php/public/Logo_revised.png";
const LOGO_OPACITY = 0.5;
const LOGO_HEIGHT = 100; // Fixed height in pixels
const LOGO_MARGIN_RIGHT = 15; // Pixels from right edge
const LOGO_MARGIN_BOTTOM = -10; // Pixels from bottom edge (negative to move up)
const CORNER_SQUARE_SIZE = 10; // Size of corner squares in pixels
const DESKTOP_COLOR = { r: 192, g: 192, b: 192 }; // #C0C0C0
const VERIFICATION_PIXELS = 5; // Number of consecutive pixels to verify

/**
 * Check if a pixel matches the desktop color
 */
function isDesktopColor(buffer, x, y, width, channels) {
  const index = (y * width + x) * channels;
  const r = buffer[index];
  const g = buffer[index + 1];
  const b = buffer[index + 2];

  return (
    r === DESKTOP_COLOR.r && g === DESKTOP_COLOR.g && b === DESKTOP_COLOR.b
  );
}

/**
 * Find the top boundary of the desktop
 */
function findTopBoundary(buffer, width, height, channels) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isDesktopColor(buffer, x, y, width, channels)) {
        // Verify next pixels downward are also desktop color
        let consecutiveCount = 0;
        for (
          let checkY = y;
          checkY < Math.min(y + VERIFICATION_PIXELS, height);
          checkY++
        ) {
          if (isDesktopColor(buffer, x, checkY, width, channels)) {
            consecutiveCount++;
          } else {
            break;
          }
        }

        if (consecutiveCount >= VERIFICATION_PIXELS) {
          return y;
        }
      }
    }
  }
  return 0;
}

/**
 * Find the left boundary of the desktop
 */
function findLeftBoundary(buffer, width, height, channels) {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (isDesktopColor(buffer, x, y, width, channels)) {
        // Verify next pixels rightward are also desktop color
        let consecutiveCount = 0;
        for (
          let checkX = x;
          checkX < Math.min(x + VERIFICATION_PIXELS, width);
          checkX++
        ) {
          if (isDesktopColor(buffer, checkX, y, width, channels)) {
            consecutiveCount++;
          } else {
            break;
          }
        }

        if (consecutiveCount >= VERIFICATION_PIXELS) {
          return x;
        }
      }
    }
  }
  return 0;
}

/**
 * Find the bottom boundary of the desktop
 */
function findBottomBoundary(buffer, width, height, channels) {
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      if (isDesktopColor(buffer, x, y, width, channels)) {
        // Verify next pixels upward are also desktop color
        let consecutiveCount = 0;
        for (
          let checkY = y;
          checkY >= Math.max(y - VERIFICATION_PIXELS + 1, 0);
          checkY--
        ) {
          if (isDesktopColor(buffer, x, checkY, width, channels)) {
            consecutiveCount++;
          } else {
            break;
          }
        }

        if (consecutiveCount >= VERIFICATION_PIXELS) {
          return y + 1; // Return the boundary (exclusive)
        }
      }
    }
  }
  return height;
}

/**
 * Find the right boundary of the desktop
 */
function findRightBoundary(buffer, width, height, channels) {
  for (let x = width - 1; x >= 0; x--) {
    for (let y = 0; y < height; y++) {
      if (isDesktopColor(buffer, x, y, width, channels)) {
        // Verify next pixels leftward are also desktop color
        let consecutiveCount = 0;
        for (
          let checkX = x;
          checkX >= Math.max(x - VERIFICATION_PIXELS + 1, 0);
          checkX--
        ) {
          if (isDesktopColor(buffer, checkX, y, width, channels)) {
            consecutiveCount++;
          } else {
            break;
          }
        }

        if (consecutiveCount >= VERIFICATION_PIXELS) {
          return x + 1; // Return the boundary (exclusive)
        }
      }
    }
  }
  return width;
}

/**
 * Prepare logo for compositing
 */
async function prepareLogo(logoPath, maxWidth, maxHeight) {
  try {
    const logoMetadata = await sharp(logoPath).metadata();
    const originalWidth = logoMetadata.width;
    const originalHeight = logoMetadata.height;

    // Calculate width based on fixed height and original aspect ratio
    const aspectRatio = originalWidth / originalHeight;
    const finalHeight = LOGO_HEIGHT;
    const finalWidth = Math.round(finalHeight * aspectRatio);

    // Make sure logo doesn't exceed image dimensions
    if (finalWidth > maxWidth - LOGO_MARGIN_RIGHT * 2) {
      console.warn(`Warning: Logo too wide for image, adjusting size...`);
      const adjustedWidth = maxWidth - LOGO_MARGIN_RIGHT * 2;
      const adjustedHeight = Math.round(adjustedWidth / aspectRatio);

      return await processLogoWithSize(logoPath, adjustedWidth, adjustedHeight);
    }

    return await processLogoWithSize(logoPath, finalWidth, finalHeight);
  } catch (error) {
    console.warn(
      `Warning: Could not process logo from ${logoPath}:`,
      error.message
    );
    return null;
  }
}

/**
 * Process logo with specific dimensions and opacity
 */
async function processLogoWithSize(logoPath, width, height) {
  try {
    // Resize and set opacity
    const processedLogo = await sharp(logoPath)
      .resize(width, height, {
        fit: "fill",
      })
      .png()
      .composite([
        {
          input: Buffer.from([255, 255, 255, Math.round(255 * LOGO_OPACITY)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: "dest-in",
        },
      ])
      .toBuffer();

    return {
      buffer: processedLogo,
      width: width,
      height: height,
    };
  } catch (error) {
    console.warn(`Warning: Could not process logo:`, error.message);
    return null;
  }
}

/**
 * Create corner squares with desktop color
 */
async function createCornerSquares(width, height) {
  try {
    // Create a small square with desktop color
    const squareBuffer = Buffer.alloc(
      CORNER_SQUARE_SIZE * CORNER_SQUARE_SIZE * 3
    );
    for (let i = 0; i < squareBuffer.length; i += 3) {
      squareBuffer[i] = DESKTOP_COLOR.r; // R
      squareBuffer[i + 1] = DESKTOP_COLOR.g; // G
      squareBuffer[i + 2] = DESKTOP_COLOR.b; // B
    }

    const squareImage = await sharp(squareBuffer, {
      raw: {
        width: CORNER_SQUARE_SIZE,
        height: CORNER_SQUARE_SIZE,
        channels: 3,
      },
    })
      .png()
      .toBuffer();

    // Define corner positions
    const corners = [
      { left: 0, top: 0 }, // Top-left
      { left: width - CORNER_SQUARE_SIZE, top: 0 }, // Top-right
      { left: 0, top: height - CORNER_SQUARE_SIZE }, // Bottom-left
      { left: width - CORNER_SQUARE_SIZE, top: height - CORNER_SQUARE_SIZE }, // Bottom-right
    ];

    return corners.map((pos) => ({
      input: squareImage,
      left: pos.left,
      top: pos.top,
      blend: "over",
    }));
  } catch (error) {
    console.warn("Warning: Could not create corner squares:", error.message);
    return [];
  }
}

/**
 * Crop the image to remove VirtualBox chrome
 */
async function cropImage(inputPath, outputPath) {
  try {
    // Get image metadata
    const { width, height } = await sharp(inputPath).metadata();

    // Get raw pixel data
    const { data, info } = await sharp(inputPath)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels = info.channels;

    // Find boundaries
    const top = findTopBoundary(data, width, height, channels);
    const left = findLeftBoundary(data, width, height, channels);
    const bottom = findBottomBoundary(data, width, height, channels);
    const right = findRightBoundary(data, width, height, channels);

    console.log(
      `Processing ${path.basename(
        inputPath
      )}: bounds [${left}, ${top}, ${right}, ${bottom}]`
    );

    // Calculate cropped dimensions
    const cropWidth = right - left;
    const cropHeight = bottom - top;

    if (cropWidth <= 0 || cropHeight <= 0) {
      console.warn(
        `Warning: Invalid crop dimensions for ${inputPath}, skipping...`
      );
      return false;
    }

    // Crop and save the image as JPEG
    const outputFilename =
      path.basename(outputPath, path.extname(outputPath)) + ".jpg";
    const finalOutputPath = path.join(path.dirname(outputPath), outputFilename);

    // First crop the image
    const croppedImageBuffer = await sharp(inputPath)
      .extract({
        left: left,
        top: top,
        width: cropWidth,
        height: cropHeight,
      })
      .png()
      .toBuffer();

    // Prepare logo and corner squares
    const logo = await prepareLogo(LOGO_PATH, cropWidth, cropHeight);
    const cornerSquares = await createCornerSquares(cropWidth, cropHeight);

    let finalImage = sharp(croppedImageBuffer);
    let compositeElements = [];

    // Add corner squares
    if (cornerSquares.length > 0) {
      compositeElements.push(...cornerSquares);
      console.log(
        `  Adding ${cornerSquares.length} corner squares (${CORNER_SQUARE_SIZE}x${CORNER_SQUARE_SIZE}px)`
      );
    }

    // Add logo if it was successfully processed
    if (logo) {
      const logoLeft = cropWidth - logo.width - LOGO_MARGIN_RIGHT;
      const logoTop = cropHeight - logo.height - LOGO_MARGIN_BOTTOM;

      console.log(
        `  Adding logo at position [${logoLeft}, ${logoTop}] with size ${logo.width}x${logo.height}`
      );

      compositeElements.push({
        input: logo.buffer,
        left: logoLeft,
        top: logoTop,
        blend: "over",
      });
    }

    // Apply all composite elements at once if any exist
    if (compositeElements.length > 0) {
      finalImage = finalImage.composite(compositeElements);
    }

    // Save as JPEG
    await finalImage.jpeg({ quality: 90 }).toFile(finalOutputPath);

    return true;
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    return false;
  }
}

/**
 * Main function to process all PNG files in a folder
 */
async function processFolder() {
  const inputFolder = INPUT_FOLDER;
  const outputFolder = OUTPUT_FOLDER;

  // Create output folder if it doesn't exist
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  // Check if input folder exists
  if (!fs.existsSync(inputFolder)) {
    console.error(`Error: Input folder '${inputFolder}' does not exist.`);
    return;
  }

  // Check if logo exists
  if (!fs.existsSync(LOGO_PATH)) {
    console.warn(
      `Warning: Logo file '${LOGO_PATH}' does not exist. Images will be processed without logo.`
    );
  }

  // Get all PNG files
  const files = fs
    .readdirSync(inputFolder)
    .filter((file) => path.extname(file).toLowerCase() === ".png");

  if (files.length === 0) {
    console.log("No PNG files found in the input folder.");
    return;
  }

  console.log(`Found ${files.length} PNG files to process...`);
  console.log(`Input folder: ${inputFolder}`);
  console.log(`Output folder: ${outputFolder}`);
  console.log(
    `Logo: ${LOGO_PATH} (${LOGO_HEIGHT}px height, ${LOGO_OPACITY} opacity)`
  );
  console.log(
    `Logo position: ${LOGO_MARGIN_RIGHT}px from right, ${LOGO_MARGIN_BOTTOM}px from bottom`
  );
  console.log("Converting to JPEG format with logo overlay...\n");

  let processed = 0;
  let skipped = 0;

  for (const file of files) {
    const inputPath = path.join(inputFolder, file);
    const outputPath = path.join(outputFolder, file);

    const success = await cropImage(inputPath, outputPath);

    if (success) {
      processed++;
    } else {
      skipped++;
    }
  }

  console.log(`\nProcessing complete!`);
  console.log(`Processed: ${processed} files`);
  console.log(`Skipped: ${skipped} files`);
  console.log(`Output folder: ${outputFolder}`);
}

// Run the script
if (require.main === module) {
  processFolder();
}

module.exports = { cropImage, processFolder };
