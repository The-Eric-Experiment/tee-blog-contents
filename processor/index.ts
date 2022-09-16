import chalk from "chalk";
import * as ejs from "ejs";
import fm from "front-matter";
import * as fs from "fs";
import * as fse from "fs-extra";
import { DateTime } from "luxon";
import md5 from "md5";
import moment from "moment";
import * as path from "path";
import * as rimraf from "rimraf";
import sharp from "sharp";
import * as yaml from "yaml";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import db from "./db";
import { getGalleries } from "./galleries";
import { getGalleryImages } from "./gallery";
import { getContentImages } from "./images";
import { convertToHtml } from "./markdown";
import { renderTemplate } from "./template";
import {
  Category as CategoryData,
  ContentConfig,
  ImageMap,
  ImageResolution,
  PostMetadata,
  Tag as TagData,
} from "./types";

const currentDir = path.join(__dirname, "..");
const yargies = yargs(hideBin(process.argv));
const args = yargies.argv as { dest?: string; ["no-image"]?: string };

const configContent = fs.readFileSync(
  path.join(currentDir, "content-config.yaml"),
  { encoding: "utf-8" }
);
const config: ContentConfig = yaml.parse(configContent);

const postsDir = path.join(currentDir, config.postsFolder);
const pagesDir = path.join(currentDir, config.pagesFolder);
const publicDir = path.join(currentDir, config.publicFolder);
let destDir = path.join(currentDir, ".temp/");

if (args.dest) {
  destDir = path.join(currentDir, args.dest);
}

async function processImage(data: Buffer, res: ImageResolution) {
  const fit = (res.fit || "cover") as
    | "fill"
    | "contain"
    | "cover"
    | "inside"
    | "outside";

  let image = sharp(data);
  const metadata = await image.metadata();

  const originalWidth = metadata.width || 0;
  let height = metadata.height;
  let width = metadata.width;
  if (res.aspectRatio) {
    const [w, h] = (res.aspectRatio as string)
      .split(":")
      .map((o) => parseInt(o));

    height = Math.floor((h * (width || 0)) / w);
  }

  if (res.width && res.width < (width || 0)) {
    width = res.width;
  }

  height = Math.floor(((height || 0) * (width || 0)) / originalWidth);

  image = image.resize(width, height, { fit }).withMetadata();

  if (metadata.format === "png") {
    image = image.png({
      quality: res.quality || 100,
    });
  } else {
    image = image.jpeg({
      quality: res.quality || 100,
      chromaSubsampling: "4:4:4",
    });
  }

  return image.toBuffer();
}

async function processPostThumbnails(
  filePrefix: string,
  posts: PostMetadata[],
  res: ImageResolution
) {
  const map: ImageMap[] = [];
  for (let index = 0; index < posts.length; index++) {
    const post = posts[index];

    const tempPostDir = path.join(destDir, config.postsFolder);
    const spl = post.image
      .split("/")
      .filter((o) => o !== config.contentsFolder);
    const imagePath = path.join(...spl);
    const buffer = fs.readFileSync(imagePath);
    const img = await processImage(buffer, res);
    const destPath = path.join(
      tempPostDir,
      post.slug,
      filePrefix + "-" + path.basename(post.image)
    );

    map.push({
      from: post.image,
      to: path.join(path.dirname(post.image), path.basename(destPath)),
    });
    fs.writeFileSync(destPath, img);
  }

  return map;
}

async function processImages(
  filePrefix: string,
  images: string[],
  res: ImageResolution
) {
  const map: ImageMap[] = [];
  for (let index = 0; index < images.length; index++) {
    const image = images[index];
    const spl = image.split("/").filter((o) => o !== config.contentsFolder);
    const imagePath = path.join(destDir, ...spl);
    const buffer = fs.readFileSync(imagePath);

    const destPath = path.join(
      path.dirname(imagePath),
      filePrefix + "-" + path.basename(image)
    );

    map.push({
      from: image,
      to: path.join(path.dirname(image), path.basename(destPath)),
    });

    console.log(
      `${chalk.white("-")} ${chalk.blueBright(image)} ${chalk.white(
        "->"
      )} ${chalk.green(destPath)}`
    );
    const img = await processImage(buffer, res);
    fs.writeFileSync(destPath, img);
  }

  return map;
}

async function getPosts(): Promise<PostMetadata[]> {
  const posts = fs.readdirSync(postsDir);

  const promises = posts.map(
    (post) =>
      new Promise<any>((resolve, reject) => {
        const postPath = path.join(postsDir, post, "post.md");
        const exists = fs.existsSync(postPath);

        if (!exists) {
          resolve(undefined);
          return;
        }

        const content = fs.readFileSync(postPath, { encoding: "utf-8" });

        // The types for this library are wrong
        /* @ts-ignore */
        const metadata = fm<TMetadata>(content);
        resolve({
          ...metadata.attributes,
          slug: post,
          content: metadata.body,
        });
      })
  );

  return (await Promise.all(promises))
    .filter((o) => !!o)
    .sort((a, b) => {
      return (
        DateTime.fromFormat(b.date, "dd-MM-yyyy").toMillis() -
        DateTime.fromFormat(a.date, "dd-MM-yyyy").toMillis()
      );
    })
    .map((item) => {
      const categories = item.category.split(",").map((o: string) => ({
        id: md5(o.toLowerCase().trim()),
        name: o.trim(),
      }));
      const tags = item.tags.split(",").map((o: string) => ({
        id: md5(o.toLowerCase().trim()),
        name: o.toLowerCase().trim(),
      }));

      return {
        categories,
        tags,
        title: item.title,
        date: item.date,
        image:
          "/" +
          path.join(
            config.contentsFolder,
            config.postsFolder,
            item.slug,
            item.image
          ),
        slug: item.slug,
        description: item.description,
        content: item.content,
      };
    });
}

function walk(dir: string, results: string[] = []) {
  const list = fs.readdirSync(dir);
  let i = 0;

  (function next() {
    var file = list[i++];
    if (!file) return;
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      walk(file, results);
      next();
    } else {
      if (path.extname(file) === ".md") {
        results.push(file);
      }
      next();
    }
  })();
}

async function getPages(): Promise<PostMetadata[]> {
  const pages: string[] = [];
  walk(pagesDir, pages);

  const promises = pages.map(
    (page) =>
      new Promise<any>((resolve, reject) => {
        const exists = fs.existsSync(page);

        if (!exists) {
          resolve(page);
          return;
        }

        const content = fs.readFileSync(page, { encoding: "utf-8" });

        // The types for this library are wrong
        /* @ts-ignore */
        const metadata = fm<TMetadata>(content);
        resolve({
          ...metadata.attributes,
          slug: path.relative(pagesDir, page),
          content: metadata.body,
        });
      })
  );

  return (await Promise.all(promises))
    .filter((o) => !!o)
    .map((item) => {
      return {
        categories: [],
        tags: [],
        title: item.title,
        date: item.date,
        image: item.image,
        slug: item.slug,
        description: item.description,
        content: item.content,
      };
    });
}

function getCategories(posts: PostMetadata[]): CategoryData[] {
  const categories: CategoryData[] = [];
  posts.forEach((post) => {
    post.categories.forEach((cat) => {
      let category = categories.find((o) => o.id === cat.id);
      if (!category) {
        category = { ...cat, slugs: [] };
        categories.push(category);
      }
      category.slugs.push(post.slug);
    });
  });
  return categories;
}

function getTags(posts: PostMetadata[]): TagData[] {
  const tags: TagData[] = [];
  posts.forEach((post) => {
    post.tags.forEach((t) => {
      let tag = tags.find((o) => o.id === t.id);
      if (!tag) {
        tag = { ...t, slugs: [] };
        tags.push(tag);
      }
      tag.slugs.push(post.slug);
    });
  });
  return tags;
}

function cleanupContentDir() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(destDir);

  for (const file of files) {
    rimraf.sync(path.join(destDir, file));
  }
}

async function run() {
  const noImages = args["no-image"] === "true";

  cleanupContentDir();

  const { connect, Post, Category, Tag, PostTags, PostCategories } =
    db(destDir);

  await connect();

  console.log(chalk.bgWhite("Starting Process..."));

  console.log(chalk.white("Writing to DB..."));

  const posts: PostMetadata[] = await getPosts();

  await Post.bulkCreate(
    posts.map((post) => ({
      id: md5(post.slug),
      title: post.title,
      date: moment(post.date, "DD-mm-yyyy").format("yyyy-mm-DD"),
      image: post.image,
      slug: post.slug,
      description: post.description,
    }))
  );

  const categories = getCategories(posts);

  for (const cat of categories) {
    await Category.create(
      {
        id: cat.id,
        name: cat.name,
      },
      { ignoreDuplicates: true }
    );

    await PostCategories.bulkCreate(
      cat.slugs.map((slg) => ({
        post_id: md5(slg),
        category_id: cat.id,
      })),
      { ignoreDuplicates: true }
    );
  }

  const tags = getTags(posts);

  for (const tag of tags) {
    await Tag.create(
      {
        id: tag.id,
        name: tag.name,
      },
      { ignoreDuplicates: true }
    );

    await PostTags.bulkCreate(
      tag.slugs.map((slg) => ({
        post_id: md5(slg),
        tag_id: tag.id,
      })),
      { ignoreDuplicates: true }
    );
  }

  console.log(chalk.green("DB Written!"));

  console.log(chalk.white("Processing pages..."));
  fse.copySync(pagesDir, path.join(destDir, config.pagesFolder), {
    filter: (src) => {
      const ext = path.extname(src);
      return ext !== ".md";
    },
  });
  const pages = await getPages();

  const pageTemplateEjs = fs.readFileSync(
    path.join(__dirname, "templates/page.ejs"),
    { encoding: "utf-8" }
  );

  for (const pg of pages) {
    const origPath = path.dirname(path.join(pagesDir, pg.slug));
    const destPath = path.dirname(
      path.join(destDir, config.pagesFolder, pg.slug)
    );
    const html = convertToHtml(origPath, pg.content, {
      slug: pg.slug.replace(".md", ""),
    });

    const renderedPage = ejs.render(pageTemplateEjs, { ...pg, html });

    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    fs.writeFileSync(
      path.join(destPath, path.basename(pg.slug, ".md") + ".php"),
      renderedPage
    );
  }

  console.log(chalk.green("Pages processed!"));
  console.log(chalk.white("Copying public folder..."));
  fse.copySync(publicDir, path.join(destDir, config.publicFolder));
  console.log(chalk.green("Public folder copied!"));
  console.log(chalk.white("Processing posts..."));
  fse.copySync(postsDir, path.join(destDir, config.postsFolder), {
    filter: (src) => {
      const ext = path.extname(src);
      return ext !== ".md";
    },
  });

  const postTemplateEjs = fs.readFileSync(
    path.join(__dirname, "templates/post.ejs"),
    { encoding: "utf-8" }
  );

  for (const post of posts) {
    const { content: _, tags, categories, ...data } = post;
    const origPath = path.dirname(path.join(postsDir, post.slug));
    const destPath = path.join(destDir, config.postsFolder, post.slug);
    const content = convertToHtml(origPath, post.content, {
      slug: data.slug.replace(".md", ""),
    });

    const renderedPost = ejs.render(postTemplateEjs, {
      data: {
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = data[key as keyof typeof data];
          return acc;
        }, {} as Record<string, string>),
      },
      tags: renderTemplate("tags.ejs", { data: tags }),
      categories: renderTemplate("tags.ejs", { data: categories }),
      content,
    });

    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    fs.writeFileSync(path.join(destPath, "post.php"), renderedPost);
  }

  console.log(chalk.green("Posts processed!"));

  console.log(chalk.green("Processing Galleries..."));

  const galleries = getGalleries();

  const galleryTemplateEjs = fs.readFileSync(
    path.join(__dirname, "templates/gallery.ejs"),
    { encoding: "utf-8" }
  );

  for (const key in galleries) {
    const gallery = galleries[key];
    const destPath = path.join(destDir, config.galleriesFolder);

    const renderedGallery = ejs.render(galleryTemplateEjs, { ...gallery });

    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    fs.writeFileSync(path.join(destPath, key + ".php"), renderedGallery);
  }

  console.log(chalk.green("Galleries done!"));

  console.log(chalk.white("Processing intro.md..."));
  fse.copyFileSync(
    path.join(currentDir, "intro.md"),
    path.join(destDir, "intro.md")
  );

  console.log(chalk.green("Intro.md processed!"));
  console.log(chalk.white("Copying main menu..."));
  fse.copyFileSync(
    path.join(currentDir, "main-menu.json"),
    path.join(destDir, "main-menu.json")
  );
  console.log(chalk.green("Main menu copied!"));

  if (!noImages) {
    const themes = Object.keys(config.themeImageResolutions);
    for (let index = 0; index < themes.length; index++) {
      const theme = themes[index];

      console.log(
        chalk.bgGreen(chalk.white("Processing Theme Images:")) + theme
      );
      const imageTypes = config.themeImageResolutions[theme];

      const imageMaps: Record<string, ImageMap[]> = {};

      if (imageTypes.postThumbnail) {
        console.log(chalk.bgGreen(chalk.white("Processing Post Thumbnails")));

        const maps = await processPostThumbnails(
          theme + "-thumbnail",
          posts,
          imageTypes.postThumbnail
        );

        imageMaps["postThumbnail"] = maps;
      }

      if (imageTypes.contentImage) {
        console.log(chalk.bgGreen(chalk.white("Processing Content Images")));

        const contentImages = getContentImages([...posts, ...pages]);

        const maps = await processImages(
          theme,
          contentImages,
          imageTypes.contentImage
        );

        imageMaps["contentImage"] = maps;
      }

      const galleryImages = getGalleryImages([...posts, ...pages]);

      if (imageTypes.galleryImage) {
        console.log(chalk.bgGreen(chalk.white("Processing Gallery Images")));
        const maps = await processImages(
          theme + "-gallery",
          galleryImages,
          imageTypes.galleryImage
        );

        imageMaps["galleryImage"] = maps;
      }

      if (imageTypes.galleryThumbnail) {
        console.log(
          chalk.bgGreen(chalk.white("Processing Gallery Thumbnails"))
        );
        const maps = await processImages(
          theme + "-gallery-thumb",
          galleryImages,
          imageTypes.galleryThumbnail
        );

        imageMaps["galleryThumbnail"] = maps;
      }

      console.log(
        chalk.bgGreen(chalk.white("Generating Image Maps: ")) + theme
      );

      const imageMapsEjs = fs.readFileSync(
        path.join(__dirname, "templates/image-maps.ejs"),
        { encoding: "utf-8" }
      );

      const renderedImageMaps = ejs.render(imageMapsEjs, { imageMaps });

      fs.writeFileSync(
        path.join(destDir, theme + "-image-maps.php"),
        renderedImageMaps
      );
    }
  }

  console.log(chalk.bgGreen(chalk.white("Generating Site News: ")));

  const siteNews = fs.readFileSync(path.join(__dirname, "../site-news.yaml"), {
    encoding: "utf-8",
  });
  const news = yaml.parse(siteNews);

  const siteNewsEjs = fs.readFileSync(
    path.join(__dirname, "templates/site-news.ejs"),
    { encoding: "utf-8" }
  );

  const renderedSiteNews = ejs.render(siteNewsEjs, { news });

  fs.writeFileSync(path.join(destDir, "site-news.php"), renderedSiteNews);

  // console.log(chalk.bgGreen(chalk.white("DEPLOYING...")));

  // const client = new basicftp.Client();
  // client.ftp.verbose = true;
  // await client.access({
  //   host: ftpConfig.host,
  //   user: ftpConfig.user,
  //   password: ftpConfig.password,
  //   secure: ftpConfig.secure,
  // });

  // await client.ensureDir(ftpConfig.uploadPath);
  // await client.clearWorkingDir();
  // await client.uploadFromDir(tempDir);

  // client.close();

  console.log(chalk.bgGreen(chalk.white("DONE!")));
}

run();
