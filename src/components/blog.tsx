"use client";

import { Article } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import BlogCard from "./blog-card";
import SectionHeading from "./section-heading";
import { use, useEffect, useState } from "react";

export type BlogProps = {
  articles: Article[];
};

const Blog = ({ articles }: BlogProps) => {
  const [numToShow, setNumToShow] = useState(4);
  const [isAtMax, setIsAtMax] = useState(false);

  const handleNumToShowClick = () => {
    if (numToShow >= articles.length) {
      articles.length;
    }
    setNumToShow(numToShow + 4);
  };

  useEffect(() => {
    if (articles && numToShow >= articles.length) {
      setIsAtMax(true);
    } else {
      setIsAtMax(false);
    }
  }, [numToShow, articles.length]);

  return (
    <div id="blog" className="max-w-[53rem]">
      <SectionHeading>Blog</SectionHeading>

      <div className="flex flex-col gap-4">
        {articles?.slice(0, numToShow).map((article, index) => (
          <Link
            key={article.slug}
            className="mb-4 flex flex-col space-y-1"
            href={`/${article.slug}`}
          >
            <BlogCard article={article} even={index % 2 === 0} />
          </Link>
        ))}
      </div>
      {isAtMax ? (
        <button
          onClick={() => setNumToShow(4)}
          className="group flex h-[3rem] w-[8rem] items-center justify-center gap-2 rounded-full bg-gray-900 text-white outline-none transition-all hover:scale-110 hover:bg-gray-950 focus:scale-110 active:scale-105 disabled:scale-100 disabled:bg-opacity-65 dark:bg-white dark:bg-opacity-10"
        >
          Collapse
        </button>
      ) : (
        <button
          onClick={handleNumToShowClick}
          className="group flex h-[3rem] w-[8rem] items-center justify-center gap-2 rounded-full bg-gray-900 text-white outline-none transition-all hover:scale-110 hover:bg-gray-950 focus:scale-110 active:scale-105 disabled:scale-100 disabled:bg-opacity-65 dark:bg-white dark:bg-opacity-10"
        >
          Read More
        </button>
      )}
    </div>
  );
};

export default Blog;
