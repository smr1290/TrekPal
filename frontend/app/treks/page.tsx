'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Input from '@/components/Input';
import CatalogImage from '@/components/CatalogImage';
import PageContainer from '@/components/PageContainer';
import { PageHeader, EmptyState, SkeletonGrid } from '@/components/ui';
import { trekApi } from '@/lib/api';
import type { Trek } from '@/lib/types';
import { getDifficultyVariant } from '@/lib/badgeHelpers';
import { useAuth } from '@/context/AuthContext';

function planHref(trek: Trek) {
    const params = new URLSearchParams({
        tab: 'checklist',
        destination: trek.trek_name,
        altitude: String(trek.max_altitude),
        duration: String(trek.duration_days),
        difficulty: trek.difficulty,
        trek_id: String(trek.id),
    });
    return `/planner?${params.toString()}`;
}

export default function TreksPage() {
    const { isAuthenticated } = useAuth();
    const [treks, setTreks] = useState<Trek[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [regionFilter, setRegionFilter] = useState('All');

    useEffect(() => {
        const fetchTreks = async () => {
            try {
                const data = await trekApi.listTreks();
                setTreks(data || []);
                setLoadError(null);
            } catch {
                setLoadError('Could not load treks. Check that the API is running.');
                setTreks([]);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchTreks();
    }, []);

    const regions = useMemo(() => {
        const set = new Set<string>();
        treks.forEach((t) => {
            if (t.region) set.add(t.region);
        });
        return ['All', ...Array.from(set).sort()];
    }, [treks]);

    const filteredTreks = treks.filter((trek) => {
        const haystack = `${trek.trek_name} ${trek.region || ''} ${trek.summary || ''}`.toLowerCase();
        const matchesSearch = haystack.includes(searchTerm.toLowerCase());
        const matchesDifficulty =
            difficultyFilter === 'All' || trek.difficulty === difficultyFilter;
        const matchesRegion = regionFilter === 'All' || trek.region === regionFilter;
        return matchesSearch && matchesDifficulty && matchesRegion;
    });

    return (
        <PageContainer>
            <PageHeader
                title="Nepal treks"
                description="Short trail guides with region, seasons, and highlights — then jump into Plan trip with details filled."
                action={
                    <div className="w-full sm:w-72">
                        <Input
                            type="search"
                            placeholder="Search treks or regions…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="!mb-0"
                            aria-label="Search treks"
                        />
                    </div>
                }
            />

            <div className="mb-4 flex flex-wrap gap-2">
                {['All', 'Easy', 'Moderate', 'Hard'].map((level) => (
                    <button
                        key={level}
                        type="button"
                        onClick={() => setDifficultyFilter(level)}
                        className={`rounded-[var(--radius)] px-3 py-1.5 text-xs font-semibold ${
                            difficultyFilter === level
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-[var(--surface-muted)] text-[var(--muted)]'
                        }`}
                    >
                        {level}
                    </button>
                ))}
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
                {regions.map((region) => (
                    <button
                        key={region}
                        type="button"
                        onClick={() => setRegionFilter(region)}
                        className={`rounded-[var(--radius)] border px-3 py-1.5 text-xs font-semibold ${
                            regionFilter === region
                                ? 'border-[var(--accent)] text-[var(--accent)]'
                                : 'border-[var(--border)] text-[var(--muted)]'
                        }`}
                    >
                        {region === 'All' ? 'All regions' : region}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <SkeletonGrid count={4} />
            ) : loadError ? (
                <EmptyState title="Treks unavailable" description={loadError} />
            ) : filteredTreks.length === 0 ? (
                <EmptyState
                    title="No treks found"
                    description="Try another search, difficulty, or region."
                />
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    {filteredTreks.map((trek) => {
                        const href = isAuthenticated
                            ? planHref(trek)
                            : `/login?next=${encodeURIComponent(planHref(trek))}`;
                        return (
                            <Card
                                key={trek.id}
                                className="flex flex-col overflow-hidden p-0 transition hover:border-[var(--accent)]/35"
                            >
                                <CatalogImage
                                    src={trek.image_url}
                                    alt={trek.trek_name}
                                    fallbackLabel={trek.trek_name}
                                    className="h-48 w-full"
                                />
                                <div className="flex flex-1 flex-col p-5 sm:p-6">
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <Badge variant={getDifficultyVariant(trek.difficulty)}>
                                            {trek.difficulty}
                                        </Badge>
                                        {trek.region && (
                                            <Badge variant="default">{trek.region}</Badge>
                                        )}
                                    </div>
                                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
                                        {trek.trek_name}
                                    </h3>
                                    {trek.summary && (
                                        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                                            {trek.summary}
                                        </p>
                                    )}
                                    {trek.highlights && (
                                        <p className="mt-3 text-sm text-[var(--foreground)]">
                                            <span className="font-semibold">Highlights: </span>
                                            {trek.highlights}
                                        </p>
                                    )}
                                    <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-5 text-sm">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                                Altitude
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {trek.max_altitude.toLocaleString()} m
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                                Duration
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {trek.duration_days} days
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                                Best seasons
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {trek.best_seasons || '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-5">
                                        <Link href={href}>
                                            <Button fullWidth variant="primary">
                                                Plan this trek
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </PageContainer>
    );
}
