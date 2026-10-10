import { useEffect } from 'react'

/** One-time entrances; content stays visible if JavaScript or motion is unavailable. */
export function useHomeMotion() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (preference.matches || !('IntersectionObserver' in window)) return
    const animations = new Set<Animation>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.unobserve(entry.target)
          const card = entry.target.matches('.project-card, .story-card')
          const animation = entry.target.animate(
            [
              {
                transform: `translateY(${card ? 48 : 20}px)`,
                opacity: card ? 0 : 0.35,
              },
              { transform: 'translateY(0)', opacity: 1 },
            ],
            {
              duration: card ? 650 : 250,
              easing: card
                ? 'cubic-bezier(0.16, 1, 0.3, 1)'
                : 'cubic-bezier(0.23, 1, 0.32, 1)',
            },
          )
          animations.add(animation)
          void animation.finished.then(
            () => animations.delete(animation),
            () => animations.delete(animation),
          )
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -48px 0px' },
    )
    document
      .querySelectorAll(
        '.hero-copy, .section-heading, .project-card, .story-card, .experience-row',
      )
      .forEach((element) => observer.observe(element))
    const stop = () => {
      if (!preference.matches) return
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
      animations.clear()
    }
    preference.addEventListener('change', stop)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', stop)
      animations.forEach((animation) => animation.cancel())
    }
  }, [])
}
