"use client";

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import scala from "highlight.js/lib/languages/scala";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("scala", scala);

export type CodeSnippetProps = {
  snippet: string;
  language: "javascript" | "scala";
};

const CodeSnippet = ({ snippet, language }: CodeSnippetProps) => {
  return (
    <pre>
      <code className={language}>{snippet}</code>
    </pre>
  );
};

export default CodeSnippet;
