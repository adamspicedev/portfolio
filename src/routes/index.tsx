import { useState } from 'react'
import { useHomeMotion } from '../components/home-motion'
import { pageSeo, homeTitle, homeDescription } from '../lib/seo'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUpRight,
  Asterisk,
  Braces,
  Code2,
  Sparkles,
  Pause,
  Play,
} from 'lucide-react'
import { Computer } from '../components/computer'
import { Contact } from '../components/contact'
import { StoryCard } from '../components/story-card'
import { experiencesData, projectsData, skillsData } from '../lib/portfolio'
import { getStories } from '../lib/stories.functions'

export const Route = createFileRoute('/')({
  loader: () => getStories(),
  head: ({ loaderData }) =>
    !loaderData
      ? pageSeo({
          title: 'Page unavailable · Adam Spice',
          description:
            'This page is temporarily unavailable. Please try again.',
          path: '/',
          index: false,
        })
      : pageSeo({ title: homeTitle, description: homeDescription, path: '/' }),
  component: Home,
})

function Home() {
  useHomeMotion()
  const [ribbonPaused, setRibbonPaused] = useState(false)
  const stories = Route.useLoaderData()
  return (
    <main id="main-content" className="game-world">
      <section className="hero page-width">
        <div className="hero-copy">
          <div className="hero-intro">
            <img src="/images/avatar.png" width="38" height="38" alt="" />
            <span className="font-mono text-xs">Hey, I'm Adam Spice.</span>
            <span className="player-badge font-mono">PLAYER 01</span>
          </div>
          <div className="retro-controller" aria-hidden="true">
            <svg
              viewBox="0 0 32 18"
              fill="currentColor"
              shapeRendering="crispEdges"
            >
              <path
                d="M4 2h24v2h2v12h-2v2h-8v-4h-8v4H4v-2H2V4h2V2zm2 4v2H4v2h2v2h2v-2h2V8H8V6H6zm16 0v4h4V6h-4zm-4 4v4h4v-4h-4z"
                fillRule="evenodd"
              />
            </svg>
            <span className="font-mono">CODE · PLAY · REPEAT</span>
          </div>
          <h1>
            I build things
            <br />
            for the{' '}
            <span className="hero-web">
              web
              <svg viewBox="0 0 290 20" fill="none" aria-hidden="true">
                <path
                  d="M4 12C65 2 162 2 285 9M27 18c82-9 175-10 245-5"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="hero-period">.</span>
          </h1>
          <p className="hero-description">
            Full-stack developer. Curious human.
            <br />A soft spot for React, a love of making things,
            <br className="hidden xl:block" /> and just enough spice to keep it
            interesting.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#projects" className="button button-primary">
              Select a project <ArrowUpRight size={18} />
            </a>
            <a
              href="/files/AdamSpiceResume.pdf"
              download
              className="button button-plain"
            >
              Grab my CV <ArrowDownToLine size={16} />
            </a>
          </div>
          <div className="hero-footnote">
            <span className="status-dot" />
            <span className="font-mono text-[10px]">
              Making useful things. Having fun doing it.
            </span>
          </div>
        </div>
        <Computer />
        <a className="scroll-cue" href="#projects">
          <ArrowDown size={15} />
          <span className="font-mono text-[10px]">There's more down here</span>
        </a>
      </section>
      <div
        className="skills-ribbon"
        data-paused={ribbonPaused}
        aria-label="Favourite technologies"
      >
        <div className="page-width ribbon-inner">
          <span>REACT</span>
          <Asterisk />
          <span>TYPESCRIPT</span>
          <Asterisk />
          <span>NODE.JS</span>
          <Asterisk />
          <span>THINKING IN CODE</span>
          <Asterisk />
          <span>BUILDING WITH CURIOSITY</span>
          <Asterisk />
        </div>
        <button
          type="button"
          className="ribbon-motion-control"
          aria-label={ribbonPaused ? 'Play stars' : 'Pause stars'}
          aria-pressed={ribbonPaused}
          onClick={() => setRibbonPaused(!ribbonPaused)}
        >
          {ribbonPaused ? (
            <Play size={14} aria-hidden="true" />
          ) : (
            <Pause size={14} aria-hidden="true" />
          )}
        </button>
      </div>
      <section id="projects" className="page-width section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Character select · Projects</p>
            <h2 className="section-title">
              Choose your
              <br />
              <span className="font-serif italic">project.</span>
            </h2>
          </div>
          <p className="section-note">
            Two builds from my collection.
            <br />
            Inspect their abilities, then take one for a spin.
          </p>
        </div>
        <div className="grid gap-7 md:grid-cols-2">
          {projectsData.map((project, index) => (
            <article
              className="project-card character-card"
              key={project.title}
            >
              <div className="game-panel-bar font-mono">
                <span>BUILD 0{index + 1}</span>
                <span>PROJECT FILE</span>
              </div>
              <a
                className={`project-art project-art-${project.color}`}
                href={project.link}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${project.title} (opens in a new tab)`}
              >
                <span className="project-category font-mono">
                  <span className="cartridge-number">0{index + 1}</span>{' '}
                  {project.category}
                </span>
                <div className="project-browser">
                  <div className="browser-bar">
                    <span />
                    <span />
                    <span />
                    <span className="browser-address">
                      {new URL(project.link).hostname}
                    </span>
                  </div>
                  <img
                    src={project.image}
                    alt={`${project.title} application screenshot`}
                    width={1000}
                    height={650}
                    loading="lazy"
                  />
                </div>
                <span className="project-open">
                  <ArrowUpRight size={23} />
                </span>
              </a>
              <div className="project-details">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4"
                >
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {project.title}
                  </h3>
                  <ArrowUpRight size={19} />
                </a>
                <dl className="character-stats font-mono">
                  <div>
                    <dt>CLASS</dt>
                    <dd>{project.category}</dd>
                  </div>
                  <div>
                    <dt>ABILITIES</dt>
                    <dd>{project.tags.length} technologies</dd>
                  </div>
                </dl>
                <p className="mt-3 max-w-md leading-relaxed text-muted">
                  {project.description}
                </p>
                <p className="game-field-label font-mono">EQUIPPED STACK</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  className="game-card-action font-mono"
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  View project <ArrowUpRight size={16} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="about" className="about-section section-space">
        <div className="page-width about-grid">
          <div className="about-portrait">
            <div className="portrait-frame">
              <div className="portrait-caption font-mono">
                <span>player profile</span>
                <span>↗</span>
              </div>
              <img
                src="/images/avatar.png"
                alt="Adam Spice"
                width={500}
                height={500}
                loading="lazy"
              />
            </div>
            <span className="portrait-sticker">
              <Code2 size={28} />
              <span className="font-mono text-[11px]">
                curious since
                <br />
                the Dragon 32
              </span>
            </span>
            <div className="about-scribble" aria-hidden="true">
              that's me! ↗
            </div>
          </div>
          <div className="player-profile-panel">
            <p className="eyebrow">Player profile · Adam Spice</p>
            <dl className="player-stats font-mono">
              <div>
                <dt>CLASS</dt>
                <dd>Full-stack developer</dd>
              </div>
              <div>
                <dt>ORIGIN</dt>
                <dd>Dragon 32</dd>
              </div>
              <div>
                <dt>OFF DUTY</dt>
                <dd>Gaming · Movies</dd>
              </div>
            </dl>
            <h2 className="section-title">
              A lifelong
              <br />
              <span className="font-serif italic">tinkerer.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed">
              It started with a Dragon 32 and a fascination with making a
              computer do something new. That curiosity never really went away.
            </p>
            <p className="mt-5 leading-relaxed text-muted">
              My path has taken me through IT support, operations, broadcast
              graphics, and software development. Since 2018, I've been turning
              ideas into full-stack applications, with React and TypeScript at
              the heart of much of my work.
            </p>
            <p className="mt-5 leading-relaxed text-muted">
              Away from the keyboard, you'll find me gaming, watching movies, or
              learning something new. I like getting stuck into things.
            </p>
            <Link
              to="/blog/$slug"
              params={{ slug: 'it-started-with-a-dragon-32' }}
              className="text-link mt-7 inline-flex items-center gap-2 font-medium"
            >
              Read the origin story <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section id="skills" className="page-width toolkit-section section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Inventory · Skills</p>
            <h2 className="section-title">My equipped stack.</h2>
          </div>
          <Braces
            size={57}
            strokeWidth={1.2}
            className="text-cobalt hidden sm:block"
          />
        </div>
        <div className="toolbox-grid">
          {[...new Set(skillsData)].map((skill, index) => (
            <span key={skill} className="toolbox-item">
              <span className="inventory-slot font-mono" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{skill}</span>
            </span>
          ))}
        </div>
      </section>
      <section
        id="experience"
        className="experience-section page-width section-space"
      >
        <div className="experience-intro">
          <p className="eyebrow">Quest log · Experience</p>
          <h2 className="section-title">
            The story
            <br />
            so <span className="font-serif italic">far.</span>
          </h2>
          <Sparkles className="mt-8 text-cobalt" size={36} strokeWidth={1.2} />
        </div>
        <div className="experience-list">
          {[...experiencesData]
            .sort(
              (a, b) => Number(b.date.slice(0, 4)) - Number(a.date.slice(0, 4)),
            )
            .map((experience) => (
              <article className="experience-row" key={experience.title}>
                <div className="quest-date font-mono">
                  <span className="quest-marker" aria-hidden="true">
                    ◆
                  </span>
                  <span>{experience.date}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    {experience.title}
                  </h3>
                  <p className="mt-1 text-sm text-cobalt">
                    {experience.jobTitle}
                  </p>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
                    {experience.description}
                  </p>
                </div>
              </article>
            ))}
        </div>
      </section>
      <section className="stories-section section-space">
        <div className="page-width">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Journal · Stories</p>
              <h2 className="section-title">
                From the <span className="font-serif italic">journal.</span>
              </h2>
            </div>
            <Link to="/blog" className="button button-outline">
              All stories <ArrowUpRight size={17} />
            </Link>
          </div>
          <div
            className={`grid gap-6 ${stories.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : 'story-feature-grid'}`}
          >
            {stories.slice(0, 6).map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
            {stories.length === 1 && (
              <div className="stories-aside">
                <Asterisk size={75} strokeWidth={1} />
                <p className="text-3xl font-medium tracking-tight">
                  Things I've learned.
                  <br />
                  Things I'm trying.
                  <br />
                  Things worth sharing.
                </p>
                <span className="font-mono text-xs">One story at a time.</span>
              </div>
            )}
            {stories.length === 0 && (
              <p>
                New stories are on their way. Explore my projects in the
                meantime.
              </p>
            )}
          </div>
        </div>
      </section>
      <Contact />
    </main>
  )
}
