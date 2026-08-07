import Image from 'next/image';
import Link from 'next/link';
import HomeHeroCtas from '@/components/HomeHeroCtas';
import HomeBottomCta from '@/components/HomeBottomCta';
import Reveal, { Stagger, StaggerItem } from '@/components/Reveal';

const HERO_IMAGE = '/hero.jpg';

const DESTINATIONS = [
    { name: 'Everest region', note: 'High passes & base camps' },
    { name: 'Annapurna', note: 'Circuits & sanctuary' },
    { name: 'Langtang', note: 'Valley trails near Kathmandu' },
];

export default function Home() {
    return (
        <div className="flex flex-col">
            <section className="relative flex min-h-[calc(100vh-4.25rem)] items-end overflow-hidden">
                <Image
                    src={HERO_IMAGE}
                    alt="Mountain peaks above the clouds"
                    fill
                    priority
                    className="hero-kenburns object-cover object-center"
                    sizes="100vw"
                />
                <div
                    className="absolute inset-0 bg-gradient-to-t from-[rgb(8_30_22_/0.94)] via-[rgb(10_51_36_/0.5)] to-[rgb(10_51_36_/0.18)]"
                    aria-hidden
                />
                <div
                    className="hero-mist absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[rgb(8_30_22_/0.45)] to-transparent"
                    aria-hidden
                />
                <div
                    className="hero-glow pointer-events-none absolute left-1/2 top-1/4 h-64 w-[28rem] -translate-x-1/2 rounded-full bg-[rgb(180_220_200_/0.12)] blur-3xl"
                    aria-hidden
                />
                <div
                    className="ambient-orb left-[12%] top-[30%] h-40 w-40 bg-[rgb(31_122_88_/0.25)]"
                    aria-hidden
                />
                <div
                    className="ambient-orb ambient-orb-slow right-[8%] top-[45%] h-52 w-52 bg-[rgb(22_90_118_/0.18)]"
                    aria-hidden
                />

                <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-28 sm:pt-24">
                    <p className="anim-rise mb-2 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-white/60">
                        Nepal · Your destination buddy
                    </p>
                    <p className="anim-rise font-[family-name:var(--font-display)] text-[2.75rem] font-semibold leading-none tracking-tight text-white sm:text-7xl md:text-[6.5rem] md:leading-[0.95]">
                        TrekPal
                    </p>
                    <h1 className="anim-rise-delay mt-5 max-w-xl text-lg font-medium leading-snug tracking-tight text-white/92 sm:text-2xl md:text-3xl">
                        Prepare like you already know the ridge.
                    </h1>
                    <p className="anim-rise-late mt-4 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
                        Packing lists, risk bands, weather watch-outs, and trusted guides — calm
                        Himalayan prep in one place.
                    </p>
                    <div className="anim-rise-late">
                        <HomeHeroCtas />
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden border-b border-white/10 bg-[var(--accent-deep)] px-4 py-5 sm:px-6">
                <div className="aurora-band" aria-hidden />
                <div className="relative mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/50">
                        Destinations we plan for
                    </p>
                    <div className="flex flex-wrap gap-x-8 gap-y-2">
                        {DESTINATIONS.map((d) => (
                            <div key={d.name} className="text-sm">
                                <span className="font-semibold text-white">{d.name}</span>
                                <span className="ml-2 text-white/50">{d.note}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden px-4 py-28 sm:px-6">
                <div
                    className="ambient-orb -right-24 top-16 h-72 w-72 bg-[var(--accent-soft)]"
                    aria-hidden
                />
                <div
                    className="ambient-orb ambient-orb-slow -left-16 bottom-10 h-56 w-56 bg-[rgb(22_90_118_/0.12)]"
                    aria-hidden
                />
                <div className="relative mx-auto max-w-5xl">
                    <Reveal>
                        <p className="eyebrow text-center">How TrekPal walks with you</p>
                        <h2 className="display-title mt-4 text-center text-3xl text-[var(--foreground)] sm:text-5xl">
                            Less guesswork.
                            <br className="hidden sm:block" /> More trail confidence.
                        </h2>
                        <p className="mx-auto mt-5 max-w-lg text-center text-[var(--muted)]">
                            Built for Himalayan prep — not generic packing apps.
                        </p>
                    </Reveal>

                    <div className="divider-trail mx-auto mt-14 max-w-md" />

                    <Stagger className="mt-14 grid gap-14 md:grid-cols-3 md:gap-10">
                        {[
                            {
                                n: '01',
                                title: 'Choose the route',
                                body: 'Browse Nepal treks with seasons and highlights, then jump straight into planning.',
                            },
                            {
                                n: '02',
                                title: 'Read the conditions',
                                body: 'Risk bands, weather alerts, and honest sources — so decisions stay grounded.',
                            },
                            {
                                n: '03',
                                title: 'Pack with a buddy',
                                body: 'Get a Nepal-aware checklist with rent tips, then save it for the trail.',
                            },
                        ].map((step) => (
                            <StaggerItem key={step.n}>
                                <p className="font-[family-name:var(--font-display)] text-5xl text-[var(--accent)]/80">
                                    {step.n}
                                </p>
                                <h3 className="mt-5 text-xl font-semibold tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                                    {step.body}
                                </p>
                            </StaggerItem>
                        ))}
                    </Stagger>

                    <Reveal className="mt-16 text-center" delay={0.15}>
                        <Link
                            href="/treks"
                            className="text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
                        >
                            Explore the trek catalog →
                        </Link>
                    </Reveal>
                </div>
            </section>

            <section className="relative overflow-hidden px-4 py-32 sm:px-6">
                <Image
                    src={HERO_IMAGE}
                    alt=""
                    fill
                    className="object-cover object-[center_40%]"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-[rgb(8_30_22_/0.84)]" aria-hidden />
                <Reveal>
                    <HomeBottomCta />
                </Reveal>
            </section>
        </div>
    );
}
