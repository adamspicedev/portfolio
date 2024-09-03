import { getBlogPosts } from "@/app/blog/utils";
import PostsClient from "./posts-client";

export function BlogPosts() {
  const allBlogs = getBlogPosts();

  return (
    <section>
      <PostsClient posts={allBlogs} />
    </section>
  );
}
