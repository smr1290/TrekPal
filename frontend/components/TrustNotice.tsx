import Link from 'next/link';

/**
 * Persistent, compact trust line for AI / prep surfaces (S7).
 * Avoids cluttering heroes — one calm sentence + optional links.
 */
export default function TrustNotice({
    className = '',
}: {
    className?: string;
}) {
    return (
        <p
            className={`text-xs leading-relaxed text-[var(--muted)] ${className}`}
            role="note"
        >
            TrekPal is preparation support only — not medical, legal, or emergency advice.
            Verify permits and trail conditions before you travel.{' '}
            <Link href="/terms" className="font-semibold text-[var(--accent)] hover:underline">
                Terms
            </Link>
            {' · '}
            <Link href="/privacy" className="font-semibold text-[var(--accent)] hover:underline">
                Privacy
            </Link>
        </p>
    );
}
