"use client";

import { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { BsFiletypeMdx } from "react-icons/bs";

const BlogCard = ({ post }: { post: Post }) => {
  const { metadata, slug } = post;
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
      className="group mb-3 last:mb-0 sm:mb-10"
    >
      <Link prefetch={false} href={`/blog/${slug}`}>
        <section className="relative max-w-[42rem] overflow-hidden rounded-lg border border-black/5 bg-gray-100 transition hover:bg-gray-200 sm:pr-8 sm:group-even:pl-8 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
          <div className="flex h-full flex-col px-5 pb-7 pt-4 sm:max-w-[50%] sm:pl-10 sm:pr-2 sm:pt-10 sm:group-even:ml-[18rem]">
            <h3 className="text-2xl font-semibold">{metadata.title}</h3>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400 tabular-nums whitespace-nowrap">
              {formatDate(metadata.publishedAt)}
            </p>
            <p className="mt-2 mb-6 leading-relaxed text-gray-700 dark:text-white/70">
              {metadata.summary}
            </p>
            <ul className="mt-8 flex flex-wrap gap-2 sm:mt-auto">
              {metadata?.tags?.split(", ").map((tag, index) => (
                <li
                  className="rounded-full bg-black/[0.7] px-3 py-1 text-[0.7rem] uppercase tracking-wider text-white dark:text-white/70"
                  key={index}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
          {metadata.imageUrl ? (
            <Image
              width={200}
              height={20}
              src={metadata.imageUrl}
              alt="Project I worked on"
              quality={95}
              className="absolute -right-40 top-8 hidden w-[28.25rem] rounded-t-lg shadow-2xl transition group-even:-left-40 group-even:right-[initial] group-hover:-translate-x-3 group-hover:translate-y-3 group-hover:-rotate-2 group-hover:scale-[1.04] group-even:group-hover:translate-x-3 group-even:group-hover:translate-y-3 group-even:group-hover:rotate-2 sm:block"
            />
          ) : (
            <BsFiletypeMdx
              size={200}
              className="absolute -right-40 top-8 hidden w-[50.25rem] rounded-t-lg transition group-even:-left-40 group-even:right-[initial] group-hover:-translate-x-3 group-hover:translate-y-3 group-hover:-rotate-2 group-hover:scale-[1.04] group-even:group-hover:translate-x-3 group-even:group-hover:translate-y-3 group-even:group-hover:rotate-2 sm:block"
            />
          )}
        </section>
      </Link>
    </motion.div>
  );
};

export default BlogCard;
