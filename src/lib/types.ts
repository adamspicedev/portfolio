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
};
