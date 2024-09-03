import { BlogPosts } from "@/components/posts";
import SectionHeading from "@/components/section-heading";

export const metadata = {
  title: "Blog",
  description: "Read my blog.",
};

export default function Page() {
  return (
    <section className="mb-28 flex scroll-mt-28 flex-col items-center px-4 sm:mb-40">
      <SectionHeading>My Blog</SectionHeading>
      <BlogPosts />
    </section>
  );
}
