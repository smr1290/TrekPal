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
import {
    getKnowledgeCategoryLabel,
    getKnowledgeCategoryVariant,
    KNOWLEDGE_CATEGORIES,
} from '@/lib/badgeHelpers';

export default function KnowledgePage() {
    const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticles = async () => {
            setIsLoading(true);
            try {
                const data = await knowledgeApi.listArticles(activeCategory ?? undefined);
                setArticles(data || []);
            } catch (error) {
                console.error('Failed to fetch knowledge articles:', error);
                setArticles([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, [activeCategory]);

    const filteredArticles = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return articles;

        return articles.filter(
            (article) =>
                article.title.toLowerCase().includes(term) ||
                article.summary.toLowerCase().includes(term)
        );
    }, [articles, searchTerm]);

    return (
        <PageContainer>
            <PageHeader
                title="Knowledge base"
                description="Guides, permits, safety tips, and emergency info — the foundation for smarter trek prep (and future AI answers)."
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

            <div className="mb-8 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        activeCategory === null
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                            : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40'
                    }`}
                >
                    All
                </button>
                {KNOWLEDGE_CATEGORIES.map((category) => (
                    <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            activeCategory === category
                                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40'
                        }`}
                    >
                        {getKnowledgeCategoryLabel(category)}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <SkeletonGrid count={6} columns="sm:grid-cols-2 lg:grid-cols-3" />
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
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredArticles.map((article) => (
                        <Link key={article.id} href={`/knowledge/${article.slug}`} className="group">
                            <Card className="flex h-full flex-col transition group-hover:border-[var(--accent)]/35">
                                <Badge variant={getKnowledgeCategoryVariant(article.category)}>
                                    {getKnowledgeCategoryLabel(article.category)}
                                </Badge>
                                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight group-hover:text-[var(--accent)]">
                                    {article.title}
                                </h3>
                                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                                    {article.summary}
                                </p>
                                <p className="mt-5 text-xs font-semibold text-[var(--accent)]">
                                    Read article →
                                </p>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </PageContainer>
    );
}
