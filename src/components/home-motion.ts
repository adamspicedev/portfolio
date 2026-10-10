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
          const children = entry.target.querySelectorAll(
            '.section-heading, .project-card, .story-card, .experience-row, .ribbon-inner svg',
          )
          const targets = children.length ? [...children] : [entry.target]
          targets.forEach((target, index) => {
            const star = target.matches('.ribbon-inner svg')
            const animation = target.animate(
              star
                ? [
                    { transform: 'rotate(-90deg)', opacity: 0.4 },
                    { transform: 'rotate(0deg)', opacity: 1 },
                  ]
                : [
                    { transform: 'translateY(20px)', opacity: 0.35 },
                    { transform: 'translateY(0)', opacity: 1 },
                  ],
              {
                duration: 250,
                delay: Math.min(index, 5) * 50,
                easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
              },
            )
            animations.add(animation)
            void animation.finished.then(
              () => animations.delete(animation),
              () => animations.delete(animation),
            )
          })
        }
      },
      { threshold: 0.12 },
    )
    document
      .querySelectorAll('.hero-copy, .skills-ribbon, main > section:not(.hero)')
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
