"use client";

import { type JSONContent } from "novel";
import { useEffect, useMemo, useState } from "react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { generateHTML } from "@tiptap/html";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import Code from "@tiptap/extension-code";
import BlockQuote from "@tiptap/extension-blockquote";
import TextStyle from "@tiptap/extension-text-style";
import CodeBlock from "@tiptap/extension-code-block";
import OrderList from "@tiptap/extension-ordered-list";
import Bold from "@tiptap/extension-bold";
import HardBreak from "@tiptap/extension-hard-break";
import { all, createLowlight } from "lowlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import scala from "highlight.js/lib/languages/scala";
import { ReactNodeViewRenderer } from "@tiptap/react";
import hljs from "highlight.js";

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
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    setContent(new XMLSerializer().serializeToString(doc));
  }, [output]);

  return (
    <div
      className="prose dark:prose-invert sm:prose-lg prose-li:marker:text-primary m-auto mb-10 w-11/12 sm:w-2/3"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RenderArticle;
