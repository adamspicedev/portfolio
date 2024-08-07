import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html className="h-full antialiased" lang="en">
			<Head>
				<link
					rel="alternate"
					type="application/rss+xml"
					href={`${process.env.NEXT_PUBLIC_SITE_URL}/rss/feed.xml`}
				/>
				<link
					rel="alternate"
					type="application/feed+json"
					href={`${process.env.NEXT_PUBLIC_SITE_URL}/rss/feed.json`}
				/>
			</Head>
			<body className="flex flex-col h-full bg-zinc-50 dark:bg-black">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
