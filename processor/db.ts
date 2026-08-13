import * as path from "path";
import { DatabaseSync } from "node:sqlite";

export type Post = {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  image: string | null;
  slug: string;
  description: string;
};

export type Tag = { id: string; name: string };
export type Category = { id: string; name: string };

const SCHEMA = `
CREATE TABLE IF NOT EXISTS posts (
  id          TEXT NOT NULL PRIMARY KEY,
  title       TEXT NOT NULL,
  date        TEXT NOT NULL,
  image       TEXT,
  slug        TEXT NOT NULL,
  description TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS tags (
  id   TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS categories (
  id   TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL,
  tag_id  TEXT NOT NULL,
  PRIMARY KEY (post_id, tag_id)
) STRICT;

CREATE TABLE IF NOT EXISTS post_categories (
  post_id     TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (post_id, category_id)
) STRICT;

CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_cat ON post_categories(category_id);
`;

type PostInput = {
  id: string;
  title: string;
  date: string;
  image: string | null | undefined;
  slug: string;
  description: string;
};

type PostCategoryInput = { post_id: string; category_id: string };
type PostTagInput = { post_id: string; tag_id: string };

export default function setup(location: string) {
  const db = new DatabaseSync(path.join(location, "tee-index.sqlite"));

  db.exec("PRAGMA foreign_keys = ON");
  db.exec(SCHEMA);

  const stmts = {
    allCategories: db.prepare(
      "SELECT id, name FROM categories ORDER BY name"
    ),
    upsertPost: db.prepare(`
      INSERT INTO posts (id, title, date, image, slug, description)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        date = excluded.date,
        image = excluded.image,
        slug = excluded.slug,
        description = excluded.description
    `),
    insertCategory: db.prepare(
      "INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)"
    ),
    insertTag: db.prepare(
      "INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)"
    ),
    insertPostCategory: db.prepare(
      "INSERT OR IGNORE INTO post_categories (post_id, category_id) VALUES (?, ?)"
    ),
    insertPostTag: db.prepare(
      "INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)"
    ),
  };

  function transaction<T>(fn: () => T): T {
    db.exec("BEGIN");
    try {
      const result = fn();
      db.exec("COMMIT");
      return result;
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  }

  return {
    Post: {
      bulkCreate: (rows: PostInput[]): void => {
        transaction(() => {
          for (const r of rows) {
            stmts.upsertPost.run(
              r.id,
              r.title,
              r.date,
              r.image ?? null,
              r.slug,
              r.description
            );
          }
        });
      },
    },
    Category: {
      create: (row: { id: string; name: string }): void => {
        stmts.insertCategory.run(row.id, row.name);
      },
      findAll: (): Category[] => stmts.allCategories.all() as Category[],
    },
    Tag: {
      create: (row: { id: string; name: string }): void => {
        stmts.insertTag.run(row.id, row.name);
      },
    },
    PostCategories: {
      bulkCreate: (rows: PostCategoryInput[]): void => {
        transaction(() => {
          for (const r of rows) {
            stmts.insertPostCategory.run(r.post_id, r.category_id);
          }
        });
      },
    },
    PostTags: {
      bulkCreate: (rows: PostTagInput[]): void => {
        transaction(() => {
          for (const r of rows) {
            stmts.insertPostTag.run(r.post_id, r.tag_id);
          }
        });
      },
    },
    transaction,
    // Kept async for call-site compatibility; nothing to await.
    async connect(): Promise<void> {},
    close(): void {
      db.close();
    },
  };
}
