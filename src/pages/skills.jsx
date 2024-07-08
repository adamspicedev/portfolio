import Head from "next/head";

import { Card } from "@/components/Card";
import { Section } from "@/components/Section";
import { SimpleLayout } from "@/components/SimpleLayout";

import CssLogo from "../images/logos/css.png";
import HtmlLogo from "../images/logos/html.png";
import JsLogo from "../images/logos/javascript.png";
import MuiLogo from "../images/logos/mui5.png";
import NextLogo from "../images/logos/nextjs-icon.svg";
import NodeLogo from "../images/logos/node.png";
import ReactLogo from "../images/logos/react.png";
import ReduxLogo from "../images/logos/redux.png";
import SassLogo from "../images/logos/sass.png";
import TailwindLogo from "../images/logos/tailwind.svg";
import TSLogo from "../images/logos/typescript.png";

import NestLogo from "../images/logos/NestJS.svg";
import CSharpLogo from "../images/logos/csharp.svg";
import ExpressLogo from "../images/logos/express.png";
import GraphqlLogo from "../images/logos/graphql.png";

import AzureLogo from "../images/logos/azure.png";
import CypressLogo from "../images/logos/cypress.svg";
import GitLogo from "../images/logos/git.png";
import GitHubLogo from "../images/logos/github.png";
import JestLogo from "../images/logos/jest.svg";
import RTLLogo from "../images/logos/rtl.webp";
import StorybookLogo from "../images/logos/storybook.svg";
import TurboLogo from "../images/logos/turborepo.svg";
import ViteLogo from "../images/logos/vite.png";
import WebpackLogo from "../images/logos/webpack.svg";

import Image from "next/image";

function SkillsSection({ children, ...props }) {
	return (
		<Section {...props}>
			<div className="space-y-16">{children}</div>
		</Section>
	);
}

function SkillsList({ skills }) {
	return (
		<Card as="article">
			<div className="grid grid-cols-4 gap-4">
				{skills.map((skill) => (
					<Image
						className="h-12 w-12 rounded-full bg-gray-100"
						key={`FE_${skill.id}`}
						src={skill.image}
						alt={skill.name}
					/>
				))}
			</div>
		</Card>
	);
}

export default function Skills() {
	return (
		<>
			<Head>
				<title>Skills - Adam Spice</title>
				<meta
					name="description"
					content="I got the skills to pay the bills I don't pop pills but I send chills Up your spine when I rhyme."
				/>
			</Head>
			<SimpleLayout
				title="I got the skills to pay the bills I don't pop pills but I send chills Up your spine when I rhyme."
				intro="Just some of the skills I have picked up along the way and use in a commerical environment."
			>
				<div className="space-y-20">
					<SkillsSection title="Front End">
						<SkillsList
							skills={[
								{ id: 1, image: HtmlLogo, name: "HTML" },
								{ id: 2, image: CssLogo, name: "CSS" },
								{ id: 4, image: JsLogo, name: "JavaScript" },
								{ id: 5, image: TSLogo, name: "TypeScript" },
								{ id: 6, image: NextLogo, name: "Next.js" },
								{ id: 7, image: ReactLogo, name: "React" },
								{ id: 8, image: ReduxLogo, name: "Redux" },
								{ id: 9, image: TailwindLogo, name: "Tailwind CSS" },
								{ id: 10, image: SassLogo, name: "Sass" },
								{ id: 11, image: MuiLogo, name: "Material UI" },
							]}
						/>
					</SkillsSection>
					<SkillsSection title="Back End">
						<SkillsList
							skills={[
								{ id: 12, image: NodeLogo, name: "Node.js" },
								{ id: 13, image: TSLogo, name: "TypeScript" },
								{ id: 14, image: NestLogo, name: "Nest.js" },
								{ id: 15, image: CSharpLogo, name: "C#" },
								{ id: 16, image: ExpressLogo, name: "ExpressJS" },
								{ id: 17, image: GraphqlLogo, name: "GraphQL" },
							]}
						/>
					</SkillsSection>
					<SkillsSection title="Tooling">
						<SkillsList
							skills={[
								{ id: 18, image: TurboLogo, name: "Turborepo" },
								{ id: 19, image: GitLogo, name: "Git" },
								{ id: 20, image: GitHubLogo, name: "GitHub" },
								{ id: 21, image: CypressLogo, name: "Cypress" },
								{ id: 22, image: JestLogo, name: "Jest" },
								{ id: 23, image: RTLLogo, name: "React Testing Library" },
								{ id: 24, image: StorybookLogo, name: "Storybook" },
								{ id: 25, image: WebpackLogo, name: "Webpack" },
								{ id: 26, image: ViteLogo, name: "Vite" },
								{ id: 27, image: AzureLogo, name: "Azure" },
							]}
						/>
					</SkillsSection>
				</div>
			</SimpleLayout>
		</>
	);
}
