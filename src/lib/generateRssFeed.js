import { mkdir, writeFile } from "node:fs/promises";
import { Feed } from "feed";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import ReactDOMServer from "react-dom/server";

import { getAllArticles } from "./getAllArticles";

export async function generateRssFeed() {
	const articles = await getAllArticles();
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
	const author = {
		name: "Adam Spice",
		email: "adam@spicey.dev",
	};

	const feed = new Feed({
		title: author.name,
		description: `Adam Spice's personal blog`,
		author,
		id: siteUrl,
		link: siteUrl,
		image: `${siteUrl}/favicon.ico`,
		favicon: `${siteUrl}/favicon.ico`,
		copyright: `All rights reserved ${new Date().getFullYear()}`,
		feedLinks: {
			rss2: `${siteUrl}/rss/feed.xml`,
			json: `${siteUrl}/rss/feed.json`,
		},
	});

	for (const article of articles) {
		const url = `${siteUrl}/articles/${article.slug}`;
		const html = ReactDOMServer.renderToStaticMarkup(
			<MemoryRouterProvider>
				<article.component isRssFeed />
			</MemoryRouterProvider>,
		);

		feed.addItem({
			title: article.title,
			id: url,
			link: url,
			description: article.description,
			content: html,
			author: [author],
			contributor: [author],
			date: new Date(article.date),
		});
	}

	await mkdir("./public/rss", { recursive: true });
	await Promise.all([
		writeFile("./public/rss/feed.xml", feed.rss2(), "utf8"),
		writeFile("./public/rss/feed.json", feed.json1(), "utf8"),
	]);
}
