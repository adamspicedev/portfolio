"use client";

import { motion } from "framer-motion";
import SectionHeading from "./section-heading";
import { useSectionInView } from "@/lib/hooks";
import { yearsBetweenAsWord } from "@/lib/utils";

const About = () => {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
      className="mb-28 max-w-[45rem] scroll-mt-28 text-center leading-8 sm:mb-40"
    >
      <SectionHeading>About me</SectionHeading>
      <p className="mb-3">
        My journey into tech began with a{" "}
        <span className="font-bold">childhood fascination</span>. After getting
        my hands on a Dragon 32 computer, I quickly{" "}
        <span className="font-bold">fell in love with coding</span> — so much
        that it beat out any interest in kicking a ball around outside. As I
        grew up, that geeky passion stuck with me, leading me through school
        where I spent countless hours talking with friends about the latest
        video games and ways to speed up our computers.
      </p>
      <p className="mb-3">
        This passion paved the way for a{" "}
        <span className="font-bold">varied career in IT</span>, from basic
        support to <span className="font-bold">department management</span>. But
        the love for coding never faded. {yearsBetweenAsWord(2018)} years ago, I
        approached my boss about diving into software development. He agreed,
        gave me my first project, and I haven&apos;t looked back since!
      </p>
      <p>
        <span className="italic">When I&apos;m not coding</span>, I enjoy
        gaming, watching movies, and learning new things. I have also recently
        embarked on a fitness journey, which has been a great way to clear my
        mind and stay healthy.
      </p>
    </motion.section>
  );
};

export default About;
