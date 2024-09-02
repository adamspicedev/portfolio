import { getBlogPosts } from "@/app/blog/utils";
import { Post } from "@/lib/types";
import SectionHeading from "./section-heading";
import BlogCard from "./blog-card";
import ReadMoreButton from "./read-more-button";

const BlogSection = () => {
  const posts: Post[] = getBlogPosts();

  return (
    <div id="blog">
      <SectionHeading>Latest Articles</SectionHeading>
      {posts.slice(0, 4)?.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
      <ReadMoreButton />
    </div>
  );
};

export default BlogSection;
