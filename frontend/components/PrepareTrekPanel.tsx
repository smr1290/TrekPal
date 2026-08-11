'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import CatalogImage from '@/components/CatalogImage';
import WeatherPanel from '@/components/WeatherPanel';
import PackingChecklistResults from '@/components/PackingChecklistResults';
import { EmptyState } from '@/components/ui';
import { trekApi } from '@/lib/api';
import type { TrekPreparationResponse } from '@/lib/types';
import {
    getDifficultyVariant,
    getRiskVariant,
    getEstimateSourceLabel,
} from '@/lib/badgeHelpers';

type FormErrors = {
    altitude?: string;
    duration?: string;
    general?: string;
};

type Props = {
    initialDestination?: string;
    initialAltitude?: string;
    initialDuration?: string;
    initialTrekType?: string;
    initialSeason?: string;
    onRequestItinerary?: (draft: {
        destination: string;
        altitude: string;
        duration: string;
        season: string;
        trek_type: string;
    }) => void;
};

export default function PrepareTrekPanel({
    initialDestination = '',
    initialAltitude = '',
    initialDuration = '',
    initialTrekType = 'Easy',
    initialSeason = 'Spring',
    onRequestItinerary,
}: Props) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        trek_type: initialTrekType || 'Easy',
        altitude: initialAltitude,
        season: initialSeason || 'Spring',
        duration: initialDuration,
        destination: initialDestination,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TrekPreparationResponse | null>(null);

    // Prefill when arriving from Treks catalog (URL params change).
    React.useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            destination: initialDestination || prev.destination,
            altitude: initialAltitude || prev.altitude,
            duration: initialDuration || prev.duration,
            trek_type: initialTrekType || prev.trek_type,
            season: initialSeason || prev.season,
        }));
    }, [initialDestination, initialAltitude, initialDuration, initialTrekType, initialSeason]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: undefined });
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};
        if (!formData.altitude) newErrors.altitude = 'Please enter the target altitude';
        else if (parseInt(formData.altitude, 10) < 0) newErrors.altitude = 'Altitude cannot be negative';
        if (!formData.duration) newErrors.duration = 'Please enter trek duration';
        else if (parseInt(formData.duration, 10) < 1) newErrors.duration = 'Min duration is 1 day';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || !user) return;
        setIsLoading(true);
        setErrors({});
        try {
            const response = await trekApi.prepareTrek(
                formData.trek_type,
                user.experience_level,
                parseInt(formData.altitude, 10),
                formData.season,
                parseInt(formData.duration, 10),
                formData.destination.trim() || undefined
            );
            setResult(response);
        } catch {
            setErrors({ general: 'Failed to generate your list. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setFormData({
            trek_type: 'Easy',
            altitude: '',
            season: 'Spring',
            duration: '',
            destination: '',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Quick checklist</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Risk estimate, budget range, and a Nepal packing list with rent/buy tips.
                    </p>
                </div>
                {result && (
                    <Button variant="outline" size="sm" onClick={reset}>
                        Start over
                    </Button>
                )}
            </div>

            <div className="grid items-start gap-10 lg:grid-cols-2">
                <section>
                    <Card className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            {errors.general && (
                                <div className="mb-4 rounded-[var(--radius)] border border-[var(--danger)]/30 bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger)]">
                                    {errors.general}
                                </div>
                            )}

                            <div className="mb-4 flex items-center justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                    Your experience
                                </span>
                                <a
                                    href="/profile"
                                    className="text-sm font-semibold text-[var(--accent)] hover:underline"
                                >
                                    {user?.experience_level} · Edit
                                </a>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                <Select
                                    label="Trek type"
                                    name="trek_type"
                                    value={formData.trek_type}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'Easy', label: 'Easy' },
                                        { value: 'Moderate', label: 'Moderate' },
                                        { value: 'Hard', label: 'Hard' },
                                    ]}
                                />
                                <Select
                                    label="Season"
                                    name="season"
                                    value={formData.season}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'Spring', label: 'Spring' },
                                        { value: 'Summer', label: 'Summer' },
                                        { value: 'Autumn', label: 'Autumn' },
                                        { value: 'Winter', label: 'Winter' },
                                    ]}
                                />
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                <Input
                                    label="Altitude (meters)"
                                    type="number"
                                    name="altitude"
                                    value={formData.altitude}
                                    onChange={handleChange}
                                    error={errors.altitude}
                                    placeholder="e.g. 4000"
                                    required
                                />
                                <Input
                                    label="Duration (days)"
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    error={errors.duration}
                                    placeholder="e.g. 7"
                                    required
                                />
                            </div>

                            <Input
                                label="Destination (optional)"
                                type="text"
                                name="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                placeholder="e.g. Everest Base Camp, Annapurna Circuit"
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="lg"
                                disabled={isLoading}
                                className="mt-2"
                            >
                                {isLoading ? 'Building your list…' : 'Get my packing plan'}
                            </Button>
                        </form>
                    </Card>
                </section>

                <section>
                    {result ? (
                        <div className="flex flex-col gap-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Card className="relative overflow-hidden border-l-4 border-l-[var(--accent)] p-6">
                                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                                        Risk band
                                    </p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <Badge
                                            variant={getRiskVariant(result.risk_level)}
                                            className="px-3 py-1 text-sm"
                                        >
                                            {result.risk_level}
                                        </Badge>
                                        <span className="text-xs text-[var(--muted)]">
                                            {getEstimateSourceLabel(result.risk_source)}
                                        </span>
                                    </div>
                                    {(result.risk_factors || []).length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {result.risk_factors!.map((factor, i) => (
                                                <span
                                                    key={i}
                                                    className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]"
                                                >
                                                    {factor}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {result.ams_note && (
                                        <p className="mt-4 rounded-[var(--radius-sm)] bg-[var(--warning-bg)] p-3 text-sm text-[var(--warning)]">
                                            {result.ams_note}
                                        </p>
                                    )}
                                </Card>

                                {result.budget_estimate ? (
                                    <Card className="p-6">
                                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                                            Budget mid-range
                                        </p>
                                        <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                                            ${result.budget_estimate.mid_usd.toLocaleString()}
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                            ${result.budget_estimate.low_usd.toLocaleString()} – $
                                            {result.budget_estimate.high_usd.toLocaleString()} USD
                                        </p>
                                        <Badge variant="info" className="mt-4">
                                            {getEstimateSourceLabel(result.budget_source)}
                                        </Badge>
                                    </Card>
                                ) : (
                                    <Card className="flex items-center p-6">
                                        <p className="text-sm text-[var(--muted)]">
                                            Budget estimate unavailable for this run.
                                        </p>
                                    </Card>
                                )}
                            </div>

                            {result.safety_disclaimer && (
                                <p className="text-xs leading-relaxed text-[var(--muted)]">
                                    {result.safety_disclaimer}
                                </p>
                            )}

                            {(result.recommended_treks || []).length > 0 && (
                                <Card className="p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h4 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                                            Similar treks
                                        </h4>
                                        <Badge variant="default">
                                            {getEstimateSourceLabel(result.recommend_source)}
                                        </Badge>
                                    </div>
                                    <ul className="grid gap-3 sm:grid-cols-2">
                                        {(result.recommended_treks || []).map((trek) => (
                                            <li
                                                key={trek.id}
                                                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-muted)]/50 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-semibold leading-snug">
                                                        {trek.trek_name}
                                                    </p>
                                                    {trek.difficulty && (
                                                        <Badge
                                                            variant={getDifficultyVariant(trek.difficulty)}
                                                        >
                                                            {trek.difficulty}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-xs text-[var(--muted)]">
                                                    {(trek.max_altitude || 0).toLocaleString()} m ·{' '}
                                                    {trek.duration_days || '—'} days
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}

                            <PackingChecklistResults items={result.recommended_gear || []} />

                            {onRequestItinerary && (
                                <Card className="border-[var(--accent)]/25 bg-[var(--accent-soft)] p-5">
                                    <p className="text-sm font-semibold text-[var(--accent)]">
                                        Ready for a day-by-day plan?
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--muted)]">
                                        Carry these details into the full itinerary tab (permits, days,
                                        transport).
                                    </p>
                                    <Button
                                        className="mt-4"
                                        variant="primary"
                                        onClick={() =>
                                            onRequestItinerary({
                                                destination:
                                                    formData.destination.trim() ||
                                                    `Trek (${formData.altitude || '?'} m)`,
                                                altitude: formData.altitude,
                                                duration: formData.duration,
                                                season: formData.season,
                                                trek_type: formData.trek_type,
                                            })
                                        }
                                    >
                                        Continue to full itinerary
                                    </Button>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <EmptyState
                            title="Waiting for trip details"
                            description="Fill the form to generate risk, budget, trek matches, and gear."
                        />
                    )}
                </section>
            </div>

            <WeatherPanel destination={formData.destination} />
        </div>
    );
}
