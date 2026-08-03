import Image from 'next/image';
import HomeHeroCtas from '@/components/HomeHeroCtas';
import HomeBottomCta from '@/components/HomeBottomCta';

const HERO_IMAGE = '/hero.jpg';

export default function Home() {
    return (
        <div className="flex flex-col">
            <section className="relative flex min-h-[calc(100vh-4rem)] items-end overflow-hidden">
                <Image
                    src={HERO_IMAGE}
                    alt="Mountain peaks above the clouds"
                    fill
                    priority
                    className="hero-kenburns object-cover object-center"
                    sizes="100vw"
                />
                <div
                    className="absolute inset-0 bg-gradient-to-t from-[rgb(13_40_30_/0.92)] via-[rgb(13_40_30_/0.45)] to-[rgb(13_40_30_/0.2)]"
                    aria-hidden
                />
                <div
                    className="hero-mist absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgb(13_40_30_/0.35)] to-transparent"
                    aria-hidden
                />

                <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-20">
                    <p className="anim-rise mb-3 font-[family-name:var(--font-display)] text-6xl font-semibold tracking-tight text-white sm:text-7xl md:text-8xl">
                        TrekPal
                    </p>
                    <h1 className="anim-rise-delay max-w-lg text-xl font-medium tracking-tight text-white/95 sm:text-2xl md:text-3xl">
                        Your buddy for the trail — prepared, calm, ready.
                    </h1>
                    <p className="anim-rise-late mt-4 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
                        Pack lists, risk checks, weather watch-outs, and trusted guides so Nepal
                        treks feel clearer from the first step.
                    </p>
                    <div className="anim-rise-late">
                        <HomeHeroCtas />
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden border-t border-[var(--border)] px-4 py-24 sm:px-6">
                <div
                    className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-[var(--accent-soft)] blur-3xl"
                    aria-hidden
                />
                <div className="relative mx-auto max-w-5xl">
                    <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                        How TrekPal walks with you
                    </p>
                    <h2 className="mt-3 text-center font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
                        Less guesswork. More trail confidence.
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-center text-[var(--muted)]">
                        Built for Himalayan prep — not generic packing apps.
                    </p>
                    <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
                        <li className="anim-rise">
                            <p className="font-[family-name:var(--font-display)] text-4xl text-[var(--accent)]">
                                01
                            </p>
                            <h3 className="mt-4 text-xl font-semibold">Choose the route</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                                Browse Nepal treks with seasons and highlights, then jump straight
                                into planning.
                            </p>
                        </li>
                        <li className="anim-rise-delay">
                            <p className="font-[family-name:var(--font-display)] text-4xl text-[var(--accent)]">
                                02
                            </p>
                            <h3 className="mt-4 text-xl font-semibold">Read the conditions</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                                Risk bands, weather alerts, and honest sources — so decisions stay
                                grounded.
                            </p>
                        </li>
                        <li className="anim-rise-late">
                            <p className="font-[family-name:var(--font-display)] text-4xl text-[var(--accent)]">
                                03
                            </p>
                            <h3 className="mt-4 text-xl font-semibold">Pack with a buddy</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                                Get a Nepal-aware checklist with rent tips, then save it for the
                                trail.
                            </p>
                        </li>
                    </ol>
                </div>
            </section>

            <section className="relative overflow-hidden px-4 py-28 sm:px-6">
                <Image
                    src={HERO_IMAGE}
                    alt=""
                    fill
                    className="object-cover object-[center_40%]"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-[rgb(13_40_30_/0.82)]" aria-hidden />
                <HomeBottomCta />
            </section>
        </div>
    );
}
