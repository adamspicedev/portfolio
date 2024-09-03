"use client";

import { Post } from "@/lib/types";
import { useState } from "react";
import BlogCard from "./blog-card";
import { AnimatePresence, motion } from "framer-motion";

const PostsClient = ({ posts }: { posts: Post[] }) => {
  const [tag, setTag] = useState("");
  const filteredPosts = posts.filter((post) =>
    post.metadata.tags.includes(tag),
  );
  return (
    <>
      {tag !== "" && (
        <AnimatePresence>
          <motion.button
            key="clear-filter"
            initial={{ scale: 0, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="mb-4 flex h-[3rem] w-full items-center justify-center gap-2 rounded-full bg-gray-900 text-white outline-none transition-all hover:scale-110 hover:bg-gray-950 focus:scale-110 active:scale-105 disabled:scale-100 disabled:bg-opacity-65 dark:bg-white dark:bg-opacity-10"
            onClick={() => setTag("")}
          >
            Clear Filter
          </motion.button>
        </AnimatePresence>
      )}
      {filteredPosts.map((post, index) => (
        <BlogCard key={index} post={post} setTag={setTag} />
      ))}
    </>
  );
};

export default PostsClient;
