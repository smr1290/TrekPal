import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';

// Landscape stock photo in frontend/public/hero.jpg (wide — fits the hero banner)
const HERO_IMAGE = '/hero.jpg';
const CTA_IMAGE = '/hero.jpg';

export default function Home() {
    return (
        <div className="flex flex-col">
            <section className="relative flex min-h-[calc(100vh-4rem)] items-end overflow-hidden sm:items-center">
                <Image
                    src={HERO_IMAGE}
                    alt="Mountain peaks above the clouds"
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="100vw"
                />
                <div
                    className="absolute inset-0 bg-gradient-to-t from-[rgb(15_28_24_/0.88)] via-[rgb(15_28_24_/0.45)] to-[rgb(15_28_24_/0.25)]"
                    aria-hidden
                />

                <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-20">
                    <p className="anim-rise mb-4 font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl">
                        TrekPal
                    </p>
                    <h1 className="anim-rise-delay max-w-xl text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                        Your companion for the trail ahead.
                    </h1>
                    <p className="anim-rise-delay mt-4 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
                        Clear gear lists and risk checks so you walk in prepared — not guessing.
                    </p>
                    <div className="anim-rise-delay mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link href="/signup">
                            <Button size="lg" className="min-w-44">
                                Start packing
                            </Button>
                        </Link>
                        <Link href="/treks">
                            <Button
                                size="lg"
                                variant="outline"
                                className="min-w-44 border-white/40 bg-white/10 text-white hover:bg-white/20"
                            >
                                Explore treks
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-20 sm:px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--foreground)]">
                        Built for the trek, not the spreadsheet
                    </h2>
                    <p className="mx-auto mt-3 max-w-lg text-center text-[var(--muted)]">
                        From route context to a packing list you can trust.
                    </p>
                    <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
                        <li>
                            <p className="text-sm font-semibold text-[var(--accent)]">01 · Route</p>
                            <h3 className="mt-2 text-lg font-semibold">Set the trail</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                                Altitude, season, and duration shape what you need on your back.
                            </p>
                        </li>
                        <li>
                            <p className="text-sm font-semibold text-[var(--accent)]">02 · Risk</p>
                            <h3 className="mt-2 text-lg font-semibold">Read the conditions</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                                A plain Low / Moderate / High check before you commit.
                            </p>
                        </li>
                        <li>
                            <p className="text-sm font-semibold text-[var(--accent)]">03 · Pack</p>
                            <h3 className="mt-2 text-lg font-semibold">Leave with a list</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                                Save gear suggestions and reopen them from your history anytime.
                            </p>
                        </li>
                    </ol>
                </div>
            </section>

            <section className="relative overflow-hidden px-4 py-24 sm:px-6">
                <Image
                    src={CTA_IMAGE}
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-[rgb(15_28_24_/0.78)]" aria-hidden />
                <div className="relative mx-auto max-w-xl text-center text-white">
                    <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
                        Walk lighter. Plan clearer.
                    </h2>
                    <p className="mt-4 text-white/80">
                        Create a free account and prepare your next trek in minutes.
                    </p>
                    <div className="mt-8">
                        <Link href="/signup">
                            <Button size="lg">Create free account</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
