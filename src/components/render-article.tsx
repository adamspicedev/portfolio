"use client";

import BlockQuote from "@tiptap/extension-blockquote";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Code from "@tiptap/extension-code";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import OrderList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { generateHTML } from "@tiptap/html";
import hljs from "highlight.js";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import scala from "highlight.js/lib/languages/scala";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import { all, createLowlight } from "lowlight";
import { type JSONContent } from "novel";
import { useEffect, useMemo, useState } from "react";

const lowlight = createLowlight(all);
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);
lowlight.register("scala", scala);

const RenderArticle = ({ json }: { json: JSONContent }) => {
  const [content, setContent] = useState<string>("");

  const output = useMemo(() => {
    return generateHTML(json, [
      Document,
      Paragraph,
      Text,
      Link,
      Underline,
      Heading,
      ListItem,
      BulletList,
      Code,
      BlockQuote,
      TextStyle,
      OrderList.configure({
        HTMLAttributes: {
          class: "document",
        },
      }),
      Bold,
      HardBreak,
      HorizontalRule,
      CodeBlockLowlight.configure({ lowlight }),
    ]);
  }, [json]);

  useEffect(() => {
    const doc = new DOMParser().parseFromString(output, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      hljs.highlightElement(el as HTMLElement);
    });
    setContent(new XMLSerializer().serializeToString(doc));
  }, [output]);

  return (
    <div
      className="prose-li:marker:text-primary prose m-auto mb-10 w-11/12 dark:prose-invert sm:prose-lg sm:w-2/3"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RenderArticle;
