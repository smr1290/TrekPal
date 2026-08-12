'use client';

import React, { useMemo, useState } from 'react';
import Badge from '@/components/Badge';
import CatalogImage from '@/components/CatalogImage';
import type { RecommendedGearItem } from '@/lib/types';
import { getGearPriorityVariant } from '@/lib/badgeHelpers';

type PriorityFilter = 'all' | 'essential' | 'recommended' | 'optional';

const PRIORITY_ORDER = ['essential', 'recommended', 'optional'];

function priorityRank(p?: string) {
    const key = (p || '').toLowerCase();
    const idx = PRIORITY_ORDER.indexOf(key);
    return idx === -1 ? 99 : idx;
}

function itemKey(gear: RecommendedGearItem, index: number) {
    return gear.slug || `${gear.gear_name}-${index}`;
}

export default function PackingChecklistResults({
    items,
}: {
    items: RecommendedGearItem[];
}) {
    const [filter, setFilter] = useState<PriorityFilter>('all');
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [prevItems, setPrevItems] = useState(items);

    if (items !== prevItems) {
        setPrevItems(items);
        setChecked({});
        setFilter('all');
    }

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => {
            const pr = priorityRank(a.priority) - priorityRank(b.priority);
            if (pr !== 0) return pr;
            return (a.category || '').localeCompare(b.category || '');
        });
    }, [items]);

    const filtered = useMemo(() => {
        if (filter === 'all') return sorted;
        return sorted.filter((g) => (g.priority || '').toLowerCase() === filter);
    }, [sorted, filter]);

    const grouped = useMemo(() => {
        const map = new Map<string, { gear: RecommendedGearItem; index: number }[]>();
        filtered.forEach((gear, index) => {
            const cat = gear.category?.trim() || 'General';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push({ gear, index });
        });
        return Array.from(map.entries());
    }, [filtered]);

    const total = items.length;
    const packedCount = Object.values(checked).filter(Boolean).length;
    const progress = total === 0 ? 0 : Math.round((packedCount / total) * 100);

    const toggle = (key: string) => {
        setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const filters: { id: PriorityFilter; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'essential', label: 'Essential' },
        { id: 'recommended', label: 'Recommended' },
        { id: 'optional', label: 'Optional' },
    ];

    return (
        <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
            <div className="border-b border-[var(--border)] bg-[linear-gradient(135deg,#0a3324_0%,#146649_70%)] px-5 py-5 text-white sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/55">
                            Your kit
                        </p>
                        <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
                            Packing checklist
                        </h3>
                        <p className="mt-1 text-sm text-white/70">
                            Tap items as you pack. Essential gear first.
                        </p>
                    </div>
                    <div className="rounded-[var(--radius-sm)] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/60">
                            Packed
                        </p>
                        <p className="mt-0.5 font-[family-name:var(--font-display)] text-xl font-semibold">
                            {packedCount}
                            <span className="text-base font-medium text-white/55"> / {total}</span>
                        </p>
                    </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                        className="h-full rounded-full bg-[var(--accent-mid)] transition-[width] duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[var(--border)] px-5 py-3 sm:px-6">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                            filter === f.id
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-[var(--surface-muted)] text-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="space-y-8 px-5 py-6 sm:px-6">
                {grouped.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">No items in this filter.</p>
                ) : (
                    grouped.map(([category, rows]) => (
                        <div key={category}>
                            <div className="mb-3 flex items-center gap-2">
                                <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                                    {category}
                                </h4>
                                <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
                                <span className="text-[11px] font-semibold text-[var(--muted)]">
                                    {rows.length}
                                </span>
                            </div>
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {rows.map(({ gear, index }) => {
                                    const key = itemKey(gear, index);
                                    const isPacked = Boolean(checked[key]);
                                    return (
                                        <li key={key}>
                                            <button
                                                type="button"
                                                onClick={() => toggle(key)}
                                                className={`flex w-full gap-3 rounded-[var(--radius)] border p-3 text-left transition-colors ${
                                                    isPacked
                                                        ? 'border-[var(--accent)]/35 bg-[var(--accent-soft)]/60'
                                                        : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/30'
                                                }`}
                                            >
                                                <span
                                                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                                        isPacked
                                                            ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                                            : 'border-[var(--border-strong)] bg-[var(--surface)]'
                                                    }`}
                                                    aria-hidden
                                                >
                                                    {isPacked ? (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                            <path
                                                                d="M5 12.5l5 5L19 7"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    ) : null}
                                                </span>
                                                <CatalogImage
                                                    src={gear.photo_url}
                                                    alt=""
                                                    fallbackLabel={(gear.category || 'Gear').slice(0, 3)}
                                                    className="h-16 w-16 shrink-0 rounded-[var(--radius-sm)]"
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-start justify-between gap-2">
                                                        <span
                                                            className={`text-sm font-semibold leading-snug ${
                                                                isPacked
                                                                    ? 'text-[var(--muted)] line-through'
                                                                    : 'text-[var(--foreground)]'
                                                            }`}
                                                        >
                                                            {gear.gear_name}
                                                        </span>
                                                        {gear.priority && (
                                                            <Badge
                                                                variant={getGearPriorityVariant(gear.priority)}
                                                                className="shrink-0"
                                                            >
                                                                {gear.priority}
                                                            </Badge>
                                                        )}
                                                    </span>
                                                    {gear.quantity && (
                                                        <span className="mt-1 block text-xs font-semibold text-[var(--accent)]">
                                                            {gear.quantity}
                                                        </span>
                                                    )}
                                                    {(gear.reason || gear.rent_hint) && (
                                                        <span className="mt-1.5 block text-xs leading-relaxed text-[var(--muted)]">
                                                            {gear.reason || gear.rent_hint}
                                                        </span>
                                                    )}
                                                    {gear.reason && gear.rent_hint && (
                                                        <span className="mt-1 block text-[11px] leading-relaxed text-[var(--muted)]">
                                                            Nepal: {gear.rent_hint}
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
