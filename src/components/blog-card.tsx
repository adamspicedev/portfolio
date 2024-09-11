"use client";

import { Article } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";
import React, { useRef } from "react";

const BlogCard = ({ article, even }: { article: Article; even: boolean }) => {
  const { title, description, imageUrl, tags } = article;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });

  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

  return (
    <motion.div
      ref={ref}
      style={{
        scale: scaleProgress,
        opacity: opacityProgress,
      }}
      className="group mb-3 last:mb-0 sm:mb-8"
    >
      <section className="relative max-w-[42rem] overflow-hidden rounded-lg border border-black/5 bg-gray-100 transition hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:h-[20rem] sm:pr-8 sm:group-even:pl-8">
        <div
          className={cn(
            "flex h-full flex-col px-5 pb-7 pt-4 sm:max-w-[50%] sm:pl-10 sm:pr-2 sm:pt-10",
            even && "sm:ml-[18rem]",
          )}
        >
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-white/70">
            {description}
          </p>
        </div>

        <div className="flex flex-col">
          <Image
            src={imageUrl}
            alt="Project I worked on"
            width={200}
            height={50}
            quality={95}
            className={cn(
              "group-even: absolute -right-40 top-8 hidden w-[28.25rem] rounded-t-lg shadow-2xl transition group-hover:-translate-x-3 group-hover:translate-y-3 group-hover:-rotate-2 group-hover:scale-[1.04] group-even:group-hover:translate-x-3 group-even:group-hover:translate-y-3 group-even:group-hover:rotate-2 sm:block",
              even &&
                "-left-40 group-hover:translate-x-3 group-hover:translate-y-3 group-hover:rotate-3",
            )}
          />
          <ul
            className={cn(
              "absolute bottom-5 right-10 mt-4 flex flex-wrap gap-2 sm:mt-auto",
              even && "lef-10",
            )}
          >
            {tags?.map((tag, index) => (
              <li
                className="rounded-full bg-black/[0.7] px-3 py-1 text-[0.7rem] uppercase tracking-wider text-white dark:text-white/70"
                key={index}
              >
                {tag.tag.name}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </motion.div>
  );
};

export default BlogCard;
