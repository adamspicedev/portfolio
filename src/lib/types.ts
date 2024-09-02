import { links } from "./data";

export type SectionName = (typeof links)[number]["name"];

export type Metadata = {
  publishedAt: string;
  title: string;
  summary: string;
  imageUrl?: string;
  tags: string;
};

export type Post = {
  metadata: Metadata;
  slug: string;
  content: string;
};
