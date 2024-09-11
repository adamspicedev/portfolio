import { JSONContent } from "novel";
import { links } from "./data";

export type SectionName = (typeof links)[number]["name"];

export type Article = {
  id: string;
  slug: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  title: string;
  content: JSONContent;
  tags: {
    tag: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
};

export type ArticleResponse = {
  status: number;
  body: {
    articles: Article[];
  };
};
