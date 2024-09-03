import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { SiScala } from "react-icons/si";
import { LuGraduationCap } from "react-icons/lu";
import fdbkImage from "../../public/images/fdbk.png";
import cryptoMartImage from "../../public/images/crypto-mart.png";
import { createElement } from "react";

export const links = [
  {
    name: "Home",
    hash: "#",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Blog",
    hash: "#blog",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const experiencesData = [
  {
    title: "Kiwi International Digital Systems",
    jobTitle: "Operations Manager",
    description:
      "Played a pivotal role in ensuring seamless business operations, encompassing equipment management, client graphics development, and team support.",
    icon: createElement(CgWorkAlt),
    date: "2009 - 2015",
  },
  {
    title: "AE.LIVE",
    jobTitle: "Broadcast Supervisor/Junior Software Developer",
    description:
      "Adeptly balanced responsibilities in both graphics broadcast supervision and full-stack software development using nodeJS and React.",
    icon: createElement(FaReact),
    date: "2019 - 2021",
  },
  {
    title: "Diploma in Software Development",
    jobTitle: "Whitecliffe College of Technology",
    description:
      "Completed a diploma in software development, while studying part-time",
    icon: createElement(LuGraduationCap),
    date: "2020 - 2022",
  },
  {
    title: "Tella Ltd",
    jobTitle: "Front End Developer",
    description:
      "Developed, as part of a team, a React based PaaS to enable mortgage brokers to use the Tella system for mortgage applications.",
    icon: createElement(FaReact),
    date: "2022 - 2023",
  },
  {
    title: "AdviceLink Ltd",
    jobTitle: "Senior Software Developer",
    description:
      "Enhanced and maintained a full-stack, multi-tenant application for mortgage and insurance advisors using Scala and scalajs-react.",
    icon: createElement(SiScala),
    date: "2023 - Present",
  },
] as const;

export const projectsData = [
  {
    title: "FDBK",
    description:
      "This project encompasses two components: a SaaS frontend and an embeddable widget for websites.",
    tags: ["React", "Next.js", "Postgres", "Tailwind", "Drizzle"],
    imageUrl: fdbkImage,
  },
  {
    title: "Crypto-Mart",
    description:
      "A vanilla JavaScript project that allows user to see up to date crypto prices.",
    tags: ["JavaScript", "chartJS", "CSS", "HTML"],
    imageUrl: cryptoMartImage,
  },
] as const;

export const skillsData = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Git",
  "Tailwind",
  "Prisma",
  "Drizzle",
  "MongoDB",
  "Redux",
  "MySQL",
  "GraphQL",
  "Apollo",
  "Express",
  "PostgreSQL",
  "Framer Motion",
] as const;
