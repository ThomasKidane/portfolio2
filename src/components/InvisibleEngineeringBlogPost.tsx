import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import conversationSvg from '../assets/essay-conversation.svg?raw'
import frontStageSvg from '../assets/essay-front-stage.svg?raw'

const sections = [
  { id: 'front-stage', number: '01', label: 'The front stage' },
  { id: 'conversation', number: '02', label: 'The conversation' },
  { id: 'back-stage', number: '03', label: 'The back stage' },
  { id: 'ai-changed', number: '04', label: 'What AI changed' },
  { id: 'what-to-do', number: '05', label: 'What to do' },
]

function RawSvgIllustration({ markup, label }: { markup: string; label: string }) {
  return (
    <div
      className="essay-raw-svg"
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

function StageFromAudience() {
  return (
    <RawSvgIllustration
      markup={frontStageSvg}
      label="The front stage of software engineering, where a programmer sits at a terminal under a spotlight while an audience watches."
    />
  )
}

function StageFromWings() {
  return (
    <RawSvgIllustration
      markup={conversationSvg}
      label="A private conversation in the theatre wings between two engineers, with the visible stage performance continuing in the background."
    />
  )
}

function BackStageCrossSection() {
  const hiddenLabels = [
    ['STAKEHOLDER', 'ALIGNMENT', 246, 315],
    ['DESIGN', 'REVIEW', 420, 338],
    ['FUTURE', 'COMPATIBILITY', 585, 298],
    ['RISK', 310, 418],
    ['ORG', 'POLITICS', 474, 430],
    ['COST', 625, 405],
  ] as const

  return (
    <svg viewBox="0 0 900 560" role="img" aria-labelledby="cross-section-title cross-section-description">
      <title id="cross-section-title">The visible and invisible parts of engineering</title>
      <desc id="cross-section-description">
        A cross-section shows writing code as a small visible peak above a line, with stakeholder alignment, design review, compatibility, risk, organizational politics, and cost beneath it.
      </desc>
      <path className="essay-accent" d="M60 190h780" />
      <text x="74" y="170">VISIBLE</text>
      <text x="74" y="218">INVISIBLE</text>
      <path className="essay-fill-light" d="M358 190l92-124 94 124z" />
      <path className="essay-fill" d="M154 190h590L680 490H222z" />
      <path d="M358 190l92-124 94 124M154 190h590L680 490H222z" />
      <path d="M238 254h424M203 365h494" strokeDasharray="6 8" />
      <text x="450" y="142" textAnchor="middle">WRITING CODE</text>
      {hiddenLabels.map(([first, secondOrX, xOrY, maybeY]) => {
        const hasSecondLine = typeof secondOrX === 'string'
        const x = hasSecondLine ? xOrY : secondOrX
        const y = hasSecondLine ? maybeY : xOrY
        return (
          <g key={first}>
            <circle cx={x as number} cy={(y as number) - 9} r="34" />
            <text x={x as number} y={(y as number) - (hasSecondLine ? 13 : 4)} textAnchor="middle">{first}</text>
            {hasSecondLine && <text x={x as number} y={(y as number) + 4} textAnchor="middle">{secondOrX}</text>}
          </g>
        )
      })}
      <text x="450" y="530" textAnchor="middle">JUDGMENT IS THE LARGEST SYSTEM IN THE ROOM</text>
    </svg>
  )
}

function DissolvingStage() {
  return (
    <svg viewBox="0 0 900 540" role="img" aria-labelledby="dissolving-title dissolving-description">
      <title id="dissolving-title">The stage dissolves</title>
      <desc id="dissolving-description">
        The visible curtain and set fade into dotted fragments, revealing gears, pulleys, counterweights, and backstage machinery.
      </desc>
      <path d="M72 60h756v410H72z" />
      <g opacity=".28" strokeDasharray="8 9">
        <path d="M72 60c94 72 150 130 220 190v220H72z" />
        <path d="M828 60c-94 72-150 130-220 190v220h220z" />
        <path d="M294 326h190M326 326l-15 48M451 326l15 48" />
        <rect x="350" y="264" width="84" height="52" />
      </g>
      <g className="essay-accent">
        <circle cx="565" cy="195" r="58" />
        <circle cx="565" cy="195" r="17" />
        <path d="M565 118v31M565 241v31M488 195h31M611 195h31M511 141l22 22M597 227l22 22M619 141l-22 22M533 227l-22 22" />
        <circle cx="681" cy="293" r="42" />
        <circle cx="681" cy="293" r="12" />
        <path d="M681 235v22M681 329v22M623 293h22M717 293h22M640 252l16 16M706 318l16 16M722 252l-16 16M656 318l-16 16" />
      </g>
      <path d="M530 60v70M565 60v58M600 60v70M735 60v118M724 178h22l-5 81h-12z" />
      <path d="M765 60v250M752 310h26v66h-26z" />
      <path d="M565 253l84 19M599 231l50 42M374 155h82v82h-82zM390 171h50v50h-50z" />
      <path d="M414 60v95M72 412h756" />
      <path d="M134 412v-55M163 412v-82M192 412v-37M708 412v-50M737 412v-91" />
      <g className="essay-fade-particles" stroke="none">
        <circle cx="256" cy="170" r="3" /><circle cx="277" cy="192" r="2" /><circle cx="239" cy="215" r="4" />
        <circle cx="312" cy="188" r="3" /><circle cx="283" cy="250" r="2" /><circle cx="329" cy="231" r="4" />
        <circle cx="218" cy="275" r="2" /><circle cx="305" cy="289" r="3" /><circle cx="263" cy="324" r="4" />
      </g>
      <text x="218" y="112" textAnchor="middle">THE FRONT STAGE</text>
      <text x="635" y="452" textAnchor="middle">THE MACHINERY WAS ALWAYS HERE</text>
    </svg>
  )
}

function DivergingPaths() {
  return (
    <svg viewBox="0 0 900 520" role="img" aria-labelledby="paths-title paths-description">
      <title id="paths-title">Two paths through software engineering</title>
      <desc id="paths-description">
        A figure stands where two paths diverge: one leads to an established company stage and the other to a smaller frontier laboratory.
      </desc>
      <path d="M450 472V356M450 356C380 298 288 254 138 220M450 356c70-58 162-102 312-136" />
      <path d="M425 472V367M475 472V367M138 203v34M762 203v34" strokeDasharray="7 7" />
      <circle cx="450" cy="314" r="24" />
      <path d="M450 338v72M450 355l-42 32M450 355l42 32M433 410l-23 50M467 410l23 50" />
      <path className="essay-fill" d="M88 104h256v116H88z" />
      <path d="M88 220V104h256v116M112 104V70h208v34M134 220v-76h62v76M236 220v-76h84" />
      <path className="essay-accent" d="M122 92h188" />
      <text x="216" y="52" textAnchor="middle">ESTABLISHED SYSTEM</text>
      <text x="216" y="132" textAnchor="middle">JUDGMENT • ALIGNMENT • RISK</text>
      <path className="essay-fill-light" d="M674 142h158v78H674z" />
      <path d="M674 220v-78h158v78M697 142l21-39h71l21 39M711 220v-42h36M768 220v-42h40" />
      <path className="essay-accent" d="M750 103V66M738 77l12-11 12 11" />
      <text x="753" y="45" textAnchor="middle">FRONTIER</text>
      <text x="753" y="245" textAnchor="middle">PRIMITIVES • RESEARCH • NARROW DOOR</text>
      <text x="450" y="505" textAnchor="middle">CHOOSE THE JOB, NOT THE POSTER</text>
    </svg>
  )
}

function Illustration({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <figure className="essay-illustration reveal" data-reveal>
      <div className="essay-diagram">{children}</div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

export function InvisibleEngineeringBlogPost() {
  const [activeSection, setActiveSection] = useState('front-stage')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (reducedMotion) {
      revealElements.forEach(element => element.classList.add('is-visible'))
    }

    const revealObserver = reducedMotion
      ? null
      : new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible')
                revealObserver?.unobserve(entry.target)
              }
            })
          },
          { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
        )

    revealElements.forEach(element => revealObserver?.observe(element))

    const handleScroll = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(available > 0 ? Math.min(100, (window.scrollY / available) * 100) : 0)

      const readingLine = window.scrollY + window.innerHeight * 0.32
      let currentSection = sections[0].id
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element && element.offsetTop <= readingLine) currentSection = section.id
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
        currentSection = sections[sections.length - 1].id
      }
      setActiveSection(currentSection)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      revealObserver?.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <div className="invisible-engineering-page">
      <style>{`
        .invisible-engineering-page {
          --essay-ink: #20242c;
          --essay-muted: #737984;
          --essay-rule: #d8dbe2;
          --essay-paper: #ffffff;
          --essay-wash: #f5f6f8;
          --essay-accent: #4169E1;
          min-height: 100vh;
          background: var(--essay-paper);
          color: var(--essay-ink);
          font-family: Georgia, 'Times New Roman', serif;
          cursor: auto;
        }
        .invisible-engineering-page a { cursor: pointer; }
        .essay-progress {
          position: fixed;
          inset: 0 auto auto 0;
          height: 2px;
          background: var(--essay-accent);
          z-index: 60;
          transition: width 120ms linear;
        }
        .essay-topbar {
          position: relative;
          z-index: 20;
          border-bottom: 1px dotted var(--essay-rule);
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(10px);
        }
        .essay-topbar-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 20px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .essay-back, .essay-date {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: .04em;
          color: var(--essay-muted);
        }
        .essay-back:hover { color: var(--essay-accent); }
        .essay-hero {
          max-width: 900px;
          margin: 0 auto;
          padding: clamp(80px, 13vw, 160px) 28px clamp(96px, 14vw, 180px);
        }
        .essay-kicker, .essay-section-number {
          font-family: 'Press Start 2P', monospace;
          color: var(--essay-accent);
          font-size: 10px;
          letter-spacing: .11em;
          line-height: 1.8;
        }
        .essay-title {
          max-width: 820px;
          margin: 26px 0 22px;
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(34px, 6.5vw, 72px);
          line-height: 1.22;
          letter-spacing: .015em;
          color: var(--essay-ink);
        }
        .essay-dek {
          max-width: 660px;
          font-size: clamp(20px, 2.5vw, 28px);
          line-height: 1.48;
          color: #4b515c;
        }
        .essay-meta {
          margin-top: 36px;
          display: flex;
          gap: 12px;
          align-items: center;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: var(--essay-muted);
        }
        .essay-layout {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 28px;
          display: grid;
          grid-template-columns: 160px minmax(0, 720px);
          gap: clamp(34px, 7vw, 100px);
          justify-content: center;
        }
        .essay-nav {
          position: sticky;
          top: 40px;
          align-self: start;
          padding-top: 12px;
        }
        .essay-nav-label {
          margin-bottom: 20px;
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          color: var(--essay-muted);
        }
        .essay-nav a {
          position: relative;
          display: grid;
          grid-template-columns: 24px 1fr;
          gap: 8px;
          padding: 9px 0;
          border-top: 1px dotted var(--essay-rule);
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          line-height: 1.45;
          color: #9297a1;
          transform: translateX(0);
          transition: color 220ms ease, transform 220ms ease;
        }
        .essay-nav a::before {
          content: '';
          position: absolute;
          left: -14px;
          top: 50%;
          width: 7px;
          height: 1px;
          background: var(--essay-accent);
          opacity: 0;
          transform: scaleX(0);
          transform-origin: right;
          transition: opacity 220ms ease, transform 220ms ease;
        }
        .essay-nav a[aria-current='true'] {
          color: var(--essay-accent);
          transform: translateX(4px);
        }
        .essay-nav a[aria-current='true']::before {
          opacity: 1;
          transform: scaleX(1);
        }
        .essay-section {
          scroll-margin-top: 36px;
          padding: 0 0 clamp(120px, 17vw, 210px);
        }
        .essay-section-header {
          padding-bottom: 22px;
          margin-bottom: 38px;
          border-bottom: 1px dotted var(--essay-rule);
        }
        .essay-section h2 {
          margin-top: 11px;
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(18px, 3vw, 29px);
          line-height: 1.45;
          color: var(--essay-ink);
        }
        .essay-copy p, .essay-copy li {
          font-size: clamp(18px, 2vw, 21px);
          line-height: 1.82;
          color: #303640;
        }
        .essay-copy p { margin: 0 0 28px; }
        .essay-copy strong { color: var(--essay-ink); font-weight: 700; }
        .essay-copy .essay-pull {
          margin: 52px 0;
          padding: 8px 0 8px 28px;
          border-left: 3px solid var(--essay-accent);
          font-size: clamp(25px, 3.5vw, 38px);
          line-height: 1.42;
          color: var(--essay-ink);
        }
        .essay-copy ol {
          margin: 34px 0 40px;
          padding: 0;
          list-style: none;
          counter-reset: advice;
        }
        .essay-copy li {
          counter-increment: advice;
          position: relative;
          padding: 24px 0 24px 58px;
          border-top: 1px dotted var(--essay-rule);
        }
        .essay-copy li:last-child { border-bottom: 1px dotted var(--essay-rule); }
        .essay-copy li::before {
          content: '0' counter(advice);
          position: absolute;
          left: 0;
          top: 30px;
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          color: var(--essay-accent);
        }
        .essay-illustration {
          width: min(900px, calc(100vw - 40px));
          margin: 70px 50% 76px;
          transform: translateX(-50%);
        }
        .essay-diagram {
          padding: clamp(12px, 3vw, 30px);
          border: 1px solid var(--essay-rule);
          background-color: var(--essay-wash);
          background-image:
            linear-gradient(rgba(32,36,44,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(32,36,44,.035) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .essay-raw-svg { width: 100%; }
        .essay-diagram svg {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
          fill: none;
          stroke: var(--essay-ink);
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .essay-diagram text {
          fill: var(--essay-ink);
          stroke: none;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: .06em;
        }
        .essay-diagram .essay-accent { stroke: var(--essay-accent); }
        .essay-diagram .essay-fill { fill: #e6e8ed; }
        .essay-diagram .essay-fill-light { fill: #f0f1f4; }
        .essay-diagram .essay-fade-particles { fill: var(--essay-accent); opacity: .5; }
        .essay-illustration figcaption {
          margin-top: 12px;
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          line-height: 1.6;
          color: var(--essay-muted);
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 700ms ease, transform 700ms ease;
        }
        .essay-illustration.reveal { transform: translate(-50%, 20px); }
        .reveal.is-visible { opacity: 1; transform: translateY(0); }
        .essay-illustration.reveal.is-visible { transform: translate(-50%, 0); }
        .essay-footer {
          margin-top: 20px;
          padding: 52px 0 90px;
          border-top: 1px dotted var(--essay-rule);
          display: flex;
          justify-content: space-between;
          gap: 24px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: var(--essay-muted);
        }
        .essay-footer a { color: var(--essay-accent); }
        @media (max-width: 900px) {
          .essay-layout { grid-template-columns: minmax(0, 720px); }
          .essay-nav { display: none; }
          .essay-illustration { width: min(820px, calc(100vw - 32px)); }
        }
        @media (max-width: 560px) {
          .essay-topbar-inner, .essay-hero, .essay-layout { padding-left: 18px; padding-right: 18px; }
          .essay-title { font-size: 30px; }
          .essay-section { padding-bottom: 110px; }
          .essay-copy p, .essay-copy li { font-size: 17px; line-height: 1.75; }
          .essay-copy .essay-pull { padding-left: 18px; font-size: 24px; }
          .essay-illustration { margin-top: 48px; margin-bottom: 54px; }
          .essay-diagram { padding: 8px; }
          .essay-diagram text { font-size: 8px; }
          .essay-footer { flex-direction: column; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .essay-illustration.reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .essay-illustration.reveal { transform: translateX(-50%); }
          html { scroll-behavior: auto; }
        }
      `}</style>

      <div className="essay-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />

      <header className="essay-topbar">
        <div className="essay-topbar-inner">
          <Link to="/blog" className="essay-back">← WRITINGS</Link>
          <span className="essay-date">AUGUST 2026 · 8 MIN READ</span>
        </div>
      </header>

      <main>
        <header className="essay-hero reveal" data-reveal>
          <p className="essay-kicker">FIELD NOTES / SOFTWARE ENGINEERING</p>
          <h1 className="essay-title">THE JOB BEHIND THE JOB</h1>
          <p className="essay-dek">
            I thought software engineering was about writing software. Then I learned what established companies actually pay engineers to do—and what AI made impossible to ignore.
          </p>
          <p className="essay-meta">
            <span>THOMAS KIDANE</span><span aria-hidden="true">•</span><span>AUGUST 2026</span>
          </p>
        </header>

        <div className="essay-layout">
          <nav className="essay-nav" aria-label="Article sections">
            <p className="essay-nav-label">SECTIONS</p>
            {sections.map(section => (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={activeSection === section.id ? 'true' : undefined}
                onClick={event => {
                  event.preventDefault()
                  scrollToSection(section.id)
                }}
              >
                <span>{section.number}</span><span>{section.label}</span>
              </a>
            ))}
          </nav>

          <article>
            <section id="front-stage" className="essay-section" aria-labelledby="front-stage-heading">
              <header className="essay-section-header reveal" data-reveal>
                <p className="essay-section-number">01 — THE FRONT STAGE</p>
                <h2 id="front-stage-heading">THE JOB ON THE POSTER</h2>
              </header>
              <div className="essay-copy">
                <p className="reveal" data-reveal>
                  Before my first internship, I had a clean picture of software engineering. You found a hard problem, thought carefully, and wrote the code that made the machine do something it could not do before.
                </p>
                <p className="reveal" data-reveal>
                  That was the version on every recruiting page: an engineer at a terminal, building. It was also the version school prepared me for. The assignments had boundaries. The interviews had inputs and outputs. If you were clever enough, the answer eventually turned green.
                </p>
                <Illustration caption="Figure 01 — The job as advertised: the terminal is center stage." >
                  <StageFromAudience />
                </Illustration>
                <p className="reveal" data-reveal>
                  So I arrived ready to prove that I could write good code. I assumed the code would be the work, and everything around it would be administration.
                </p>
                <p className="essay-pull reveal" data-reveal>
                  I had confused the visible part of the job with the valuable part.
                </p>
              </div>
            </section>

            <section id="conversation" className="essay-section" aria-labelledby="conversation-heading">
              <header className="essay-section-header reveal" data-reveal>
                <p className="essay-section-number">02 — THE CONVERSATION</p>
                <h2 id="conversation-heading">THE REVIEW THAT WOULDN’T MOVE</h2>
              </header>
              <div className="essay-copy">
                <p className="reveal" data-reveal>
                  I was trying to get my first code reviews approved. It was going badly, in the specific way that feels like a technical problem but isn’t.
                </p>
                <p className="reveal" data-reveal>A senior engineer pulled me aside.</p>
                <Illustration caption="Figure 02 — The useful conversation happens outside the light." >
                  <StageFromWings />
                </Illustration>
                <p className="reveal" data-reveal>
                  He talked to me about influence without power. I needed to understand what the other person’s objective actually was. He—a senior engineer at a large company, with a title that said he built software—told me that he was in the business of <strong>risk management</strong>.
                </p>
                <p className="reveal" data-reveal>
                  If I understood that was the job, he said, I could go far.
                </p>
                <p className="essay-pull reveal" data-reveal>
                  It hit me like a ton of bricks. Not because the job was somewhat different from what I expected. Because that was the entire job.
                </p>
              </div>
            </section>

            <section id="back-stage" className="essay-section" aria-labelledby="back-stage-heading">
              <header className="essay-section-header reveal" data-reveal>
                <p className="essay-section-number">03 — THE BACK STAGE</p>
                <h2 id="back-stage-heading">WHAT THE COMPANY IS BUYING</h2>
              </header>
              <div className="essay-copy">
                <p className="reveal" data-reveal>Here is what the job actually is at an established company.</p>
                <p className="reveal" data-reveal>
                  You get stakeholder agreement. You write designs that won’t box the company in two years from now. You make decisions that don’t create liabilities—technical, organizational, or financial. You figure out who needs to approve what, and why they would hesitate. You make sure the thing you are building connects to something the business cares about.
                </p>
                <Illustration caption="Figure 03 — Code is the small, legible surface of a much larger system." >
                  <BackStageCrossSection />
                </Illustration>
                <p className="reveal" data-reveal>
                  Writing the code is the last, smallest, easiest part. Sometimes it barely happens.
                </p>
                <p className="reveal" data-reveal>
                  This is not a complaint. It is a description. The engineering is real—it is just that the engineering that matters is mostly judgment, and judgment is invisible from the outside. It does not show up in a repository. It is not what anyone put on the poster.
                </p>
              </div>
            </section>

            <section id="ai-changed" className="essay-section" aria-labelledby="ai-changed-heading">
              <header className="essay-section-header reveal" data-reveal>
                <p className="essay-section-number">04 — WHAT AI CHANGED</p>
                <h2 id="ai-changed-heading">THE CURTAIN CAME DOWN</h2>
              </header>
              <div className="essay-copy">
                <p className="reveal" data-reveal>Seven years ago, the hard part was making the software do the thing.</p>
                <p className="reveal" data-reveal>
                  That part is now close to free. Not entirely. But the boilerplate, the glue, the first draft of a well-specified function, the translation of a clear intent into working code—those went from the bulk of the work to something closer to a formality.
                </p>
                <Illustration caption="Figure 04 — Automation removes the set and exposes the machinery." >
                  <DissolvingStage />
                </Illustration>
                <p className="reveal" data-reveal>
                  The usual framing is that AI is coming for engineers. I think that is the wrong reading. What happened is narrower and stranger:
                </p>
                <p className="essay-pull reveal" data-reveal>
                  AI removed the part of the job that was always the visible part.
                </p>
                <p className="reveal" data-reveal>
                  The front stage—the code, the craft, the thing everyone trained for and interviewed on—got automated first. What remains is the back stage, which was always where the value was and which almost nobody prepared you for. The curtain came down. The machinery is sitting there in full view.
                </p>
              </div>
            </section>

            <section id="what-to-do" className="essay-section" aria-labelledby="what-to-do-heading">
              <header className="essay-section-header reveal" data-reveal>
                <p className="essay-section-number">05 — WHAT TO DO ABOUT IT</p>
                <h2 id="what-to-do-heading">READ THE ORGANIZATION</h2>
              </header>
              <div className="essay-copy">
                <p className="reveal" data-reveal>If you are about to start an internship in this field, here is what I would tell you.</p>
                <p className="reveal" data-reveal>
                  <strong>Figure out the objective—the real one.</strong> Not what the job description says. What does your manager actually care about? What are the stakeholders protecting? Everything else follows from getting this right.
                </p>
                <p className="reveal" data-reveal>
                  Three ways to find out, all of which amount to reading artifacts for intent instead of instruction:
                </p>
                <ol className="reveal" data-reveal>
                  <li>
                    <strong>Read previously approved code reviews.</strong> What got through is a map of what the organization actually accepts. The pattern is the answer.
                  </li>
                  <li>
                    <strong>Read the guidelines and ask why they exist.</strong> Every guideline is there because something went wrong once. The rule is a fossil of a past failure. Find the fear underneath it and you will know what the organization is protecting.
                  </li>
                  <li>
                    <strong>Ask how your work ties back to the problem statement—and to the bottom line.</strong> Nobody will ask you to do this explicitly. Everyone is evaluating you on it.
                  </li>
                </ol>
                <p className="reveal" data-reveal>
                  Expect that you will not be solving LeetCode problems. Past the interview, the skill that got you in stops being the skill that matters. This surprises almost everyone.
                </p>
                <Illustration caption="Figure 05 — The work still branches; be precise about which branch you want." >
                  <DivergingPaths />
                </Illustration>
                <p className="reveal" data-reveal>
                  And if the job you actually wanted was the one on the poster—building the primitives rather than using them, the hard technical core, the thing I thought I was signing up for—it still exists. It just moved. It is at the frontier labs now, and the door there is narrower than the one you just walked through.
                </p>
                <p className="essay-pull reveal" data-reveal>If that is the job you want, start preparing to jump.</p>
              </div>
            </section>

            <footer className="essay-footer">
              <span>© 2026 THOMAS KIDANE</span>
              <Link to="/blog">MORE WRITINGS →</Link>
            </footer>
          </article>
        </div>
      </main>
    </div>
  )
}
