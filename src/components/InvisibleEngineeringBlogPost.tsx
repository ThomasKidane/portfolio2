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
        A polished theatre stage fragments from left to right, revealing the organized gears, pulleys, counterweights, rails, and approval gates behind it.
      </desc>
      <path d="M42 52h816v420H42zM42 116h816M42 424h816" />
      <path d="M62 70h776M62 98h776" strokeDasharray="4 7" opacity=".45" />

      <g id="dissolving-front-stage">
        <path className="essay-fill" d="M62 116h238v308H62z" />
        <path d="M62 116h238v308H62z" />
        <path d="M62 116c66 42 112 90 142 144v164H62zM300 116c-48 43-79 90-96 144" />
        <path d="M82 116v308M103 116v308M124 116v308" opacity=".45" />
        <path className="essay-fill-light" d="M158 128h78l43 228H116z" />
        <path d="M177 330h89M190 330l-9 48M252 330l9 48" />
        <rect x="194" y="278" width="55" height="40" rx="2" />
        <path className="essay-accent" d="M203 290h17M203 298h36M203 306h27" />
        <circle cx="222" cy="238" r="14" />
        <path d="M222 252v50M222 263l-28 22M222 263l29 20" />
        <path d="M158 424v-25M188 424v-38M218 424v-20M248 424v-33" />
      </g>

      <g id="dissolving-transition">
        <path d="M300 116v308" strokeDasharray="5 7" opacity=".35" />
        <path d="M318 132l20 15-17 18zM350 171l25 8-14 21zM309 220l19 10-16 14zM375 238l23 17-25 7zM323 296l27 12-19 20zM385 337l20 8-16 18zM344 382l24 17-27 8z" opacity=".55" />
        <g className="essay-fade-particles" stroke="none">
          <circle cx="319" cy="179" r="3" /><circle cx="347" cy="135" r="2" /><circle cx="382" cy="154" r="3" />
          <circle cx="342" cy="242" r="2" /><circle cx="394" cy="211" r="4" /><circle cx="365" cy="285" r="3" />
          <circle cx="312" cy="346" r="4" /><circle cx="374" cy="372" r="2" /><circle cx="410" cy="318" r="3" />
          <circle cx="407" cy="183" r="2" /><circle cx="423" cy="258" r="3" /><circle cx="401" cy="399" r="2" />
        </g>
        <path className="essay-accent" d="M319 270h101M403 258l17 12-17 12" />
      </g>

      <g id="revealed-machinery">
        <path className="essay-fill-light" d="M432 116h406v308H432z" />
        <path d="M432 116h406v308H432zM456 144h358v248H456z" />
        <path d="M456 184h358M456 344h358M512 144v248M705 144v248" strokeDasharray="4 6" opacity=".4" />

        <g id="approval-gates">
          <rect x="474" y="211" width="70" height="39" rx="3" />
          <rect x="474" y="270" width="70" height="39" rx="3" />
          <path className="essay-accent" d="M486 230h45M486 289h45M509 250v20" />
          <circle cx="509" cy="230" r="4" />
          <circle cx="509" cy="289" r="4" />
        </g>

        <g id="large-gear" className="essay-accent">
          <circle cx="629" cy="235" r="56" />
          <circle cx="629" cy="235" r="19" />
          <path d="M629 162v30M629 278v30M556 235h30M672 235h30M578 184l21 21M659 265l21 21M680 184l-21 21M599 265l-21 21" />
        </g>
        <g id="small-gear">
          <circle cx="706" cy="306" r="37" />
          <circle cx="706" cy="306" r="12" />
          <path d="M706 257v19M706 336v19M657 306h19M736 306h19M672 272l14 14M726 326l14 14M740 272l-14 14M686 326l-14 14" />
        </g>
        <path className="essay-accent" d="M672 270l12 12M663 279l12 12" />

        <g id="pulley-system">
          <circle cx="755" cy="171" r="17" />
          <circle cx="791" cy="171" r="17" />
          <path d="M755 116v38M791 116v38M738 171h70M755 188v84M791 188v122" />
          <path className="essay-fill" d="M744 272h22l-4 45h-14zM779 310h24l-4 52h-16z" />
        </g>

        <path d="M544 230h29M685 235h22M544 289h91M635 289l35 17M743 306h36" />
        <path d="M472 370h216M472 378h216M489 362v24M531 362v24M573 362v24M615 362v24M657 362v24" />
        <circle cx="489" cy="374" r="4" /><circle cx="573" cy="374" r="4" /><circle cx="657" cy="374" r="4" />
      </g>

      <path className="essay-accent" d="M432 98h406" />
    </svg>
  )
}

function DivergingPaths() {
  return (
    <svg viewBox="0 0 900 560" role="img" aria-labelledby="paths-title paths-description">
      <title id="paths-title">Two paths through software engineering</title>
      <desc id="paths-description">
        An engineer deliberately chooses between a broad route into an established organizational system and a narrower route toward a frontier research laboratory.
      </desc>
      <path d="M42 470h816M42 478h816" />
      <path d="M450 474V389C383 332 297 302 156 270M450 389c73-64 168-92 303-119" />
      <path d="M420 474v-73C356 354 270 330 149 300M480 474v-73c69-54 159-78 280-101" strokeDasharray="6 7" opacity=".55" />

      <g id="decision-point">
        <circle className="essay-fill-light" cx="450" cy="389" r="54" />
        <circle cx="450" cy="353" r="19" />
        <path d="M450 372v61M450 386l-34 28M450 386l34 28M437 433l-17 38M463 433l17 38" />
        <path className="essay-accent" d="M401 334l-25-21M499 334l25-21M376 313h12M512 313h12" />
      </g>

      <g id="established-system">
        <path className="essay-fill" d="M58 78h330v193H58z" />
        <path d="M58 271V78h330v193M82 78V52h282v26M103 271V119h82v152M210 271V119h72v152M307 271V119h57v152" />
        <path d="M103 153h82M103 201h82M210 166h72M210 220h72M307 148h57M307 196h57" />
        <circle cx="132" cy="136" r="7" /><circle cx="159" cy="136" r="7" />
        <circle cx="232" cy="147" r="7" /><circle cx="260" cy="147" r="7" />
        <circle cx="328" cy="132" r="7" /><circle cx="348" cy="132" r="7" />
        <path d="M139 136h13M166 136l66 11M239 147h14M267 147l61-15M132 143v58M232 154v66M328 139v57" strokeDasharray="3 5" />
        <path className="essay-accent" d="M87 97h272M132 201h100M232 220h96" />
        <rect x="119" y="228" width="49" height="43" />
        <rect x="224" y="235" width="44" height="36" />
        <rect x="316" y="224" width="37" height="47" />
      </g>

      <g id="frontier-laboratory">
        <path className="essay-fill-light" d="M661 159h190v111H661z" />
        <path d="M661 270V159h190v111M680 159l28-45h94l31 45M683 270v-69h54v69M760 270v-69h68" />
        <path d="M697 201h25M697 213h25M775 213h37M775 225h25" />
        <circle cx="782" cy="184" r="12" />
        <path d="M782 172v-34M770 145l12-12 12 12M737 236h23M749 236v-27M749 209l20-17" />
        <path className="essay-accent" d="M782 133V76M770 88l12-12 12 12M782 76l30-28M782 76l-18-35" />
        <circle className="essay-accent" cx="812" cy="48" r="3" />
        <circle className="essay-accent" cx="764" cy="41" r="3" />
        <path d="M640 270h226M648 279h210" strokeDasharray="5 6" />
      </g>

      <g id="route-markers">
        <circle className="essay-fill-light" cx="337" cy="344" r="10" />
        <circle className="essay-fill-light" cx="270" cy="316" r="10" />
        <circle className="essay-fill-light" cx="563" cy="344" r="10" />
        <circle className="essay-fill-light" cx="635" cy="316" r="10" />
        <path className="essay-accent" d="M337 344h-67M563 344h72" />
        <path d="M270 306v20M635 306v20" />
      </g>

      <path d="M450 502v-18M442 492l8-8 8 8" />
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
