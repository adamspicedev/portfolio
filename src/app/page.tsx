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
    <main className="flex flex-col items-center px-4">
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
