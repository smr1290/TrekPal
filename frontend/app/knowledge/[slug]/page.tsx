'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import PageContainer from '@/components/PageContainer';
import { EmptyState, LoadingBlock } from '@/components/ui';
import { knowledgeApi } from '@/lib/api';
import type { KnowledgeArticleDetail } from '@/lib/types';
import { getKnowledgeCategoryLabel, getKnowledgeCategoryVariant } from '@/lib/badgeHelpers';
import {
    knowledgeDisclaimer,
    parseArticleContent,
    sourceHostname,
} from '@/lib/knowledgeTrust';

export default function KnowledgeDetailPage() {
    const params = useParams();
    const slug = typeof params.slug === 'string' ? params.slug : '';
    const [article, setArticle] = useState<KnowledgeArticleDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) return;

            setIsLoading(true);
            try {
                const data = await knowledgeApi.getArticle(slug);
                setArticle(data);
            } catch (error) {
                console.error('Failed to fetch article:', error);
                setArticle(null);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchArticle();
    }, [slug]);

    const disclaimer = article?.disclaimer || knowledgeDisclaimer(article?.category);
    const host = sourceHostname(article?.source_url);
    const blocks = article ? parseArticleContent(article.content) : [];

    return (
        <PageContainer>
            <Link
                href="/knowledge"
                className="mb-8 inline-block text-sm font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
            >
                ← Back to knowledge base
            </Link>

            {isLoading ? (
                <LoadingBlock label="Loading article…" />
            ) : !article ? (
                <EmptyState
                    title="Article not found"
                    description="This guide may have been removed or the link is incorrect."
                    action={
                        <Link
                            href="/knowledge"
                            className="text-sm font-semibold text-[var(--accent)] hover:underline"
                        >
                            Browse all articles
                        </Link>
                    }
                />
            ) : (
                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
                    <article>
                        <Card className="p-6 sm:p-10">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant={getKnowledgeCategoryVariant(article.category)}>
                                    {getKnowledgeCategoryLabel(article.category)}
                                </Badge>
                                {article.has_source ? (
                                    <Badge variant="info">External source</Badge>
                                ) : (
                                    <Badge variant="default">TrekPal editorial</Badge>
                                )}
                            </div>
                            <h1 className="display-title mt-5 text-3xl sm:text-4xl md:text-5xl">
                                {article.title}
                            </h1>
                            <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
                                {article.summary}
                            </p>
                            {article.updated_at && (
                                <p className="mt-4 text-xs text-[var(--muted)]">
                                    Updated{' '}
                                    {new Date(article.updated_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            )}

                            <div
                                className="mt-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm leading-relaxed text-[var(--muted)]"
                                role="note"
                            >
                                {disclaimer}
                            </div>

                            <div className="mt-8 space-y-5 border-t border-[var(--border)] pt-8">
                                {blocks.map((block, index) => {
                                    if (block.type === 'heading') {
                                        return (
                                            <h2
                                                key={index}
                                                className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight"
                                            >
                                                {block.text}
                                            </h2>
                                        );
                                    }
                                    if (block.type === 'list') {
                                        return (
                                            <ul
                                                key={index}
                                                className="list-disc space-y-2 pl-5 text-[var(--foreground)]"
                                            >
                                                {block.items.map((item) => (
                                                    <li key={item} className="leading-relaxed">
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    }
                                    return (
                                        <p
                                            key={index}
                                            className="leading-relaxed text-[var(--foreground)]"
                                        >
                                            {block.text}
                                        </p>
                                    );
                                })}
                            </div>
                        </Card>

                        {(article.related || []).length > 0 && (
                            <section className="mt-8">
                                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                    Related in {getKnowledgeCategoryLabel(article.category)}
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {article.related?.map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/knowledge/${related.slug}`}
                                            className="group"
                                        >
                                            <Card className="h-full transition group-hover:border-[var(--accent)]/35">
                                                <h3 className="font-semibold group-hover:text-[var(--accent)]">
                                                    {related.title}
                                                </h3>
                                                <p className="mt-2 text-sm text-[var(--muted)]">
                                                    {related.summary}
                                                </p>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </article>

                    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                        <Card className="p-5">
                            <h2 className="text-sm font-semibold">Source</h2>
                            {article.has_source && article.source_url ? (
                                <>
                                    <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                                        {article.source_label || 'External reference'}
                                    </p>
                                    {host && (
                                        <p className="mt-1 text-xs text-[var(--muted)]">{host}</p>
                                    )}
                                    <a
                                        href={article.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
                                    >
                                        Open source →
                                    </a>
                                </>
                            ) : (
                                <p className="mt-2 text-sm text-[var(--muted)]">
                                    TrekPal editorial summary. Prefer official sites for fees,
                                    medical decisions, and emergencies.
                                </p>
                            )}
                        </Card>
                        <Card className="p-5">
                            <h2 className="text-sm font-semibold">Used by chat</h2>
                            <p className="mt-2 text-sm text-[var(--muted)]">
                                AI answers cite articles like this one. Always open the source when
                                the topic is safety-critical.
                            </p>
                            <Link
                                href="/chat"
                                className="mt-4 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
                            >
                                Ask TrekPal →
                            </Link>
                        </Card>
                    </aside>
                </div>
            )}
        </PageContainer>
    );
}
