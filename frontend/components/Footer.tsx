import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="mt-auto w-full border-t border-[var(--border)] bg-[var(--surface)]">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6">
                <Link
                    href="/"
                    className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--foreground)]"
                >
                    TrekPal
                </Link>
                <p className="text-sm text-[var(--muted)]">
                    Your companion for safer, clearer trek preparation.
                </p>
                <p className="text-sm text-[var(--muted)]">
                    &copy; {new Date().getFullYear()} TrekPal
                </p>
            </div>
        </footer>
    );
}
