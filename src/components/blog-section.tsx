import { getBlogPosts } from "@/app/blog/utils";
import { Post } from "@/lib/types";
import BlogCard from "./blog-card";
import ReadMoreButton from "./read-more-button";
import SectionHeading from "./section-heading";

const BlogSection = () => {
  const posts: Post[] = getBlogPosts();

  return (
    <div id="blog" className="mb-28 flex scroll-mt-28 flex-col gap-4 sm:mb-40">
      <SectionHeading>Latest Articles</SectionHeading>
      {posts
        .slice(0, 4)
        ?.map((post) => <BlogCard key={post.slug} post={post} />)}
      <ReadMoreButton />
    </div>
  );
};

export default BlogSection;
