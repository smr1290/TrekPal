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
import { gearApi } from '@/lib/api';
import type { Gear } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import Reveal, { Stagger, StaggerItem } from '@/components/Reveal';

export default function GearPage() {
    const { isAuthenticated } = useAuth();
    const [gearList, setGearList] = useState<Gear[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchGear = async () => {
            try {
                const data = await gearApi.listGear();
                setGearList(data || []);
                setLoadError(null);
            } catch {
                setLoadError('Could not load gear. Check that the API is running.');
                setGearList([]);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchGear();
    }, []);

    const categories = useMemo(() => {
        const raw = Array.from(
            new Set((gearList || []).map((item) => item.category).filter(Boolean))
        ).sort();
        return ['All', ...raw];
    }, [gearList]);

    const filteredGear = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return (gearList || []).filter((item) => {
            const matchesCategory =
                selectedCategory === 'All' || item.category === selectedCategory;
            if (!matchesCategory) return false;
            if (!term) return true;
            const haystack =
                `${item.gear_name} ${item.category} ${item.description || ''} ${item.rent_hint || ''}`.toLowerCase();
            return haystack.includes(term);
        });
    }, [gearList, selectedCategory, searchTerm]);

    return (
        <PageContainer className="relative">
            <div
                className="ambient-orb -left-16 top-20 h-52 w-52 bg-[var(--accent-soft)]"
                aria-hidden
            />
            <Reveal>
            <PageHeader
                eyebrow="What goes in the pack"
                title="Gear for Nepal"
                description="Teahouse essentials with pack quantities and Thamel/Pokhara rent tips. For a list matched to your trek, use Plan trip."
                action={
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <div className="w-full sm:w-64">
                            <Input
                                type="search"
                                placeholder="Search gear…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="!mb-0"
                                aria-label="Search gear"
                            />
                        </div>
                        <Link href={isAuthenticated ? '/planner?tab=checklist' : '/signup'}>
                            <Button variant="outline" className="w-full sm:w-auto">
                                Personalized list
                            </Button>
                        </Link>
                    </div>
                }
            />
            </Reveal>

            {isLoading ? (
                <SkeletonGrid count={4} />
            ) : loadError ? (
                <EmptyState title="Gear unavailable" description={loadError} />
            ) : (
                <div className="flex flex-col gap-10 md:flex-row md:gap-12">
                    <aside className="shrink-0 md:w-56">
                        <p className="eyebrow mb-4">Categories</p>
                        <div className="flex flex-wrap gap-2 md:flex-col">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setSelectedCategory(category)}
                                    className={`chip md:w-full md:justify-start ${
                                        selectedCategory === category ? 'chip-active' : ''
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </aside>

                    <div className="flex-1">
                        {filteredGear.length === 0 ? (
                            <EmptyState
                                title="Nothing in this category"
                                description="Try another filter or search term."
                            />
                        ) : (
                            <Stagger className="grid gap-5 sm:grid-cols-2">
                                {filteredGear.map((item) => (
                                    <StaggerItem key={item.id}>
                                        <Card
                                            interactive
                                            spotlight
                                            className="flex h-full flex-col overflow-hidden p-0"
                                        >
                                            <div className="media-zoom">
                                                <CatalogImage
                                                    src={item.photo_url}
                                                    alt={item.gear_name}
                                                    fallbackLabel={item.category || 'Gear'}
                                                    className="h-40 w-full"
                                                />
                                            </div>
                                            <div className="flex flex-1 flex-col p-6">
                                                <Badge variant="info" className="mb-3 w-fit">
                                                    {item.category}
                                                </Badge>
                                                <h3 className="text-lg font-semibold tracking-tight">
                                                    {item.gear_name}
                                                </h3>
                                                {item.quantity_hint && (
                                                    <p className="mt-1.5 text-xs font-semibold text-[var(--accent)]">
                                                        Pack: {item.quantity_hint}
                                                    </p>
                                                )}
                                                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                                                    {item.description}
                                                </p>
                                                {item.rent_hint && (
                                                    <p className="mt-4 rounded-[var(--radius-sm)] border border-[var(--accent)]/15 bg-[var(--accent-soft)]/60 px-3 py-2.5 text-xs leading-relaxed text-[var(--accent-deep)]">
                                                        Nepal tip: {item.rent_hint}
                                                    </p>
                                                )}
                                            </div>
                                        </Card>
                                    </StaggerItem>
                                ))}
                            </Stagger>
                        )}
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
