"use client";

import { useEffect } from "react";

const ScrollToTop = () => {
  useEffect(() => {
    try {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  }, []);
  return <></>;
};

export default ScrollToTop;
