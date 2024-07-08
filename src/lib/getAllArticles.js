import * as path from "node:path";
import glob from "fast-glob";

async function importArticle(articleFilename) {
	const { meta, default: component } = await import(
		`../pages/articles/${articleFilename}`
	);
	return {
		slug: articleFilename.replace(/(\/index)?\.mdx$/, ""),
		...meta,
		component,
	};
}

export async function getAllArticles() {
	const articleFilenames = await glob(["*.mdx", "*/index.mdx"], {
		cwd: path.join(process.cwd(), "src/pages/articles"),
	});

	const articles = await Promise.all(articleFilenames.map(importArticle));

	return articles.sort((a, z) => new Date(z.date) - new Date(a.date));
}
