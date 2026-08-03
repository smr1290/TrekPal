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
                eyebrow="Destination catalog"
                title="Nepal treks"
                description="Magazine-style trail guides — region, seasons, and highlights — then jump into Plan trip with details filled in."
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

            <div className="mb-3 flex flex-wrap gap-2">
                {['All', 'Easy', 'Moderate', 'Hard'].map((level) => (
                    <button
                        key={level}
                        type="button"
                        onClick={() => setDifficultyFilter(level)}
                        className={`chip ${difficultyFilter === level ? 'chip-active' : ''}`}
                    >
                        {level}
                    </button>
                ))}
            </div>

            <div className="mb-10 flex flex-wrap gap-2">
                {regions.map((region) => (
                    <button
                        key={region}
                        type="button"
                        onClick={() => setRegionFilter(region)}
                        className={`chip ${
                            regionFilter === region ? 'chip-outline-active' : ''
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
                <div className="grid gap-7 lg:grid-cols-2">
                    {filteredTreks.map((trek) => {
                        const href = isAuthenticated
                            ? planHref(trek)
                            : `/login?next=${encodeURIComponent(planHref(trek))}`;
                        return (
                            <Card
                                key={trek.id}
                                interactive
                                className="flex flex-col overflow-hidden p-0"
                            >
                                <div className="media-zoom relative">
                                    <CatalogImage
                                        src={trek.image_url}
                                        alt={trek.trek_name}
                                        fallbackLabel={trek.trek_name}
                                        className="h-56 w-full sm:h-64"
                                    />
                                    <div
                                        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgb(8_30_22_/0.55)] to-transparent"
                                        aria-hidden
                                    />
                                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                                        <Badge variant={getDifficultyVariant(trek.difficulty)}>
                                            {trek.difficulty}
                                        </Badge>
                                        {trek.region && (
                                            <Badge className="bg-white/90 text-[var(--foreground)] ring-white/40">
                                                {trek.region}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-1 flex-col p-6 sm:p-7">
                                    <h3 className="display-title text-2xl sm:text-3xl">
                                        {trek.trek_name}
                                    </h3>
                                    {trek.summary && (
                                        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                                            {trek.summary}
                                        </p>
                                    )}
                                    {trek.highlights && (
                                        <p className="mt-4 border-l-2 border-[var(--accent)]/40 pl-3 text-sm leading-relaxed text-[var(--foreground)]">
                                            {trek.highlights}
                                        </p>
                                    )}
                                    <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-5 text-sm">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                Altitude
                                            </p>
                                            <p className="mt-1.5 font-semibold">
                                                {trek.max_altitude.toLocaleString()} m
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                Duration
                                            </p>
                                            <p className="mt-1.5 font-semibold">
                                                {trek.duration_days} days
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                Seasons
                                            </p>
                                            <p className="mt-1.5 font-semibold">
                                                {trek.best_seasons || '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
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
