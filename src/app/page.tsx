import About from "@/components/about";
import BlogSection from "@/components/blog-section";
import Contact from "@/components/contact";
import ExperienceAnimationWrapper from "@/components/experience-animation-wrapper";
import Intro from "@/components/intro";
import Projects from "@/components/projects";
import SectionDivider from "@/components/section-divider";
import Skills from "@/components/skills";

const Home = async () => {
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
      <BlogSection />
      <Contact />
    </main>
  );
};

export default Home;
