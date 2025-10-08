import About from "@/components/about";
// import Blog from "@/components/blog";
import Contact from "@/components/contact";
import ExperienceAnimationWrapper from "@/components/experience-animation-wrapper";
import Intro from "@/components/intro";
import Projects from "@/components/projects";
import SectionDivider from "@/components/section-divider";
import Skills from "@/components/skills";
// import { Article, ArticleResponse } from "@/lib/types";

// const getData = async () => {
//   const res = await fetch(`${process.env.WRITE_IT_UP_URL}`);
//   const articleResponse: ArticleResponse = await res.json();
//   return articleResponse;
// };

const Home = async () => {
  // let articles: Article[] = [];
  // try {
  //   const response = await getData();
  //   articles = response.body.articles;
  // } catch (error) {
  //   console.error(error);
  //   return <div>Failed to load articles</div>;
  // }

  // const sortedArticles = Array.isArray(articles)
  //   ? articles.sort(
  //       (a, b) =>
  //         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  //     )
  //   : [];

  return (
    <main
      id="#"
      className="mb-28 flex scroll-mt-28 flex-col items-center px-4 sm:mb-40"
    >
      <Intro />
      <SectionDivider />
      <About />
      <Projects />
      <Skills />
      <ExperienceAnimationWrapper />
      {/* <Blog articles={sortedArticles} /> */}
      <Contact />
    </main>
  );
};

export default Home;
