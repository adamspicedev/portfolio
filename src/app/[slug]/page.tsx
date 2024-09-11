import RenderArticle from "@/components/render-article";
import { Article } from "@/lib/types";
import { JSONContent } from "novel";
import Image from "next/image";
import ScrollToTop from "@/components/scroll-to-top";

const getData = async (slug: string) => {
  const res = await fetch(`${process.env.WRITE_IT_UP_URL}/${slug}`);
  const articleResponse = await res.json();
  return articleResponse;
};

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

const ArticlePage = async ({ params }: ArticlePageProps) => {
  const { slug } = params;
  let article: Article[] = [];
  try {
    const response = await getData(slug);
    article = response.body;
  } catch (error) {
    console.error(error);
    return <div>Failed to load articles</div>;
  }

  return (
    <section>
      <ScrollToTop />
      <div className="mb-10 flex flex-col items-center justify-center">
        <div className="m-auto w-full text-center md:w-7/12">
          <p className="text-muted-foreground m-auto my-5 w-10/12 text-sm font-light md:text-base">
            {new Intl.DateTimeFormat("en-NZ", {
              dateStyle: "medium",
            }).format(new Date(article[0].createdAt))}
          </p>
          <h1 className="mb-5 text-3xl font-bold tracking-tight md:text-6xl">
            {article[0].title}
          </h1>
          <p className="text-muted-foreground m-auto line-clamp-3 w-10/12">
            {article[0].description}
          </p>
        </div>
      </div>

      <div className="relative m-auto mb-10 h-80 w-full max-w-screen-lg overflow-hidden md:mb-20 md:h-[450px] md:w-5/6 md:rounded-2xl lg:w-2/3">
        <Image
          src={article[0].imageUrl}
          alt={article[0].title}
          width={200}
          height={50}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      <RenderArticle json={article[0].content as JSONContent} />
    </section>
  );
};

export default ArticlePage;
