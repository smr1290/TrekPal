'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import PageContainer from '@/components/PageContainer';
import { PageHeader, EmptyState, SkeletonGrid } from '@/components/ui';
import { gearApi } from '@/lib/api';
import type { Gear } from '@/lib/types';

export default function GearPage() {
    const [gearList, setGearList] = useState<Gear[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    useEffect(() => {
        const fetchGear = async () => {
            try {
                const data = await gearApi.listGear();
                setGearList(data || []);
            } catch (error) {
                console.error('Failed to fetch gear:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGear();
    }, []);

    const rawCategories = Array.from(
        new Set((gearList || []).map((item) => item.category).filter(Boolean))
    );
    const categories = ['All', ...rawCategories];

    const filteredGear =
        selectedCategory === 'All'
            ? gearList || []
            : (gearList || []).filter((item) => item.category === selectedCategory);

    return (
        <PageContainer>
            <PageHeader
                title="Pack kit"
                description="Essential equipment you can match to season, altitude, and trek length."
            />

            {isLoading ? (
                <SkeletonGrid count={4} />
            ) : (
                <div className="flex flex-col gap-10 md:flex-row md:gap-12">
                    <aside className="md:w-52 shrink-0">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Categories
                        </p>
                        <div className="flex flex-wrap gap-2 md:flex-col">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setSelectedCategory(category)}
                                    className={`rounded-[var(--radius)] px-3 py-2 text-left text-sm font-medium ${
                                        selectedCategory === category
                                            ? 'bg-[var(--accent)] text-white'
                                            : 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]'
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
                                description="Try another filter or add gear in the database."
                            />
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2">
                                {filteredGear.map((item) => (
                                    <Card key={item.id} className="flex flex-col overflow-hidden p-0">
                                        <div className="flex h-40 items-center justify-center bg-[var(--accent-soft)] text-sm font-medium text-[var(--accent)]">
                                            {item.photo_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={item.photo_url}
                                                    alt={item.gear_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                item.category || 'Gear'
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            <Badge variant="info" className="mb-3 w-fit">
                                                {item.category}
                                            </Badge>
                                            <h3 className="text-lg font-semibold">{item.gear_name}</h3>
                                            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                                                {item.description}
                                            </p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
