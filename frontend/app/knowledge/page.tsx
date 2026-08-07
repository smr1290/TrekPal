'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Input from '@/components/Input';
import PageContainer from '@/components/PageContainer';
import { PageHeader, EmptyState, SkeletonGrid } from '@/components/ui';
import { knowledgeApi } from '@/lib/api';
import type { KnowledgeArticle } from '@/lib/types';
import Reveal, { Stagger, StaggerItem } from '@/components/Reveal';
import {
    getKnowledgeCategoryLabel,
    getKnowledgeCategoryVariant,
    KNOWLEDGE_CATEGORIES,
} from '@/lib/badgeHelpers';

export default function KnowledgePage() {
    const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticles = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const data = await knowledgeApi.listArticles(activeCategory ?? undefined);
                setArticles(data || []);
            } catch (error) {
                console.error('Failed to fetch knowledge articles:', error);
                setArticles([]);
                setLoadError('Could not load articles. Check that the API is running, then try again.');
            } finally {
                setIsLoading(false);
            }
        };

        void fetchArticles();
    }, [activeCategory]);

    const filteredArticles = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return articles;

        return articles.filter(
            (article) =>
                article.title.toLowerCase().includes(term) ||
                article.summary.toLowerCase().includes(term) ||
                (article.source_label || '').toLowerCase().includes(term)
        );
    }, [articles, searchTerm]);

    return (
        <PageContainer>
            <PageHeader
                eyebrow="Trail wisdom"
                title="Knowledge base"
                description="Guides with sources you can open and verify — the same articles chat uses for grounded answers."
                action={
                    <div className="w-full sm:w-72">
                        <Input
                            type="search"
                            placeholder="Search articles…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="!mb-0"
                            aria-label="Search knowledge articles"
                        />
                    </div>
                }
            />

            <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                Prefer articles marked with an external source for permits, medical, and safety
                topics. TrekPal is preparation help — confirm critical details before you travel.
            </p>

            {loadError && (
                <p className="mb-4 text-sm text-[var(--danger)]" role="alert">
                    {loadError}
                </p>
            )}

            <div className="mb-10 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className={`chip ${activeCategory === null ? 'chip-outline-active' : ''}`}
                >
                    All
                </button>
                {KNOWLEDGE_CATEGORIES.map((category) => (
                    <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`chip ${
                            activeCategory === category ? 'chip-outline-active' : ''
                        }`}
                    >
                        {getKnowledgeCategoryLabel(category)}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <SkeletonGrid count={6} columns="sm:grid-cols-2 lg:grid-cols-3" />
            ) : loadError ? (
                <EmptyState
                    title="Articles unavailable"
                    description={loadError}
                />
            ) : filteredArticles.length === 0 ? (
                <EmptyState
                    title="No articles found"
                    description={
                        searchTerm
                            ? `Nothing matched “${searchTerm}”. Try another keyword.`
                            : 'Knowledge articles will appear here once the database is seeded.'
                    }
                />
            ) : (
                <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredArticles.map((article) => (
                        <StaggerItem key={article.id}>
                        <Link href={`/knowledge/${article.slug}`} className="group block h-full">
                            <Card interactive spotlight className="flex h-full flex-col">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant={getKnowledgeCategoryVariant(article.category)}>
                                        {getKnowledgeCategoryLabel(article.category)}
                                    </Badge>
                                    {article.has_source ? (
                                        <Badge variant="info">External source</Badge>
                                    ) : (
                                        <Badge variant="default">Editorial</Badge>
                                    )}
                                </div>
                                <h3 className="display-title mt-5 text-xl group-hover:text-[var(--accent)]">
                                    {article.title}
                                </h3>
                                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                                    {article.summary}
                                </p>
                                {article.source_label && (
                                    <p className="mt-3 text-xs text-[var(--muted)]">
                                        Source: {article.source_label}
                                    </p>
                                )}
                                <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                                    Read article →
                                </p>
                            </Card>
                        </Link>
                        </StaggerItem>
                    ))}
                </Stagger>
            )}
        </PageContainer>
    );
}
