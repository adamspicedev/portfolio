"use client";

import { useTheme } from "@/context/theme-context";
import { useBreakpoint } from "@/lib/hooks";
import { BsMoon, BsSun } from "react-icons/bs";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();
  const isDesktop = useBreakpoint("sm");

  return isDesktop ? (
    <button
      className="fixed bottom-5 right-5 flex h-[3rem] w-[3rem] items-center justify-center rounded-full border border-white border-opacity-40 bg-white bg-opacity-80 text-base shadow-2xl backdrop-blur-[0.5rem] transition-all hover:scale-[1.15] hover:text-base active:scale-105 dark:bg-gray-950"
      onClick={toggleTheme}
    >
      {theme === "light" ? <BsSun /> : <BsMoon />}
    </button>
  ) : (
    <div className="group fixed bottom-5 right-5 h-[7rem] w-[7rem]">
      <button
        className="fixed bottom-5 right-5 flex h-[1rem] w-[1rem] items-center justify-center rounded-full border border-white border-opacity-40 bg-white bg-opacity-80 text-[5pt] shadow-2xl backdrop-blur-[0.5rem] transition-all active:scale-105 group-hover:h-[3rem] group-hover:w-[3rem] group-hover:scale-[1.15] group-hover:text-base dark:bg-gray-950"
        onClick={toggleTheme}
      >
        {theme === "light" ? <BsSun /> : <BsMoon />}
      </button>
    </div>
  );
};

export default ThemeSwitch;
