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
} from 'lucide-react'
import { Computer } from '../components/computer'
import { Contact } from '../components/contact'
import { StoryCard } from '../components/story-card'
import { experiencesData, projectsData, skillsData } from '../lib/portfolio'
import { getStories } from '../lib/stories.functions'

export const Route = createFileRoute('/')({
  loader: () => getStories(),
  head: () =>
    pageSeo({ title: homeTitle, description: homeDescription, path: '/' }),
  component: Home,
})

function Home() {
  const stories = Route.useLoaderData()
  return (
    <main id="main-content">
      <section className="hero page-width">
        <div className="hero-copy">
          <div className="hero-intro">
            <img src="/images/avatar.png" width="38" height="38" alt="" />
            <span className="font-mono text-xs">Hey, I'm Adam Spice.</span>
            <span className="intro-wave" aria-hidden="true">
              ✳
            </span>
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
              Explore my work <ArrowUpRight size={18} />
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
      <div className="skills-ribbon" aria-label="Favourite technologies">
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
      </div>
      <section id="projects" className="page-width section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Some things I've made</p>
            <h2 className="section-title">
              A little work.
              <br />A lot of{' '}
              <span className="font-serif italic">curiosity.</span>
            </h2>
          </div>
          <p className="section-note">
            From a first idea to the last little detail.
            <br />
            Here are a couple of projects I've enjoyed building.
          </p>
        </div>
        <div className="grid gap-7 md:grid-cols-2">
          {projectsData.map((project) => (
            <article className="project-card" key={project.title}>
              <a
                className={`project-art project-art-${project.color}`}
                href={project.link}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${project.title} (opens in a new tab)`}
              >
                <span className="project-category font-mono">
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
                <p className="mt-3 max-w-md leading-relaxed text-muted">
                  {project.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
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
                <span>meet the human</span>
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
          <div>
            <p className="eyebrow">Behind the keyboard</p>
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
            <p className="eyebrow">Tools of the trade</p>
            <h2 className="section-title">My digital toolbox.</h2>
          </div>
          <Braces
            size={57}
            strokeWidth={1.2}
            className="text-cobalt hidden sm:block"
          />
        </div>
        <div className="toolbox-grid">
          {[...new Set(skillsData)].map((skill) => (
            <span key={skill} className="toolbox-item">
              {skill}
            </span>
          ))}
        </div>
      </section>
      <section
        id="experience"
        className="experience-section page-width section-space"
      >
        <div className="experience-intro">
          <p className="eyebrow">The road so far</p>
          <h2 className="section-title">
            Many hats.
            <br />
            One curious
            <br />
            <span className="font-serif italic">head.</span>
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
                <p className="font-mono text-[11px] text-muted">
                  {experience.date}
                </p>
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
              <p className="eyebrow">Notes from the keyboard</p>
              <h2 className="section-title">
                A few <span className="font-serif italic">stories.</span>
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
