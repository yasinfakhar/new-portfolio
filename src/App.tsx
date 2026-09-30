import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

const PALE = '#D7E2EA'

type FadeInProps = { children: ReactNode; delay?: number; duration?: number; x?: number; y?: number; as?: ElementType; className?: string }
function FadeIn({ children, delay = 0, duration = .7, x = 0, y = 30, as = 'div', className = '' }: FadeInProps) {
  const Component = motion.create(as)
  return <Component className={className} initial={{ opacity: 0, x, y }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, margin: '50px', amount: 0 }} transition={{ delay, duration, ease: [.25, .1, .25, 1] }}>{children}</Component>
}

function ContactButton() {
  return <a href="mailto:hello@jack.studio" className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-xs font-medium uppercase tracking-[.2em] text-white outline outline-2 outline-offset-[-3px] outline-white transition-transform duration-300 hover:scale-105 sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base" style={{ background: 'linear-gradient(123deg,#18011F 7%,#B600A8 37%,#7621B0 72%,#BE4C00 100%)', boxShadow: '0 4px 4px rgba(181,1,167,.25), 4px 4px 12px #7721B1 inset' }}>Contact me <ArrowUpRight size={18} strokeWidth={2.2} /></a>
}

function CursorAvatar() {
  const ref = useRef<HTMLDivElement>(null)
  const leftEyeRef = useRef<HTMLSpanElement>(null)
  const rightEyeRef = useRef<HTMLSpanElement>(null)
  const leftIrisRef = useRef<HTMLSpanElement>(null)
  const rightIrisRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const pointer = { x: 0, y: 0, active: false, lastMove: 0 }
    const current = [{ x: 0, y: 0 }, { x: 0, y: 0 }]
    const target = [{ x: 0, y: 0 }, { x: 0, y: 0 }]
    const eyes = [leftEyeRef, rightEyeRef]
    const irises = [leftIrisRef, rightIrisRef]
    let frame = 0

    // Fine-tuning controls: interpolation speed, ignored target jitter, and idle delay.
    const SMOOTHING = .12
    const DEAD_ZONE = .22
    const IDLE_DELAY = 1200

    const move = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
      pointer.lastMove = performance.now()
    }
    const leave = () => { pointer.active = false }

    const animate = (time: number) => {
      const shouldTrack = pointer.active && time - pointer.lastMove < IDLE_DELAY

      eyes.forEach((eyeRef, index) => {
        const eye = eyeRef.current
        const iris = irises[index].current
        if (!eye || !iris) return

        let nextX = 0
        let nextY = 0
        if (shouldTrack) {
          const eyeBox = eye.getBoundingClientRect()
          const irisBox = iris.getBoundingClientRect()
          const eyeCenterX = eyeBox.left + eyeBox.width / 2
          const eyeCenterY = eyeBox.top + eyeBox.height / 2
          const dx = pointer.x - eyeCenterX
          const dy = pointer.y - eyeCenterY
          const distance = Math.hypot(dx, dy)

          if (distance > 0) {
            const angle = Math.atan2(dy, dx)
            // Derive safe travel from the real socket/iris dimensions. The
            // multipliers retain visible sclera and avoid eyelid overlap.
            const maxX = Math.max(0, (eyeBox.width - irisBox.width) / 2 * .66)
            const maxY = Math.max(0, (eyeBox.height - irisBox.height) / 2 * .62)
            const saturation = 1 - Math.exp(-distance / Math.max(eyeBox.width * 3.8, 1))
            nextX = Math.cos(angle) * maxX * saturation
            nextY = Math.sin(angle) * maxY * saturation
          }
        }

        if (Math.hypot(nextX - target[index].x, nextY - target[index].y) > DEAD_ZONE || !shouldTrack) {
          target[index].x = nextX
          target[index].y = nextY
        }
        current[index].x += (target[index].x - current[index].x) * SMOOTHING
        current[index].y += (target[index].y - current[index].y) * SMOOTHING
        iris.style.transform = `translate3d(${current[index].x.toFixed(3)}px,${current[index].y.toFixed(3)}px,0)`
      })

      frame = requestAnimationFrame(animate)
    }

    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    frame = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
    }
  }, [])
  const eye = (left: number, eyeRef: typeof leftEyeRef, irisRef: typeof leftIrisRef) => {
    return <span ref={eyeRef} aria-hidden="true" className="absolute top-[48.3%] z-[2] flex h-[6.65%] w-[10.3%] items-center justify-center overflow-hidden [clip-path:ellipse(49%_45%_at_50%_50%)]" style={{ left: `${left}%` }}>
      <span ref={irisRef} className="aspect-square w-[55.8%] shrink-0 rounded-full border border-[#3a1409]/60 bg-[radial-gradient(circle_at_62%_28%,white_0_4%,transparent_5%),radial-gradient(circle_at_50%_48%,#080504_0_30%,#2a0d05_31%_38%,#8a3e16_40%_67%,#3a1208_76%_100%)] shadow-[inset_0_0_5px_rgba(0,0,0,.75),0_1px_2px_rgba(0,0,0,.3)]" style={{ willChange: 'transform' }} />
    </span>
  }
  return <div ref={ref} className="relative w-full select-none" aria-label="Yasin's 3D avatar looking toward the cursor">
    <img src="/avatar-eye-base.png" alt="Yasin, 3D creator" className="h-auto w-full drop-shadow-[0_28px_50px_rgba(0,0,0,.4)]" />
    {eye(35.35, leftEyeRef, leftIrisRef)}{eye(55.25, rightEyeRef, rightIrisRef)}
  </div>
}

function HeroSection() {
  return <section className="relative flex h-screen min-h-[620px] flex-col overflow-x-clip px-6 md:px-10">
    <FadeIn y={-20} className="relative z-30">
      <nav aria-label="Main navigation" className="flex justify-between pt-6 text-sm font-medium uppercase tracking-wider text-[#D7E2EA] md:pt-8 md:text-lg lg:text-[1.4rem]">
        {['About', 'Price', 'Projects', 'Contact'].map((item) => <a key={item} href={item === 'Price' ? '#services' : `#${item.toLowerCase()}`} className="transition-opacity duration-200 hover:opacity-70">{item}</a>)}
      </nav>
    </FadeIn>
    <FadeIn delay={.15} y={40} className="relative z-20 mt-6 overflow-hidden sm:mt-4 md:-mt-5">
      <h1 className="hero-heading w-full whitespace-nowrap text-center text-[12vw] font-black uppercase leading-none tracking-tight sm:text-[11.5vw] md:text-[11vw] lg:text-[10.5vw]">Hi, i&apos;m yasin</h1>
    </FadeIn>
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center pt-16 sm:pt-20">
      <FadeIn delay={.6} y={30} className="pointer-events-auto w-[340px] sm:w-[460px] md:w-[560px] lg:w-[640px] xl:w-[700px]"><CursorAvatar /></FadeIn>
    </div>
    <div className="relative z-20 mt-auto flex items-end justify-between pb-7 sm:pb-8 md:pb-10">
      <FadeIn delay={.35} y={20}><p className="max-w-[160px] text-[clamp(.75rem,1.4vw,1.5rem)] font-light uppercase leading-snug tracking-wide sm:max-w-[220px] md:max-w-[260px]">An AI Enginner with more than 5 experience</p></FadeIn>
      <FadeIn delay={.5} y={20}><ContactButton /></FadeIn>
    </div>
  </section>
}

const gifs = [
  'hero-space-voyage-preview-eECLH3Yc.gif','hero-codenest-preview-Cgppc2qV.gif','hero-vex-ventures-preview-BczMFIiw.gif','hero-stellar-ai-v2-preview-DjvxjG3C.gif','hero-asme-preview-B_nGDnTP.gif','hero-transform-data-preview-Cx5OU29N.gif','hero-vitara-preview-Cjz2QYyU.gif','hero-terra-preview-BFjrCr7T.gif','hero-skyelite-preview-DHaZIgUv.gif','hero-aethera-preview-DknSlcTa.gif','hero-designpro-preview-D8c5_een.gif','hero-stellar-ai-preview-D3HL6bw1.gif','hero-xportfolio-preview-D4A8maiC.gif','hero-orbit-web3-preview-BXt4OttD.gif','hero-nexora-preview-cx5HmUgo.gif','hero-evr-ventures-preview-DZxeVFEX.gif','hero-planet-orbit-preview-DWAP8Z1P.gif','hero-new-era-preview-CocuDUm9.gif','hero-wealth-preview-B70idl_u.gif','hero-luminex-preview-CxOP7ce6.gif','hero-celestia-preview-0yO3jXO8.gif'
].map(x => `https://motionsites.ai/assets/${x}`)

function MarqueeRow({ images, offset, reverse = false }: { images: string[]; offset: number; reverse?: boolean }) {
  const all = [...images, ...images, ...images]
  const x = reverse ? -(offset - 200) - images.length * 150 : offset - 200 - images.length * 300
  return <div className="flex w-max gap-3" style={{ transform: `translate3d(${x}px,0,0)`, willChange: 'transform' }}>{all.map((src, i) => <img key={`${src}-${i}`} src={src} alt="Selected 3D and motion design work" loading="lazy" className="h-[180px] w-[280px] shrink-0 rounded-2xl object-cover sm:h-[220px] sm:w-[340px] md:h-[270px] md:w-[420px]" />)}</div>
}

function MarqueeSection() {
  const ref = useRef<HTMLElement>(null); const [offset, setOffset] = useState(0)
  useEffect(() => { const update = () => { if (ref.current) setOffset((window.scrollY - ref.current.offsetTop + window.innerHeight) * .3) }; update(); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update) }, [])
  return <section ref={ref} aria-label="Project reel" className="overflow-hidden bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40"><div className="flex flex-col gap-3"><MarqueeRow images={gifs.slice(0,11)} offset={offset} /><MarqueeRow images={gifs.slice(11)} offset={offset} reverse /></div></section>
}

function AnimatedText({ text }: { text: string }) {
  const target = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target, offset: ['start 0.8', 'end 0.2'] })
  return <p ref={target} className="max-w-[560px] text-center text-[clamp(1rem,2vw,1.35rem)] font-medium leading-relaxed text-[#D7E2EA]" aria-label={text}>{text.split('').map((char, i, arr) => <AnimatedChar key={i} char={char} index={i} total={arr.length} progress={scrollYProgress} />)}</p>
}
function AnimatedChar({ char, index, total, progress }: { char: string; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total * .8; const opacity = useTransform(progress, [start, Math.min(start + .2, 1)], [.2, 1])
  return <span className="relative inline-block"><span className="invisible">{char === ' ' ? '\u00a0' : char}</span><motion.span aria-hidden="true" className="absolute inset-0" style={{ opacity }}>{char === ' ' ? '\u00a0' : char}</motion.span></span>
}

const decor = [
  ['https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png','Moon sculpture','left-[1%] top-[4%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]',.1,-80],
  ['https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png','Abstract sculpture','bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]',.25,-80],
  ['https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png','Lego sculpture','right-[1%] top-[4%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]',.15,80],
  ['https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png','Chrome sculpture','bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]',.3,80],
] as const

function AboutSection() { const copy = "With more than five years of experience in design, i focus on branding, web design, and user experience, i truly enjoy working with businesses that aim to stand out and present their best image. Let's build something incredible together!"; return <section id="about" className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-20 sm:px-8 md:px-10">{decor.map(([src,alt,classes,delay,x]) => <FadeIn key={src} delay={Math.max(delay,0)} duration={.9} x={x} y={0} className={`pointer-events-none absolute opacity-70 sm:opacity-100 ${classes}`}><img src={src} alt={alt} loading="lazy" className="w-full" /></FadeIn>)}<div className="relative z-10 flex flex-col items-center gap-10 sm:gap-14 md:gap-16"><FadeIn y={40}><h2 className="hero-heading text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight">About me</h2></FadeIn><div className="flex flex-col items-center gap-16 sm:gap-20 md:gap-24"><AnimatedText text={copy} /><FadeIn><ContactButton /></FadeIn></div></div></section> }

const services = [
  ['3D Modeling','Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations.'],
  ['Rendering','High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life.'],
  ['Motion Design','Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences.'],
  ['Branding','Crafting cohesive visual identities — from logos to full brand systems — that communicate a clear and memorable presence.'],
  ['Web Design','Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience.'],
]
function ServicesSection() { return <section id="services" className="rounded-t-[40px] bg-white px-5 py-20 text-[#0C0C0C] sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"><FadeIn><h2 className="mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28">Services</h2></FadeIn><div className="mx-auto max-w-5xl">{services.map(([name,desc],i) => <FadeIn key={name} delay={i*.1}><article className="grid grid-cols-[72px_1fr] items-start gap-5 border-t border-black/15 py-8 last:border-b sm:grid-cols-[130px_1fr] sm:gap-8 sm:py-10 md:grid-cols-[220px_1fr] md:py-12"><span className="text-[clamp(3rem,10vw,140px)] font-black leading-[.8]">{String(i+1).padStart(2,'0')}</span><div><h3 className="text-[clamp(1rem,2.2vw,2.1rem)] font-medium uppercase">{name}</h3><p className="mt-3 max-w-2xl text-[clamp(.85rem,1.6vw,1.25rem)] font-light leading-relaxed opacity-60">{desc}</p></div></article></FadeIn>)}</div></section> }

const projects = [
  ['Nextlevel Studio','Client',['hf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png','hf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png','hf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png']],
  ['Aura Brand Identity','Personal',['hf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png','hf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png','hf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png']],
  ['Solaris Digital','Client',['hf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png','hf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png','hf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png']],
] as const
const imageUrl = (file: string) => `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/${file}`)}&w=1280&q=85`

function ProjectCard({ project, index }: { project: typeof projects[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null); const { scrollYProgress } = useScroll({ target: ref, offset: ['start start','end start'] }); const targetScale = 1 - (projects.length - 1 - index) * .03; const scale = useTransform(scrollYProgress,[0,1],[1,targetScale]); const [name,category,images] = project
  return <div ref={ref} className="relative h-[85vh]"><motion.article style={{ scale, top: `calc(6rem + ${index*28}px)` }} className="sticky flex h-[72vh] min-h-[560px] flex-col overflow-hidden rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:rounded-[50px] sm:p-6 md:h-[75vh] md:rounded-[60px] md:p-8"><header className="mb-4 grid shrink-0 grid-cols-[auto_1fr] items-end gap-x-5 gap-y-2 sm:grid-cols-[auto_1fr_auto] md:mb-7"><span className="row-span-2 text-[clamp(3rem,8vw,110px)] font-black leading-[.8]">{String(index+1).padStart(2,'0')}</span><p className="text-xs font-light uppercase tracking-[.2em] opacity-60 sm:text-sm">{category}</p><a href="#contact" className="hidden items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-8 py-3 text-sm font-medium uppercase tracking-widest transition-colors hover:bg-[#D7E2EA]/10 sm:row-span-2 sm:flex">Live project <ArrowUpRight size={18}/></a><h3 className="text-[clamp(1.25rem,3vw,2.5rem)] font-medium uppercase leading-none">{name}</h3></header><div className="grid min-h-0 flex-1 grid-cols-[40%_60%] gap-2 sm:gap-3"><div className="grid min-w-0 grid-rows-[.8fr_1.2fr] gap-2 sm:gap-3">{images.slice(0,2).map((img,i)=><img key={img} src={imageUrl(img)} alt={`${name} artwork ${i+1}`} loading="lazy" className="h-full min-h-0 w-full rounded-[25px] object-cover sm:rounded-[40px] md:rounded-[50px]" />)}</div><img src={imageUrl(images[2])} alt={`${name} hero artwork`} loading="lazy" className="h-full min-h-0 min-w-0 w-full rounded-[25px] object-cover sm:rounded-[40px] md:rounded-[50px]" /></div></motion.article></div>
}
function ProjectsSection() { return <section id="projects" className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-5 pb-24 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pt-28"><FadeIn><h2 className="hero-heading mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight">Project</h2></FadeIn><div className="mx-auto max-w-[1400px]">{projects.map((p,i)=><ProjectCard key={p[0]} project={p} index={i}/>)}</div><footer id="contact" className="flex min-h-[50vh] flex-col items-center justify-center gap-8 py-24 text-center"><p className="text-sm uppercase tracking-[.25em] opacity-60">Have a project in mind?</p><h2 className="hero-heading text-[clamp(3.5rem,10vw,9rem)] font-black uppercase leading-[.85]">Let&apos;s create<br/>something unreal.</h2><ContactButton /><p className="mt-12 text-xs uppercase tracking-widest opacity-40">© 2026 Yasin Studio</p></footer></section> }

export default function App() { return <main className="overflow-x-clip bg-[#0C0C0C]"><HeroSection/><MarqueeSection/><AboutSection/><ServicesSection/><ProjectsSection/></main> }
