'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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

const CACHE_KEY_BASE = 'trekpal_map_locations_v4';

function cacheKey(showUnverifiedSafety: boolean, verifiedOnly: boolean) {
    return `${CACHE_KEY_BASE}_${showUnverifiedSafety ? 'all' : 'safe'}_${verifiedOnly ? 'verified' : 'any'}`;
}

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
    const [loadError, setLoadError] = useState<string | null>(null);
    const [fromCache, setFromCache] = useState(false);
    const [showUnverifiedSafety, setShowUnverifiedSafety] = useState(false);
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const data = await mapsApi.listLocations({
                    showUnverifiedSafety,
                    verifiedOnly,
                });
                setLocations(data || []);
                setFromCache(false);
                localStorage.setItem(
                    cacheKey(showUnverifiedSafety, verifiedOnly),
                    JSON.stringify(data || [])
                );
            } catch (error) {
                console.error('Map locations fetch failed, trying cache:', error);
                setLoadError('Could not reach the API. Trying cached places if available.');
                const cached = localStorage.getItem(cacheKey(showUnverifiedSafety, verifiedOnly));
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
    }, [showUnverifiedSafety, verifiedOnly]);

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
                eyebrow="Orient yourself"
                title="Trek maps"
                description="Curated OpenStreetMap landmarks for orientation — not live rescue routing."
            />

            <div className="mb-6 rounded-[var(--radius)] border border-[var(--warning)]/40 bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">
                Unverified hospital and emergency pins stay hidden by default. Even verified pins are
                approximate public landmarks — always confirm locally with guides, lodges, or
                official channels.{' '}
                <Link href="/knowledge/nepal-emergency-contacts" className="font-semibold underline">
                    Emergency contacts guide
                </Link>
                {' · '}
                <Link href="/knowledge/trail-safety-basics" className="font-semibold underline">
                    Trail safety
                </Link>
            </div>

            {loadError && (
                <p className="mb-4 text-sm text-[var(--danger)]" role="alert">
                    {loadError}
                </p>
            )}

            <div className="mb-6 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <input
                        type="checkbox"
                        className="mt-1"
                        checked={verifiedOnly}
                        onChange={(e) => {
                            setSelectedId(null);
                            setVerifiedOnly(e.target.checked);
                        }}
                    />
                    <span>
                        <span className="font-semibold">Verified landmarks only</span>
                        <span className="mt-1 block text-[var(--muted)]">
                            Hide approximate / editorial tea-house and lodge cluster pins.
                        </span>
                    </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 text-sm">
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
                            Demo data only. Do not use these for emergency decisions.
                        </span>
                    </span>
                </label>
            </div>

            {!showUnverifiedSafety && (
                <p className="mb-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--muted)]">
                    Hidden: unverified hospital and emergency pins stay off the map by default —
                    so TrekPal never implies fake rescue coverage.
                </p>
            )}

            <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
                <span className="inline-flex items-center gap-2">
                    <span
                        className="inline-block h-3 w-3 rounded-full border-2 border-white bg-[var(--accent)] shadow"
                        aria-hidden
                    />
                    Solid border = verified
                </span>
                <span className="inline-flex items-center gap-2">
                    <span
                        className="inline-block h-3 w-3 rounded-full border-2 border-dashed border-white/90 bg-[var(--accent)]/70 shadow"
                        aria-hidden
                    />
                    Dashed = approximate / demo
                </span>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`chip ${
                            category === c.id ? 'chip-outline-active' : ''
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
                    className={`chip ${region === null ? 'chip-outline-active' : ''}`}
                >
                    All regions
                </button>
                {regions.map((r) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setRegion(r)}
                        className={`chip ${region === r ? 'chip-outline-active' : ''}`}
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
                            ? showUnverifiedSafety
                                ? 'No hospital/emergency pins match this filter. TrekPal does not invent rescue locations.'
                                : 'Unverified medical pins are hidden by default so they are not mistaken for live rescue guidance. Turn on the demo toggle only to preview curated demo data.'
                            : verifiedOnly
                              ? 'No verified landmarks match this filter. Turn off “Verified landmarks only” to see approximate pins.'
                              : 'No places match this filter. Try All categories or another region.'
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
                                            {selected.trust_label ||
                                                (selected.is_verified
                                                    ? 'Verified landmark'
                                                    : 'Unverified')}
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
                                    Click a marker to see elevation, trust label, and source note.
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
                                                {loc.trust_label ||
                                                    (loc.is_verified ? 'Verified' : 'Unverified')}
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
