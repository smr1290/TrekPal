'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import PageContainer from '@/components/PageContainer';
import { PageHeader, EmptyState, LoadingBlock } from '@/components/ui';
import { mapsApi } from '@/lib/api';
import type { MapLocation } from '@/lib/types';

const TrekMap = dynamic(() => import('@/components/TrekMap'), {
    ssr: false,
    loading: () => <LoadingBlock label="Loading map…" />,
});

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'trailhead', label: 'Trailheads' },
    { id: 'tea_house', label: 'Tea houses' },
    { id: 'checkpoint', label: 'Checkpoints' },
    { id: 'hospital', label: 'Hospitals' },
    { id: 'emergency', label: 'Emergency' },
];

const CACHE_KEY = 'trekpal_map_locations_v2';

function categoryBadge(category: string) {
    switch (category) {
        case 'emergency':
            return 'danger' as const;
        case 'hospital':
            return 'warning' as const;
        case 'checkpoint':
            return 'info' as const;
        case 'tea_house':
            return 'success' as const;
        default:
            return 'default' as const;
    }
}

export default function MapsPage() {
    const [locations, setLocations] = useState<MapLocation[]>([]);
    const [category, setCategory] = useState('all');
    const [region, setRegion] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fromCache, setFromCache] = useState(false);
    const [showUnverifiedSafety, setShowUnverifiedSafety] = useState(false);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const data = await mapsApi.listLocations(
                    undefined,
                    undefined,
                    showUnverifiedSafety
                );
                setLocations(data || []);
                setFromCache(false);
                localStorage.setItem(CACHE_KEY, JSON.stringify(data || []));
            } catch (error) {
                console.error('Map locations fetch failed, trying cache:', error);
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    setLocations(JSON.parse(cached) as MapLocation[]);
                    setFromCache(true);
                } else {
                    setLocations([]);
                }
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, [showUnverifiedSafety]);

    const regions = useMemo(() => {
        const set = new Set<string>();
        locations.forEach((l) => {
            if (l.region) set.add(l.region);
        });
        return Array.from(set).sort();
    }, [locations]);

    const filtered = useMemo(() => {
        return locations.filter((l) => {
            if (category !== 'all' && l.category !== category) return false;
            if (region && l.region !== region) return false;
            return true;
        });
    }, [locations, category, region]);

    const verifiedCount = filtered.filter((l) => l.is_verified).length;
    const selected = filtered.find((l) => l.id === selectedId) || null;

    return (
        <PageContainer className="pb-16">
            <PageHeader
                title="Trek maps"
                description="OpenStreetMap view of trailheads, tea houses, checkpoints, and landmarks — with elevation."
            />

            <div className="mb-6 rounded-[var(--radius)] border border-[var(--warning)]/40 bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">
                Unverified hospital and emergency pins are hidden by default — they are demo data,
                not live rescue guidance. Verified markers are public landmarks with approximate
                coordinates; always confirm locally.
            </div>

            <label className="mb-6 flex cursor-pointer items-start gap-3 text-sm">
                <input
                    type="checkbox"
                    className="mt-1"
                    checked={showUnverifiedSafety}
                    onChange={(e) => {
                        setSelectedId(null);
                        setShowUnverifiedSafety(e.target.checked);
                    }}
                />
                <span>
                    <span className="font-semibold">Show unverified medical / emergency pins</span>
                    <span className="mt-1 block text-[var(--muted)]">
                        Only for learning / demo. Do not use these for emergency decisions.
                    </span>
                </span>
            </label>

            <div className="mb-4 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            category === c.id
                                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40'
                        }`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setRegion(null)}
                    className={`rounded-[var(--radius)] border px-3 py-1.5 text-xs font-semibold ${
                        region === null
                            ? 'border-[var(--accent)] text-[var(--accent)]'
                            : 'border-[var(--border)] text-[var(--muted)]'
                    }`}
                >
                    All regions
                </button>
                {regions.map((r) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setRegion(r)}
                        className={`rounded-[var(--radius)] border px-3 py-1.5 text-xs font-semibold ${
                            region === r
                                ? 'border-[var(--accent)] text-[var(--accent)]'
                                : 'border-[var(--border)] text-[var(--muted)]'
                        }`}
                    >
                        {r}
                    </button>
                ))}
            </div>

            {fromCache && (
                <p className="mb-4 text-xs font-medium text-[var(--muted)]">
                    Showing cached points of interest (offline-friendly list). Basemap tiles still need a
                    network connection.
                </p>
            )}

            {isLoading ? (
                <LoadingBlock label="Loading locations…" />
            ) : filtered.length === 0 ? (
                <EmptyState
                    title="No map points found"
                    description={
                        category === 'hospital' || category === 'emergency'
                            ? 'Unverified medical pins are hidden. Enable the toggle above to preview demo data.'
                            : 'Seeded map locations will appear here after the database migration.'
                    }
                />
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <Card className="overflow-hidden p-0">
                        <div className="h-[520px] w-full">
                            <TrekMap
                                locations={filtered}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                            />
                        </div>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card className="p-5">
                            <h3 className="text-sm font-semibold">Selected place</h3>
                            {selected ? (
                                <div className="mt-3">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant={categoryBadge(selected.category)}>
                                            {selected.category.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant={selected.is_verified ? 'success' : 'warning'}>
                                            {selected.is_verified ? 'Verified landmark' : 'Unverified'}
                                        </Badge>
                                    </div>
                                    <h4 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold">
                                        {selected.name}
                                    </h4>
                                    <p className="mt-2 text-sm text-[var(--muted)]">
                                        {selected.region || 'Nepal'}
                                        {selected.elevation_m != null
                                            ? ` · ${selected.elevation_m.toLocaleString()} m`
                                            : ''}
                                    </p>
                                    {selected.description && (
                                        <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">
                                            {selected.description}
                                        </p>
                                    )}
                                    {selected.source_note && (
                                        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                                            {selected.source_note}
                                        </p>
                                    )}
                                    <p className="mt-3 text-xs text-[var(--muted)]">
                                        {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-[var(--muted)]">
                                    Click a marker to see elevation and verification status.
                                </p>
                            )}
                        </Card>

                        <Card className="max-h-[360px] overflow-auto p-5">
                            <h3 className="mb-3 text-sm font-semibold">
                                Places ({filtered.length}) · {verifiedCount} verified
                            </h3>
                            <ul className="space-y-2">
                                {filtered.map((loc) => (
                                    <li key={loc.id}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedId(loc.id)}
                                            className={`w-full rounded-[var(--radius)] border px-3 py-2 text-left text-sm ${
                                                selectedId === loc.id
                                                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                                                    : 'border-[var(--border)] hover:border-[var(--accent)]/35'
                                            }`}
                                        >
                                            <span className="font-semibold">{loc.name}</span>
                                            <span className="mt-1 block text-xs text-[var(--muted)]">
                                                {loc.is_verified ? 'Verified' : 'Unverified'}
                                                {loc.elevation_m != null
                                                    ? ` · ${loc.elevation_m.toLocaleString()} m`
                                                    : ''}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
