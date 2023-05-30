import Head from 'next/head'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'

import CssLogo from '../images/logos/css.png'
import HtmlLogo from '../images/logos/html.png'
import JsLogo from '../images/logos/javascript.png'
import MuiLogo from '../images/logos/mui5.png'
import NextLogo from '../images/logos/nextjs-icon.svg'
import NodeLogo from '../images/logos/node.png'
import ReactLogo from '../images/logos/react.png'
import ReduxLogo from '../images/logos/redux.png'
import SassLogo from '../images/logos/sass.png'
import TailwindLogo from '../images/logos/tailwind.svg'
import TSLogo from '../images/logos/typescript.png'

import NestLogo from '../images/logos/NestJS.svg'
import CSharpLogo from '../images/logos/csharp.svg'
import ExpressLogo from '../images/logos/express.png'
import GraphqlLogo from '../images/logos/graphql.png'

import TurboLogo from '../images/logos/turborepo.svg'
import GitLogo from '../images/logos/git.png'
import GitHubLogo from '../images/logos/github.png'
import CypressLogo from '../images/logos/cypress.svg'
import JestLogo from '../images/logos/jest.svg'
import RTLLogo from '../images/logos/rtl.webp'
import StorybookLogo from '../images/logos/storybook.svg'
import WebpackLogo from '../images/logos/webpack.svg'
import ViteLogo from '../images/logos/vite.png'
import AzureLogo from '../images/logos/azure.png'

import Image from 'next/image'

function SkillsSection({ children, ...props }) {
  return (
    <Section {...props}>
      <div className="space-y-16">{children}</div>
    </Section>
  )
}

function SkillsList({ skills }) {
  return (
    <Card as="article">
      <div className="grid grid-cols-4 gap-4">
        {skills.map((skill, index) => (
          <Image
            className="h-12 w-12 rounded-full bg-gray-100"
            key={`FE_${index}`}
            src={skill.image}
            alt={skill.name}
          />
        ))}
      </div>
    </Card>
  )
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
                { image: HtmlLogo, name: 'HTML' },
                { image: CssLogo, name: 'CSS' },
                { image: JsLogo, name: 'JavaScript' },
                { image: TSLogo, name: 'TypeScript' },
                { image: NextLogo, name: 'Next.js' },
                { image: ReactLogo, name: 'React' },
                { image: ReduxLogo, name: 'Redux' },
                { image: TailwindLogo, name: 'Tailwind CSS' },
                { image: SassLogo, name: 'Sass' },
                { image: MuiLogo, name: 'Material UI' },
              ]}
            />
          </SkillsSection>
          <SkillsSection title="Back End">
            <SkillsList
              skills={[
                { image: NodeLogo, name: 'Node.js' },
                { image: TSLogo, name: 'TypeScript' },
                { image: NestLogo, name: 'Nest.js' },
                { image: CSharpLogo, name: 'C#' },
                { image: ExpressLogo, name: 'ExpressJS' },
                { image: GraphqlLogo, name: 'GraphQL' },
              ]}
            />
          </SkillsSection>
          <SkillsSection title="Tooling">
            <SkillsList
              skills={[
                { image: TurboLogo, name: 'Turborepo' },
                { image: GitLogo, name: 'Git' },
                { image: GitHubLogo, name: 'GitHub' },
                { image: CypressLogo, name: 'Cypress' },
                { image: JestLogo, name: 'Jest' },
                { image: RTLLogo, name: 'React Testing Library' },
                { image: StorybookLogo, name: 'Storybook' },
                { image: WebpackLogo, name: 'Webpack' },
                { image: ViteLogo, name: 'Vite' },
                { image: AzureLogo, name: 'Azure' },
              ]}
            />
          </SkillsSection>
        </div>
      </SimpleLayout>
    </>
  )
}
