import { BlogPosts } from "@/components/posts";
import SectionHeading from "@/components/section-heading";

export const metadata = {
  title: "Blog",
  description: "Read my blog.",
};

export default function Page() {
  return (
    <section>
      <SectionHeading>My Blog</SectionHeading>
      <BlogPosts />
    </section>
  );
}
