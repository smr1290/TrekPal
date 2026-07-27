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

function formatArticleContent(content: string) {
    return content.split('\n\n').map((paragraph, index) => (
        <p key={index} className="leading-relaxed text-[var(--foreground)]">
            {paragraph}
        </p>
    ));
}

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

        fetchArticle();
    }, [slug]);

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
                <article className="mx-auto max-w-3xl">
                    <Card className="p-6 sm:p-10">
                        <Badge variant={getKnowledgeCategoryVariant(article.category)}>
                            {getKnowledgeCategoryLabel(article.category)}
                        </Badge>
                        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
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
                        <div className="mt-8 space-y-5 border-t border-[var(--border)] pt-8">
                            {formatArticleContent(article.content)}
                        </div>
                        {article.source_url && (
                            <p className="mt-8 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
                                Source:{' '}
                                <a
                                    href={article.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-[var(--accent)] hover:underline"
                                >
                                    {article.source_url}
                                </a>
                            </p>
                        )}
                    </Card>
                </article>
            )}
        </PageContainer>
    );
}
