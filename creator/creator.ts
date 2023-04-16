import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";
import axios from "axios";
import { VideoResponse } from "./types";
import moment from "moment-timezone";
import sqlite from "../processor/db";

const f = fs.readFileSync(path.join(__dirname, "../api-key.json"), {
  encoding: "utf-8",
});
const key = JSON.parse(f);
const ytAPI = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id={id}&key=${key.apiKey}`;
const postsFolder = path.join(__dirname, "../posts");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const currentDir = path.join(__dirname, "..");
const dbDir = path.join(currentDir, ".temp/");

const { Category, connect } = sqlite(dbDir);

async function question(query: string) {
  return new Promise<string>((resolve) => {
    rl.question(query, resolve);
  });
}

const promptUser = async (
  menuOptions: string[],
  selectedOptions: string[] = []
) => {
  console.log("\nSelect an option from the menu:");
  menuOptions.forEach((option, index) => {
    console.log(`${index + 1}. ${option}`);
  });
  console.log("\nSelected Categories: " + selectedOptions.join(", "));
  const input = await question("\nEnter your choice: ");

  const choice = parseInt(input);

  if (isNaN(choice) || choice < 1 || choice > menuOptions.length) {
    console.log("Invalid choice. Please try again.");

    const result = await promptUser(menuOptions, selectedOptions);
    selectedOptions.push(...result);
  } else if (menuOptions[choice - 1] === "Done") {
    console.log("\nYou have selected the following options:");
    selectedOptions.forEach((option) => {
      console.log(option);
    });
  } else {
    selectedOptions.push(menuOptions[choice - 1]);

    const result = await promptUser(menuOptions, selectedOptions);
    selectedOptions.push(...result);
  }

  return [...new Set(selectedOptions)];
};

export async function downloadFile(
  fileUrl: string,
  outputLocationPath: string
): Promise<any> {
  const response = await axios({
    method: "GET",
    url: fileUrl,
    responseType: "stream",
  });
  return new Promise((resolve) => {
    const w = response.data.pipe(fs.createWriteStream(outputLocationPath));
    w.on("finish", () => {
      resolve(true);
    });
  });
}

async function getVideoMetadata(id: string): Promise<VideoResponse> {
  const res = await axios.get(ytAPI.replace("{id}", id));

  const data = res.data;

  return data;
}

async function main(): Promise<any> {
  await connect();
  console.log("Alright, let's create a post from a Youtube Video");
  const video = await question("What's the youtube video?");

  if (!video) {
    throw new Error("no video");
  }

  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
  const match = regex.exec(video);

  if (!match || !match[1]) {
    return undefined;
  }

  const videoId = match[1];

  const userSlug = await question("What's the slug?");

  console.log("Requesting Video...");
  const result = await getVideoMetadata(videoId);
  if (!result) {
    console.error("NO SUCH YOUTUBE VIDEO!!");
  }

  const [{ snippet: metadata }] = result.items;

  console.log("Video found:", metadata.title);

  const date = moment
    .utc(metadata.publishedAt)
    .tz("Australia/Sydney")
    .format("DD-MM-yyyy");

  const slug =
    date +
    "-" +
    (userSlug || metadata.title)
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\-\s]+/gm, "")
      .replace(/\s+/gm, "-");

  const postFolder = path.join(postsFolder, slug);

  console.log(postFolder);

  fs.mkdirSync(postFolder, { recursive: true });

  const extension = path.extname(metadata.thumbnails.standard.url);
  const imageFileName = "img" + extension;

  console.log("Downloading Thumbnail");

  await downloadFile(
    metadata.thumbnails.standard.url,
    path.join(postFolder, imageFileName)
  );

  console.log("Creating post");

  const cats = await Category.findAll();
  const menuOptions = cats.map((o) => o.getDataValue("name"));
  menuOptions.push("Done");

  const selectedCategories = await promptUser(menuOptions, ["Videos"]);

  const postFile = path.join(postFolder, "post.md");

  fs.writeFileSync(postFile, "");

  fs.appendFileSync(postFile, "---\n");
  fs.appendFileSync(postFile, `title: ${metadata.title}\n`);
  fs.appendFileSync(postFile, `date: ${date}\n`);
  fs.appendFileSync(
    postFile,
    `tags: ${metadata.tags.map((o) => o.toLowerCase()).join(", ")}\n`
  );
  fs.appendFileSync(postFile, `category: ${selectedCategories.join(", ")}\n`);
  fs.appendFileSync(postFile, `image: ${imageFileName}\n`);
  fs.appendFileSync(
    postFile,
    `description: "${metadata.description
      .replace(/[\n\r]/gm, " ")
      .replace(/\s\s+/gm, " ")
      .trim()
      .substring(0, 256)}"\n`
  );
  fs.appendFileSync(postFile, "---\n\n");

  const description = metadata.description.replace(
    /((?:[\d]{1,2}:)?[\d]{1,2}:[\d]{1,2})\s+-\s[^\r\n]+/gm,
    (match, p1) => {
      const arr = p1
        .trim()
        .split(":")
        .map((o: string) => parseInt(o));
      const secs = arr[arr.length - 1] || 0;
      const min = arr[arr.length - 2] || 0;
      const hours = arr[arr.length - 3] || 0;
      const t = hours * 60 * 60 + min * 60 + secs;
      const url = `https://www.youtube.com/watch?v=${videoId}&t=${t}`;
      return `- [${p1}](${url})${match.substring(p1.length)}`;
    }
  );

  fs.appendFileSync(postFile, description);
  fs.appendFileSync(postFile, "\n\n");
  fs.appendFileSync(
    postFile,
    `[Click here](${video}) to go to the Youtube Video.\n\n`
  );
  fs.appendFileSync(postFile, `^^youtube [${metadata.title}](${video})\n`);

  process.exit(0);
}

main();
