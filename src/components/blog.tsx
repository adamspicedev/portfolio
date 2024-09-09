import { Article } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import BlogCard from "./blog-card";
import SectionHeading from "./section-heading";

type ArticleResponse = {
  status: number;
  body: {
    articles: Article[];
  };
};

const getData = async () => {
  const res = await fetch(`${process.env.WRITE_IT_UP_URL}`);
  const articleResponse: ArticleResponse = await res.json();
  return articleResponse;
};

export type BlogProps = {
  showAll?: boolean;
};

const Blog = async ({ showAll = false }: BlogProps) => {
  let articles: Article[] = [];
  try {
    const response = await getData();
    articles = response.body.articles;
  } catch (error) {
    console.error(error);
    return <div>Failed to load articles</div>;
  }

  const sortedArticles = Array.isArray(articles)
    ? articles.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  const articlesToShow = showAll ? sortedArticles : sortedArticles.splice(0, 4);

  return (
    <div id="blog" className="max-w-[53rem]">
      <SectionHeading>Blog</SectionHeading>

      <div
        className={cn(
          articlesToShow.length > 1 &&
            "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {articlesToShow.map((article) => (
          <Link
            key={article.slug}
            className="mb-4 flex flex-col space-y-1"
            href={`/blog/${article.slug}`}
          >
            <BlogCard article={article} />
          </Link>
        ))}
      </div>
      {!showAll && (
        <Link
          href="/blog"
          className="group flex h-[3rem] w-[8rem] items-center justify-center gap-2 rounded-full bg-gray-900 text-white outline-none transition-all hover:scale-110 hover:bg-gray-950 focus:scale-110 active:scale-105 disabled:scale-100 disabled:bg-opacity-65 dark:bg-white dark:bg-opacity-10"
        >
          Read More
        </Link>
      )}
    </div>
  );
};

export default Blog;
