import clsx from "clsx";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import {
	DevToIcon,
	GitHubIcon,
	LinkedInIcon,
	TwitterIcon,
} from "@/components/SocialIcons";
import image1 from "@/images/photos/image-1.webp";
import image2 from "@/images/photos/image-2.webp";
import image3 from "@/images/photos/image-3.webp";
import image4 from "@/images/photos/image-4.webp";
import image5 from "@/images/photos/image-5.webp";
import { formatDate } from "@/lib/formatDate";
import { generateRssFeed } from "@/lib/generateRssFeed";
import { getAllArticles } from "@/lib/getAllArticles";
import AdviceLinkLogo from "../images/logos/advicelink.png";
import AELogo from "../images/logos/aelive.png";
import FosterLogo from "../images/logos/fostermoore.jpeg";
import KidsLogo from "../images/logos/kids.png";
import TellaLogo from "../images/logos/tella.jpg";

function BriefcaseIcon(props) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<path
				d="M2.75 9.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
				className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
			/>
			<path
				d="M3 14.25h6.249c.484 0 .952-.002 1.316.319l.777.682a.996.996 0 0 0 1.316 0l.777-.682c.364-.32.832-.319 1.316-.319H21M8.75 6.5V4.75a2 2 0 0 1 2-2h2.5a2 2 0 0 1 2 2V6.5"
				className="stroke-zinc-400 dark:stroke-zinc-500"
			/>
		</svg>
	);
}

function ArrowDownIcon(props) {
	return (
		<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
			<path
				d="M4.75 8.75 8 12.25m0 0 3.25-3.5M8 12.25v-8.5"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function Article({ article }) {
	return (
		<Card as="article">
			<Card.Title href={`/articles/${article.slug}`}>
				{article.title}
			</Card.Title>
			<Card.Eyebrow as="time" dateTime={article.date} decorate>
				{formatDate(article.date)}
			</Card.Eyebrow>
			<Card.Description>{article.description}</Card.Description>
			<Card.Cta>Read article</Card.Cta>
		</Card>
	);
}

function SocialLink({ icon: Icon, ...props }) {
	return (
		<Link className="p-1 -m-1 group" {...props}>
			<Icon className="w-6 h-6 transition fill-zinc-500 group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
		</Link>
	);
}

function Resume() {
	const resume = [
		{
			id: 1,
			company: "AdviceLink",
			title: "Senior Software Developer",
			logo: AdviceLinkLogo,
			start: "2023",
			end: {
				label: "Present",
				dateTime: new Date().getFullYear(),
			},
		},
		{
			id: 2,
			company: "Tella",
			title: "Front Developer",
			logo: TellaLogo,
			start: "2022",
			end: "2023",
		},
		{
			id: 3,
			company: "Foster Moore",
			title: "Software Developer",
			logo: FosterLogo,
			start: "2021",
			end: "2022",
		},
		{
			id: 4,
			company: "ae.live",
			title: "Junior Software Developer",
			logo: AELogo,
			start: "2015",
			end: "2021",
		},
		{
			id: 5,
			company: "Kiwi International Digital Systems",
			title: "Operations Manager",
			logo: KidsLogo,
			start: "2009",
			end: "2015",
		},
	];

	return (
		<div className="p-6 border rounded-2xl border-zinc-100 dark:border-zinc-700/40">
			<h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
				<BriefcaseIcon className="flex-none w-6 h-6" />
				<span className="ml-3">Work</span>
			</h2>
			<ol className="mt-6 space-y-4">
				{resume.map((role) => (
					<li key={role.id} className="flex gap-4">
						<div className="relative flex items-center justify-center flex-none w-10 h-10 mt-1 rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
							<Image src={role.logo} alt="" className="h-7 w-7" unoptimized />
						</div>
						<dl className="flex flex-wrap flex-auto gap-x-2">
							<dt className="sr-only">Company</dt>
							<dd className="flex-none w-full text-sm font-medium text-zinc-900 dark:text-zinc-100">
								{role.company}
							</dd>
							<dt className="sr-only">Role</dt>
							<dd className="text-xs text-zinc-500 dark:text-zinc-400">
								{role.title}
							</dd>
							<dt className="sr-only">Date</dt>
							<dd
								className="ml-auto text-xs text-zinc-400 dark:text-zinc-500"
								aria-label={`${role.start.label ?? role.start} until ${
									role.end.label ?? role.end
								}`}
							>
								<time dateTime={role.start.dateTime ?? role.start}>
									{role.start.label ?? role.start}
								</time>{" "}
								<span aria-hidden="true">—</span>{" "}
								<time dateTime={role.end.dateTime ?? role.end}>
									{role.end.label ?? role.end}
								</time>
							</dd>
						</dl>
					</li>
				))}
			</ol>
			<Button
				href="/files/AdamSpiceResume.pdf"
				variant="secondary"
				className="w-full mt-6 group"
				target="_blank"
				rel="noopener noreferrer"
			>
				Download CV
				<ArrowDownIcon className="w-4 h-4 transition stroke-zinc-400 group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50" />
			</Button>
		</div>
	);
}

function Photos() {
	const rotations = [
		"rotate-2",
		"-rotate-2",
		"rotate-2",
		"rotate-2",
		"-rotate-2",
	];

	return (
		<div className="mt-16 sm:mt-20">
			<div className="flex justify-center gap-5 py-4 -my-4 overflow-hidden sm:gap-8">
				{[image1, image2, image3, image4, image5].map((image, imageIndex) => (
					<div
						key={image.src}
						className={clsx(
							"relative aspect-[9/10] w-44 flex-none overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:w-72 sm:rounded-2xl",
							rotations[imageIndex % rotations.length],
						)}
					>
						<Image
							src={image}
							alt=""
							sizes="(min-width: 640px) 18rem, 11rem"
							className="absolute inset-0 object-cover w-full h-full"
						/>
					</div>
				))}
			</div>
		</div>
	);
}

export default function Home({ articles }) {
	return (
		<>
			<Head>
				<title>Adam Spice - Software Developer, gamer, husband and a dad</title>
				<meta
					name="description"
					content="I'm Adam, a software developer based in Auckland, New Zealand. I'm an avid gamer and also a dad to two young girls."
				/>
			</Head>
			<Container className="mt-9">
				<div className="max-w-2xl">
					<h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
						Software Developer, gamer, husband and a dad
					</h1>
					<p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
						I&apos;m Adam, a software developer based in Auckland, New Zealand.
						I&apos;m an avid gamer and also a dad to two young girls.
					</p>
					<div className="flex gap-6 mt-6">
						<SocialLink
							href="https://github.com/adamspicedev"
							aria-label="Follow on Twitter"
							icon={TwitterIcon}
						/>

						<SocialLink
							href="https://github.com/adamspicedev"
							aria-label="Follow on GitHub"
							icon={GitHubIcon}
						/>
						<SocialLink
							href="https://www.linkedin.com/in/adam-spice/"
							aria-label="Follow on LinkedIn"
							icon={LinkedInIcon}
						/>
						<SocialLink
							href="https://dev.to/spiceydev"
							aria-label="Follow on DEV"
							icon={DevToIcon}
						/>
					</div>
				</div>
			</Container>
			<Photos />
			<Container className="mt-24 md:mt-28">
				<div className="grid max-w-xl grid-cols-1 mx-auto gap-y-20 lg:max-w-none lg:grid-cols-2">
					<div className="flex flex-col gap-16">
						{articles.map((article) => (
							<Article key={article.slug} article={article} />
						))}
					</div>
					<div className="space-y-10 lg:pl-16 xl:pl-24">
						<Resume />
					</div>
				</div>
			</Container>
		</>
	);
}

export async function getStaticProps() {
	if (process.env.NODE_ENV === "production") {
		await generateRssFeed();
	}

	return {
		props: {
			articles: (await getAllArticles())
				.slice(0, 4)
				.map(({ component, ...meta }) => meta),
		},
	};
}
