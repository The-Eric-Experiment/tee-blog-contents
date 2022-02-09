import * as path from "path";
import { DataTypes, Model, Sequelize } from "sequelize";

export default function setup(location: string) {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(location, "tee-index.sqlite"),
    logging: false,
  });

  type PostAttributes = {
    id: string;
    title: string;
    date: string;
    image: string;
    slug: string;
    description: string;
  };

  type PostModelCreator = PostAttributes;
  type PostModel = Model<PostAttributes, PostModelCreator>;

  const Post = sequelize.define<PostModel, PostModelCreator>(
    "post",
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    { timestamps: false }
  );

  type TagAttributes = {
    id: string;
    name: string;
  };

  type TagModelCreator = TagAttributes;
  type TagModel = Model<TagAttributes, TagModelCreator>;

  const Tag = sequelize.define<TagModel, TagModelCreator>(
    "tag",
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: false }
  );

  type CategoryAttributes = {
    id: string;
    name: string;
  };

  type CategoryModelCreator = CategoryAttributes;
  type CategoryModel = Model<CategoryAttributes, CategoryModelCreator>;

  const Category = sequelize.define<CategoryModel, CategoryModelCreator>(
    "category",
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: false }
  );

  const PostCategories = sequelize.define(
    "post_categories",
    {
      post_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      category_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
    },
    { timestamps: false }
  );

  const PostTags = sequelize.define(
    "post_tags",
    {
      post_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      tag_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
    },
    { timestamps: false }
  );

  Tag.belongsToMany(Post, {
    through: PostTags,
    foreignKey: "tag_id",
    sourceKey: "id",
    as: "tags",
  });
  Post.belongsToMany(Tag, {
    through: PostTags,
    foreignKey: "post_id",
    sourceKey: "id",
    as: "tag_posts",
  });

  Category.belongsToMany(Post, {
    through: PostCategories,
    foreignKey: "category_id",
    sourceKey: "id",
    as: "categories",
  });
  Post.belongsToMany(Category, {
    through: PostCategories,
    foreignKey: "post_id",
    sourceKey: "id",
    as: "cat_posts",
  });

  return {
    Tag,
    Category,
    Post,
    PostCategories,
    PostTags,
    async connect() {
      try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log("Connection has been established successfully.");
      } catch (error) {
        console.error("Unable to connect to the database:", error);
      }
    },
  };
}
