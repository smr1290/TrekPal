'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { gearApi } from '@/lib/api';

export default function GearPage() {
    const [gear, setGear] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    useEffect(() => {
        const fetchGear = async () => {
            try {
                const data = await gearApi.listGear();
                setGear(data);
            } catch (error) {
                console.error('Failed to fetch gear:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGear();
    }, []);

    const categories = ['All', ...Array.from(new Set(gear.map((item) => item.category).filter(Boolean)))];

    const filteredGear = selectedCategory === 'All'
        ? gear
        : gear.filter((item) => item.category === selectedCategory);

    return (
        <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-[var(--foreground)]">Gear Catalog</h1>
                    <p className="text-xl text-[var(--muted)]">
                        Browse all available trekking gear
                    </p>
                </div>

                {/* Category Filter */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            variant={selectedCategory === category ? 'primary' : 'outline'}
                            size="sm"
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                {isLoading ? (
                    <Card>
                        <p className="text-center text-[var(--muted)] py-8">Loading gear...</p>
                    </Card>
                ) : filteredGear.length === 0 ? (
                    <Card>
                        <p className="text-center text-[var(--muted)] py-8">No gear items available</p>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredGear.map((item) => (
                            <Card key={item.id} hover>
                                {item.photo_url && (
                                    <img
                                        src={item.photo_url}
                                        alt={item.gear_name}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="48"%3E🎒%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                )}
                                <div>
                                    {item.category && (
                                        <p className="text-xs font-medium text-[var(--primary)] mb-1">
                                            {item.category}
                                        </p>
                                    )}
                                    <h3 className="text-lg font-semibold mb-2 text-[var(--foreground)]">
                                        {item.gear_name}
                                    </h3>
                                    {item.description && (
                                        <p className="text-sm text-[var(--muted)] line-clamp-3">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
