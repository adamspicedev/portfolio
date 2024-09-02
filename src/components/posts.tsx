import Link from "next/link";
import { formatDate, getBlogPosts } from "@/app/blog/utils";
import BlogCard from "./blog-card";

export function BlogPosts() {
  let allBlogs = getBlogPosts();

  return (
    <section>
      {allBlogs.map((post) => (
        <Link
          key={post.slug}
          className="flex flex-col space-y-1 mb-4 justify-center items-center"
          href={`/blog/${post.slug}`}
        >
          <BlogCard post={post} />
        </Link>
      ))}
    </section>
  );
}
