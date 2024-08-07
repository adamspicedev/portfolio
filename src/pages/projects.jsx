import Head from "next/head";
import Image from "next/image";

import { Card } from "@/components/Card";
import { SimpleLayout } from "@/components/SimpleLayout";
import fdbk from "../images/fdbk.png";
import ordinaryTraveller from "../images/ordinary-traveller.png";

const projects = [
	{
		name: "fdBK",
		description: ` This project encompasses two components: a micro-SaaS frontend and an embeddable widget for customers' websites. Initially developed as a learning exercise, it holds potential for future release.

The widget is a React application utilizing Vite and Tailwind, with a Supabase client for direct database interaction. Designed as a web component, it can be seamlessly embedded in other websites.

The SaaS stack includes NextJS, Supabase, Tailwind, and shadcn/ui, complemented by third-party services such as Clerk for authentication and Stripe for payments.`,
		link: {
			href: "https://fdbk.spicey.dev/",
			label: "fdbk.spicey.dev",
		},
		logo: fdbk,
	},
];

function LinkIcon(props) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
			<path
				d="M15.712 11.823a.75.75 0 1 0 1.06 1.06l-1.06-1.06Zm-4.95 1.768a.75.75 0 0 0 1.06-1.06l-1.06 1.06Zm-2.475-1.414a.75.75 0 1 0-1.06-1.06l1.06 1.06Zm4.95-1.768a.75.75 0 1 0-1.06 1.06l1.06-1.06Zm3.359.53-.884.884 1.06 1.06.885-.883-1.061-1.06Zm-4.95-2.12 1.414-1.415L12 6.344l-1.415 1.413 1.061 1.061Zm0 3.535a2.5 2.5 0 0 1 0-3.536l-1.06-1.06a4 4 0 0 0 0 5.656l1.06-1.06Zm4.95-4.95a2.5 2.5 0 0 1 0 3.535L17.656 12a4 4 0 0 0 0-5.657l-1.06 1.06Zm1.06-1.06a4 4 0 0 0-5.656 0l1.06 1.06a2.5 2.5 0 0 1 3.536 0l1.06-1.06Zm-7.07 7.07.176.177 1.06-1.06-.176-.177-1.06 1.06Zm-3.183-.353.884-.884-1.06-1.06-.884.883 1.06 1.06Zm4.95 2.121-1.414 1.414 1.06 1.06 1.415-1.413-1.06-1.061Zm0-3.536a2.5 2.5 0 0 1 0 3.536l1.06 1.06a4 4 0 0 0 0-5.656l-1.06 1.06Zm-4.95 4.95a2.5 2.5 0 0 1 0-3.535L6.344 12a4 4 0 0 0 0 5.656l1.06-1.06Zm-1.06 1.06a4 4 0 0 0 5.657 0l-1.061-1.06a2.5 2.5 0 0 1-3.535 0l-1.061 1.06Zm7.07-7.07-.176-.177-1.06 1.06.176.178 1.06-1.061Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default function Projects() {
	return (
		<>
			<Head>
				<title>Projects - Adam Spice</title>
				<meta
					name="description"
					content="Things I’ve made trying to put stake my place in the world."
				/>
			</Head>
			<SimpleLayout
				title="Things I’ve made trying to put stake my place in the world."
				intro="This is a work in progress, check back later to see updates."
			>
				<ul className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
					{projects.map((project) => (
						<Card as="li" key={project.name}>
							<div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
								<Image
									src={project.logo}
									alt=""
									className="w-8 h-8"
									unoptimized
								/>
							</div>
							<h2 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
								<Card.Link href={project.link.href} target="_blank">
									{project.name}
								</Card.Link>
							</h2>
							<Card.Description>{project.description}</Card.Description>
							<p className="relative z-10 flex mt-6 text-sm font-medium transition text-zinc-400 group-hover:text-teal-500 dark:text-zinc-200">
								<LinkIcon className="flex-none w-6 h-6" />
								<span className="ml-2">{project.link.label}</span>
							</p>
						</Card>
					))}
				</ul>
			</SimpleLayout>
		</>
	);
}
