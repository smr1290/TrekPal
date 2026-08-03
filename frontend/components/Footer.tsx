import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="mt-auto w-full border-t border-[var(--border)] bg-[var(--accent-deep)] text-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-6">
                <div>
                    <Link
                        href="/"
                        className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white"
                    >
                        TrekPal
                    </Link>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
                        Your buddy for clearer Himalayan prep — pack lists, risk, weather, and
                        guides in one place.
                    </p>
                </div>
                <p className="text-sm text-white/55">&copy; {new Date().getFullYear()} TrekPal</p>
            </div>
        </footer>
    );
}
