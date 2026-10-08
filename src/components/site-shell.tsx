import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Asterisk, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header page-width">
      <Link
        to="/"
        className="wordmark"
        aria-label="Adam Spice home"
        onClick={() => setOpen(false)}
      >
        spicey
        <span className="wordmark-star">
          <Asterisk strokeWidth={2.7} />
        </span>
      </Link>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-navigation"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav
        id="main-navigation"
        className={`main-nav ${open ? 'is-open' : ''}`}
        aria-label="Main navigation"
      >
        <Link
          to="/"
          hash="projects"
          activeOptions={{ includeHash: true }}
          onClick={() => setOpen(false)}
        >
          Work
        </Link>
        <Link
          to="/"
          hash="about"
          activeOptions={{ includeHash: true }}
          onClick={() => setOpen(false)}
        >
          About
        </Link>
        <Link
          to="/blog"
          onClick={() => setOpen(false)}
          activeProps={{ className: 'active' }}
        >
          Stories
        </Link>
        <Link
          to="/"
          hash="contact"
          activeOptions={{ includeHash: true }}
          className="nav-contact"
          onClick={() => setOpen(false)}
        >
          Say hello <ArrowUpRight size={15} />
        </Link>
      </nav>
    </header>
  )
}
export function Footer() {
  return (
    <footer className="page-width site-footer">
      <Link to="/" className="wordmark text-xl">
        spicey
        <Asterisk size={20} />
      </Link>
      <div className="flex items-center gap-5 font-mono text-xs">
        <p>Made with curiosity & a little spice.</p>
        <Link to="/admin" className="text-link">
          Story studio
        </Link>
      </div>
      <a href="#top" className="font-mono text-xs text-link">
        Back to top ↑
      </a>
    </footer>
  )
}
export function NotFound() {
  return (
    <main id="main-content" className="page-width error-page">
      <p className="eyebrow">404 · Lost in the wires</p>
      <h1 className="section-title">
        Nothing plugged
        <br />
        in here.
      </h1>
      <p className="mt-6 mb-8">
        That page doesn't exist, or the story hasn't been published yet.
      </p>
      <Link to="/" className="button button-primary">
        Back home <ArrowUpRight size={18} />
      </Link>
    </main>
  )
}
