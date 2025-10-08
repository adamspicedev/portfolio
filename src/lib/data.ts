import { createElement } from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import { SiScala } from "react-icons/si";
import storeItImage from "../../public/images/storeit.png";
import movieMateImage from "../../public/images/movie-mate.png";

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
  // {
  //   name: "Blog",
  //   hash: "#blog",
  // },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const experiencesData = [
  {
    title: "Money Sweetspot Ltd",
    jobTitle: "Senior Software Developer",
    description:
      "Maintained and enhanced Money Sweetspot's technology stack (Next.js, Vite, Express.js — all in TypeScript) within a Turborepo and deployed to AWS.",
    icon: createElement(FaReact),
    date: "2024 - 2025",
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
    date: "2023 - 2024",
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
    title: "AE.LIVE",
    jobTitle: "Broadcast Supervisor/Junior Software Developer",
    description:
      "Adeptly balanced responsibilities in both graphics broadcast supervision and full-stack software development using nodeJS and React.",
    icon: createElement(FaReact),
    date: "2019 - 2021",
  },
  {
    title: "Kiwi International Digital Systems",
    jobTitle: "Operations Manager",
    description:
      "Played a pivotal role in ensuring seamless business operations, encompassing equipment management, client graphics development, and team support.",
    icon: createElement(CgWorkAlt),
    date: "2009 - 2015",
  },
] as const;

export const projectsData = [
  {
    title: "Movie-Mate",
    description:
      "A modern movie discovery app built with React, TypeScript, and Tailwind CSS. Search movies, discover trending content, and enjoy infinite scrolling powered by TMDB API.",
    tags: ["React", "Vite", "Appwrite", "Tailwind", "Tanstack Query"],
    imageUrl: movieMateImage,
    link: "https://movie-app.spicey.dev",
  },
  {
    title: "StroeIt",
    description:
      "A modern, cloud-based file storage and management application built with Next.js 15",
    tags: ["Next.js", "React", "TypeScript", "Appwrite", "Tailwind"],
    imageUrl: storeItImage,
    link: "https://storeit.spicey.dev",
  },
] as const;

export const skillsData = [
  "AWS",
  "Appwrite",
  "Vite",
  "Turborepo",
  "CI/CD",
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
  "TurboRepo",
  "Turbopack",
] as const;
