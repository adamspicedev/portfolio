import { getBlogPosts } from "@/app/blog/utils";
import Link from "next/link";
import BlogCard from "./blog-card";

export function BlogPosts() {
  const allBlogs = getBlogPosts();

  return (
    <section>
      {allBlogs.map((post) => (
        <Link
          key={post.slug}
          className="mb-4 flex flex-col items-center justify-center space-y-1"
          href={`/blog/${post.slug}`}
        >
          <BlogCard post={post} />
        </Link>
      ))}
    </section>
  );
}
