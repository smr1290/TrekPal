import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="mt-auto w-full border-t border-white/10 bg-[var(--accent-deep)] text-white">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-[1.4fr_1fr] sm:px-6">
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white"
                    >
                        <span
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10"
                            aria-hidden
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M3 19L10.5 6l3.5 6 2.5-4L21 19H3z" fill="currentColor" />
                            </svg>
                        </span>
                        TrekPal
                    </Link>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
                        Your Himalayan destination buddy — packing, risk, weather, and trusted
                        guides so every ridge feels clearer.
                    </p>
                </div>
                <div className="flex flex-col justify-between gap-6 sm:items-end sm:text-right">
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-white/70 sm:justify-end">
                        <Link href="/treks" className="hover:text-white">
                            Treks
                        </Link>
                        <Link href="/gear" className="hover:text-white">
                            Gear
                        </Link>
                        <Link href="/knowledge" className="hover:text-white">
                            Knowledge
                        </Link>
                        <Link href="/maps" className="hover:text-white">
                            Maps
                        </Link>
                    </div>
                    <p className="text-xs tracking-wide text-white/45">
                        &copy; {new Date().getFullYear()} TrekPal · Built for Nepal trails
                    </p>
                </div>
            </div>
        </footer>
    );
}
