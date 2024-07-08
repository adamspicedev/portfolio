import Head from "next/head";

import { Card } from "@/components/Card";
import { Section } from "@/components/Section";
import { SimpleLayout } from "@/components/SimpleLayout";

function ToolsSection({ children, ...props }) {
	return (
		<Section {...props}>
			<ul className="space-y-16">{children}</ul>
		</Section>
	);
}

function Tool({ title, href, children }) {
	return (
		<Card as="li">
			<Card.Title as="h3" href={href}>
				{title}
			</Card.Title>
			<Card.Description>{children}</Card.Description>
		</Card>
	);
}

export default function Uses() {
	return (
		<>
			<Head>
				<title>Uses - Adam Spice</title>
				<meta
					name="description"
					content="Software I use, gadgets I love, and other things I recommend."
				/>
			</Head>
			<SimpleLayout
				title="Software I use, gadgets I love, and other things I recommend."
				intro="I get asked a lot about the things I use to build software, stay productive, or buy to fool myself into thinking I’m being productive when I’m really just procrastinating. Here’s a big list of all of my favorite stuff."
			>
				<div className="space-y-20">
					<ToolsSection title="Workstation">
						<Tool title="13” MacBook Pro, M1, 16GB RAM (2021)">
							I was using a Windows based laptop prior to this and the
							difference is night and day. I’ve never heard the fans turn on a
							single time, even under the incredibly heavy loads I put it
							through.
						</Tool>
						<Tool title="Acer Predator X3">
							Ultra-wide monitors are amazing for productivity. No bevels in the
							way for me
						</Tool>
						<Tool title="Keychron K3 keyboard">
							I like chiclet keyboards and I like mechanical keyboards. This is
							the best of both worlds.
						</Tool>
						<Tool title="Logitech G403 mouse">
							Just a solid mouse, nothing fancy. I like the shape and the scroll
							wheel is nice.
						</Tool>
					</ToolsSection>
					<ToolsSection title="Development tools">
						<Tool title="Visual Studio Code">
							I don’t care if it’s missing all of the fancy IDE features
							everyone else relies on, VSCode Text is still the best text editor
							ever made.
						</Tool>
						<Tool title="iTerm2">
							I’m honestly not even sure what features I get with this that
							aren’t just part of the macOS Terminal but it’s what I use.
						</Tool>
					</ToolsSection>
					<ToolsSection title="Design">
						<Tool title="Figma">
							I started using Figma as just a design tool but now it’s become my
							virtual whiteboard for the entire company. Never would have
							expected the collaboration features to be the real hook.
						</Tool>
						<Tool title="Photoshop">
							We started using Figma as just a design tool but now it’s become
							our virtual whiteboard for the entire company. Never would have
							expected the collaboration features to be the real hook.
						</Tool>
					</ToolsSection>
					<ToolsSection title="Productivity">
						<Tool title="Notion">
							Using a daily notes system instead of trying to keep things
							organized by topics has been super powerful for me. And with
							Reflect, it’s still easy for me to keep all of that stuff
							discoverable by topic even though all of my writing happens in the
							daily note.
						</Tool>
						<Tool title="Focus">
							Simple tool for blocking distracting websites when I need to just
							do the work and get some momentum going.
						</Tool>
					</ToolsSection>
				</div>
			</SimpleLayout>
		</>
	);
}
