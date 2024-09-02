"use client";

import { useRouter } from "next/navigation";
import React from "react";

const ReadMoreButton = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/blog")}
      type="button"
      className="group flex h-[3rem] w-[8rem] items-center justify-center gap-2 rounded-full bg-gray-900 text-white outline-none transition-all hover:scale-110 hover:bg-gray-950 focus:scale-110 active:scale-105 disabled:scale-100 disabled:bg-opacity-65 dark:bg-white dark:bg-opacity-10"
    >
      Read More
    </button>
  );
};

export default ReadMoreButton;
