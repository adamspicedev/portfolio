import Blog from "@/components/blog";

export default function Page() {
  return (
    <section className="flex flex-col items-center px-4">
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">My Blog</h1>
      <Blog showAll={true} />
    </section>
  );
}
