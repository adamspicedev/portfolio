import clsx from "clsx";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/Container";
import {
	DevToIcon,
	GitHubIcon,
	InstagramIcon,
	LinkedInIcon,
	TwitterIcon,
} from "@/components/SocialIcons";
import portraitImage from "@/images/portrait.png";

function SocialLink({ className, href, children, icon: Icon }) {
	return (
		<li className={clsx(className, "flex")}>
			<Link
				href={href}
				className="flex text-sm font-medium transition group text-zinc-800 hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
			>
				<Icon className="flex-none w-6 h-6 transition fill-zinc-500 group-hover:fill-teal-500" />
				<span className="ml-4">{children}</span>
			</Link>
		</li>
	);
}

function MailIcon(props) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
			<path
				fillRule="evenodd"
				d="M6 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6Zm.245 2.187a.75.75 0 0 0-.99 1.126l6.25 5.5a.75.75 0 0 0 .99 0l6.25-5.5a.75.75 0 0 0-.99-1.126L12 12.251 6.245 7.187Z"
			/>
		</svg>
	);
}

export default function About() {
	return (
		<>
			<Head>
				<title>About - Adam Spice</title>
				<meta
					name="description"
					content="I'm Adam Spice. I live in New Auckland, New Zealand, where I geek out to my hearts content."
				/>
			</Head>
			<Container className="mt-16 sm:mt-32">
				<div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
					<div className="lg:pl-20">
						<div className="max-w-xs px-2.5 lg:max-w-none">
							<Image
								src={portraitImage}
								alt=""
								sizes="(min-width: 1024px) 32rem, 20rem"
								className="object-cover aspect-square rotate-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800"
							/>
						</div>
					</div>
					<div className="lg:order-first lg:row-span-2">
						<h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
							I&apos;m Adam Spice. I live in Auckland, New Zealand, where I geek
							out to my hearts content.
						</h1>
						<div className="mt-6 text-base space-y-7 text-zinc-600 dark:text-zinc-400">
							<p>
								I first discovered my geekness when I was a kid. I got my first
								computer - a Dragon 32 - and found that I loved writing programs
								on that more than I loved going outside and kicking a ball
								around. The geekness carried on all through school, where my
								friends and I would talk about all sorts of stuff, from the
								latest video games to how to make your computer faster.
							</p>
							<p>
								This geekness eventually led to a long and varied career in IT,
								from basic support to management of departments. Which leads me
								to where I am now, development. The love of writing a program
								and having it do something never went away
							</p>
							<p>
								So five years ago I approached my current boss and said I would
								like to become a software developer, he agreed and gave me my
								first project and since then I haven&apos;t looked back.
							</p>
						</div>
					</div>
					<div className="lg:pl-20">
						<ul>
							<SocialLink
								href="https://twitter.com/home?lang=en"
								icon={TwitterIcon}
							>
								Follow on Twitter
							</SocialLink>
							<SocialLink
								href="https://github.com/adamspicedev"
								icon={GitHubIcon}
								className="mt-4"
							>
								Follow on GitHub
							</SocialLink>
							<SocialLink
								href="https://www.linkedin.com/in/adam-spice/"
								icon={LinkedInIcon}
								className="mt-4"
							>
								Follow on LinkedIn
							</SocialLink>
							<SocialLink
								href="https://dev.to/spiceydev"
								icon={DevToIcon}
								className="mt-4"
							>
								Follow on DEV
							</SocialLink>
							<SocialLink
								href="mailto:adam@spicey.dev"
								icon={MailIcon}
								className="pt-8 mt-8 border-t border-zinc-100 dark:border-zinc-700/40"
							>
								adam@spicey.dev
							</SocialLink>
						</ul>
					</div>
				</div>
			</Container>
		</>
	);
}
