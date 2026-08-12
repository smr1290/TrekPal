import type { ReactNode } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';

type LegalSection = {
    heading: string;
    body: ReactNode;
};

export default function LegalPage({
    title,
    updated,
    intro,
    sections,
}: {
    title: string;
    updated: string;
    intro: string;
    sections: LegalSection[];
}) {
    return (
        <PageContainer className="pb-20">
            <header className="mb-10 max-w-3xl border-b border-[var(--border)] pb-8">
                <p className="eyebrow">Legal</p>
                <h1 className="display-title mt-3 text-3xl sm:text-5xl">{title}</h1>
                <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">{intro}</p>
                <p className="mt-3 text-xs text-[var(--muted)]">Last updated: {updated}</p>
            </header>

            <div className="mx-auto max-w-3xl space-y-10">
                {sections.map((section) => (
                    <section key={section.heading}>
                        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
                            {section.heading}
                        </h2>
                        <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                            {section.body}
                        </div>
                    </section>
                ))}

                <p className="border-t border-[var(--border)] pt-8 text-sm text-[var(--muted)]">
                    Questions about this page? See also{' '}
                    <Link href="/privacy" className="font-semibold text-[var(--accent)] hover:underline">
                        Privacy
                    </Link>
                    {' · '}
                    <Link href="/terms" className="font-semibold text-[var(--accent)] hover:underline">
                        Terms
                    </Link>
                    {' · '}
                    <Link href="/" className="font-semibold text-[var(--accent)] hover:underline">
                        Home
                    </Link>
                    .
                </p>
            </div>
        </PageContainer>
    );
}
