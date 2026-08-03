'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import PageContainer from '@/components/PageContainer';
import PrepareTrekPanel from '@/components/PrepareTrekPanel';
import WeatherPanel from '@/components/WeatherPanel';
import { PageHeader, EmptyState, LoadingBlock } from '@/components/ui';
import { tripPlanApi } from '@/lib/api';
import type { TripPlanContent, TripPlanDetail, TripPlanSummary } from '@/lib/types';
import { getDifficultyVariant, getRiskVariant } from '@/lib/badgeHelpers';

type PlanTab = 'checklist' | 'itinerary';

type FormErrors = {
    destination?: string;
    altitude?: string;
    duration_days?: string;
    general?: string;
};

function asStringList(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === 'string');
}

function PlanTripInner() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const planIdParam = searchParams.get('plan');
    const tab: PlanTab = tabParam === 'itinerary' || planIdParam ? 'itinerary' : 'checklist';

    const setTab = (next: PlanTab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', next);
        params.delete('plan');
        router.replace(`/planner?${params.toString()}`);
    };

    const [formData, setFormData] = useState({
        destination: 'Everest Base Camp',
        difficulty: 'Hard',
        season: 'Autumn',
        altitude: '5364',
        duration_days: '14',
        traveler_type: 'nepali',
    });
    const [prefill, setPrefill] = useState({
        destination: '',
        altitude: '',
        duration: '',
        difficulty: 'Easy',
        season: 'Spring',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [plan, setPlan] = useState<TripPlanDetail | null>(null);
    const [savedPlans, setSavedPlans] = useState<TripPlanSummary[]>([]);
    const [loadingSaved, setLoadingSaved] = useState(true);

    const loadSaved = async () => {
        try {
            const data = await tripPlanApi.list();
            setSavedPlans(data || []);
        } catch (error) {
            console.error('Failed to load trip plans:', error);
        } finally {
            setLoadingSaved(false);
        }
    };

    useEffect(() => {
        void loadSaved();
    }, []);

    // Prefill from Treks catalog deep links.
    useEffect(() => {
        const destination = searchParams.get('destination') || '';
        const altitude = searchParams.get('altitude') || '';
        const duration = searchParams.get('duration') || '';
        const difficulty = searchParams.get('difficulty') || '';
        const season = searchParams.get('season') || '';
        if (!destination && !altitude && !duration && !difficulty) return;

        setPrefill({
            destination,
            altitude,
            duration,
            difficulty: difficulty || 'Easy',
            season: season || 'Spring',
        });
        setFormData((prev) => ({
            ...prev,
            destination: destination || prev.destination,
            altitude: altitude || prev.altitude,
            duration_days: duration || prev.duration_days,
            difficulty: difficulty || prev.difficulty,
            season: season || prev.season,
        }));
    }, [searchParams]);

    useEffect(() => {
        if (!planIdParam) return;
        const id = Number(planIdParam);
        if (!Number.isFinite(id)) return;
        void (async () => {
            try {
                const detail = await tripPlanApi.get(id);
                setPlan(detail as TripPlanDetail);
            } catch (error) {
                console.error('Failed to open saved itinerary:', error);
            }
        })();
    }, [planIdParam]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: undefined, general: undefined });
    };

    const validate = () => {
        const next: FormErrors = {};
        if (!formData.destination.trim()) next.destination = 'Enter a destination';
        if (!formData.altitude) next.altitude = 'Enter altitude';
        else if (parseInt(formData.altitude, 10) < 1) next.altitude = 'Altitude must be positive';
        if (!formData.duration_days) next.duration_days = 'Enter duration';
        else if (parseInt(formData.duration_days, 10) < 1) next.duration_days = 'Min 1 day';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !user) return;
        setIsGenerating(true);
        setErrors({});
        try {
            const result = await tripPlanApi.generate({
                destination: formData.destination.trim(),
                duration_days: parseInt(formData.duration_days, 10),
                season: formData.season,
                experience_level: user.experience_level,
                difficulty: formData.difficulty,
                altitude: parseInt(formData.altitude, 10),
                traveler_type: formData.traveler_type as 'nepali' | 'foreign',
            });
            setPlan(result as TripPlanDetail);
            await loadSaved();
        } catch {
            setErrors({
                general:
                    'Could not generate a plan. Check that you are logged in and the API is running.',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const content = (plan?.plan || {}) as TripPlanContent;
    const itinerary = Array.isArray(content.itinerary) ? content.itinerary : [];
    const prep = Array.isArray(content.preparation_schedule) ? content.preparation_schedule : [];

    return (
        <PageContainer className="pb-16">
            <PageHeader
                title="Plan your trek"
                description="One place for packing checklists and full day-by-day itineraries — pick the depth you need."
            />

            <div className="mb-8 flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
                <button
                    type="button"
                    onClick={() => setTab('checklist')}
                    className={`rounded-[var(--radius)] px-4 py-2 text-sm font-semibold ${
                        tab === 'checklist'
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-[var(--surface-muted)] text-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                >
                    Quick checklist
                </button>
                <button
                    type="button"
                    onClick={() => setTab('itinerary')}
                    className={`rounded-[var(--radius)] px-4 py-2 text-sm font-semibold ${
                        tab === 'itinerary'
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-[var(--surface-muted)] text-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                >
                    Full itinerary
                </button>
            </div>

            {tab === 'checklist' ? (
                <PrepareTrekPanel
                    initialDestination={prefill.destination}
                    initialAltitude={prefill.altitude}
                    initialDuration={prefill.duration}
                    initialTrekType={prefill.difficulty}
                    initialSeason={prefill.season}
                    onRequestItinerary={(draft) => {
                        setFormData((prev) => ({
                            ...prev,
                            destination: draft.destination.trim() || prev.destination,
                            altitude: draft.altitude || prev.altitude,
                            duration_days: draft.duration || prev.duration_days,
                            season: draft.season || prev.season,
                            difficulty: draft.trek_type || prev.difficulty,
                        }));
                        setTab('itinerary');
                    }}
                />
            ) : (
                <div className="space-y-6">
                    <WeatherPanel destination={formData.destination} />
                <div className="grid items-start gap-10 lg:grid-cols-[360px_1fr]">
                    <section className="space-y-6">
                        <Card className="p-6">
                            <form onSubmit={handleGenerate} className="flex flex-col gap-2">
                                {errors.general && (
                                    <div className="mb-3 rounded-[var(--radius)] border border-[var(--danger)]/30 bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger)]">
                                        {errors.general}
                                    </div>
                                )}

                                <Input
                                    label="Destination"
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    error={errors.destination}
                                    placeholder="e.g. Annapurna Circuit"
                                    required
                                />

                                <Select
                                    label="Traveler type"
                                    name="traveler_type"
                                    value={formData.traveler_type}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'nepali', label: 'Nepali citizen / local' },
                                        { value: 'foreign', label: 'Foreign visitor' },
                                    ]}
                                />
                                <p className="mb-3 -mt-1 text-xs text-[var(--muted)]">
                                    Nepali travelers usually do not need TIMS; foreign visitors typically do.
                                </p>

                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Select
                                        label="Difficulty"
                                        name="difficulty"
                                        value={formData.difficulty}
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
                                        label="Max altitude (m)"
                                        type="number"
                                        name="altitude"
                                        value={formData.altitude}
                                        onChange={handleChange}
                                        error={errors.altitude}
                                        required
                                    />
                                    <Input
                                        label="Duration (days)"
                                        type="number"
                                        name="duration_days"
                                        value={formData.duration_days}
                                        onChange={handleChange}
                                        error={errors.duration_days}
                                        required
                                    />
                                </div>
                                <p className="mb-2 -mt-1 text-xs text-[var(--muted)]">
                                    Tip: EBC plans need about 12–14 days. If you enter too few, TrekPal will
                                    auto-adjust.
                                </p>

                                <p className="mb-2 text-xs text-[var(--muted)]">
                                    Using your profile experience: <strong>{user?.experience_level}</strong>
                                </p>

                                <Button type="submit" fullWidth size="lg" disabled={isGenerating}>
                                    {isGenerating ? 'Generating plan…' : 'Generate trip plan'}
                                </Button>
                            </form>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                Saved plans
                            </h3>
                            {loadingSaved ? (
                                <p className="mt-3 text-sm text-[var(--muted)]">Loading…</p>
                            ) : savedPlans.length === 0 ? (
                                <p className="mt-3 text-sm text-[var(--muted)]">No saved plans yet.</p>
                            ) : (
                                <ul className="mt-4 space-y-3">
                                    {savedPlans.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                className="w-full rounded-[var(--radius)] border border-[var(--border)] px-3 py-3 text-left hover:border-[var(--accent)]/40"
                                                onClick={async () => {
                                                    try {
                                                        const detail = await tripPlanApi.get(item.id);
                                                        setPlan(detail as TripPlanDetail);
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                }}
                                            >
                                                <p className="font-semibold">{item.title}</p>
                                                <p className="mt-1 text-xs text-[var(--muted)]">
                                                    {item.destination} · {item.duration_days} days ·{' '}
                                                    {item.source}
                                                </p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>

                        <button
                            type="button"
                            onClick={() => setTab('checklist')}
                            className="text-sm font-semibold text-[var(--accent)] hover:underline"
                        >
                            ← Back to quick checklist
                        </button>
                    </section>

                    <section>
                        {isGenerating ? (
                            <LoadingBlock label="Building your itinerary with AI…" />
                        ) : !plan ? (
                            <EmptyState
                                title="No plan yet"
                                description="Generate a full trip plan with itinerary, permits, packing, and prep schedule — or start with the quick checklist tab."
                            />
                        ) : (
                            <div className="flex flex-col gap-5">
                                <Card className="p-6 sm:p-8">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                                {content.traveler_type
                                                    ? `${
                                                          content.traveler_type === 'nepali'
                                                              ? 'Nepali traveler'
                                                              : 'Foreign traveler'
                                                      }`
                                                    : 'Trip plan'}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <Badge
                                                    variant={
                                                        plan.source === 'ai' ? 'success' : 'warning'
                                                    }
                                                >
                                                    {plan.source === 'ai'
                                                        ? 'AI-generated plan'
                                                        : 'Template fallback (AI unavailable)'}
                                                </Badge>
                                            </div>
                                            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
                                                {plan.title}
                                            </h2>
                                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                                                {content.summary ||
                                                    `${plan.destination} · ${plan.duration_days} days`}
                                            </p>
                                            <p className="mt-2 text-xs text-[var(--muted)]">
                                                Saved duration: {plan.duration_days} days · Itinerary
                                                days: {itinerary.length}
                                            </p>
                                            {plan.source !== 'ai' && (
                                                <p className="mt-3 text-xs text-[var(--warning)]">
                                                    This plan used the offline template because the AI
                                                    call failed or is not configured. Permits and packing
                                                    are still rule-based and trustworthy.
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant={getDifficultyVariant(plan.difficulty)}>
                                                {plan.difficulty}
                                            </Badge>
                                            {plan.risk_level && (
                                                <Badge variant={getRiskVariant(plan.risk_level)}>
                                                    {plan.risk_level} risk
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                {(content.warnings || []).length > 0 && (
                                    <Card className="border-[var(--warning,#b45309)]/30 p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                            Plan adjustments
                                        </h3>
                                        <ul className="mt-3 space-y-2">
                                            {(content.warnings || []).map((warning) => (
                                                <li
                                                    key={warning}
                                                    className="text-sm leading-relaxed text-[var(--foreground)]"
                                                >
                                                    • {warning}
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}

                                {content.budget && (
                                    <Card className="p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                            Budget
                                        </h3>
                                        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
                                            ${Number(content.budget.mid_usd || 0).toLocaleString()} USD
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                            Range ${Number(content.budget.low_usd || 0).toLocaleString()} – $
                                            {Number(content.budget.high_usd || 0).toLocaleString()}
                                        </p>
                                        {content.budget.notes && (
                                            <p className="mt-3 text-sm text-[var(--muted)]">
                                                {content.budget.notes}
                                            </p>
                                        )}
                                    </Card>
                                )}

                                <Card className="p-6">
                                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                        Day-by-day itinerary
                                    </h3>
                                    <ol className="space-y-4">
                                        {itinerary.map((day) => (
                                            <li
                                                key={day.day}
                                                className="border-b border-[var(--border)] pb-4 last:border-0"
                                            >
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                                                    Day {day.day}
                                                </p>
                                                <p className="mt-1 font-semibold">{day.title}</p>
                                                <p className="mt-1 text-sm text-[var(--muted)]">
                                                    {day.description}
                                                </p>
                                            </li>
                                        ))}
                                    </ol>
                                </Card>

                                <div className="grid gap-5 md:grid-cols-2">
                                    {[
                                        { title: 'Permits', items: asStringList(content.permits) },
                                        { title: 'Packing list', items: asStringList(content.packing_list) },
                                        { title: 'Transport', items: asStringList(content.transport) },
                                        {
                                            title: 'Accommodations',
                                            items: asStringList(content.accommodations),
                                        },
                                    ].map((section) => (
                                        <Card key={section.title} className="p-6">
                                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                                {section.title}
                                            </h3>
                                            <ul className="space-y-2">
                                                {section.items.map((item) => (
                                                    <li
                                                        key={item}
                                                        className="text-sm leading-relaxed text-[var(--foreground)]"
                                                    >
                                                        • {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card>
                                    ))}
                                </div>

                                <Card className="p-6">
                                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                        Preparation schedule
                                    </h3>
                                    <div className="space-y-5">
                                        {prep.map((block) => (
                                            <div key={block.when}>
                                                <p className="font-semibold">{block.when}</p>
                                                <ul className="mt-2 space-y-1">
                                                    {(block.tasks || []).map((task) => (
                                                        <li key={task} className="text-sm text-[var(--muted)]">
                                                            • {task}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {(content.knowledge_sources || []).length > 0 && (
                                    <Card className="p-6">
                                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                                            Knowledge sources
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(content.knowledge_sources || []).map((slug) => (
                                                <Link
                                                    key={slug}
                                                    href={`/knowledge/${slug}`}
                                                    className="text-sm font-semibold text-[var(--accent)] hover:underline"
                                                >
                                                    {slug}
                                                </Link>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}
                    </section>
                </div>
                </div>
            )}
        </PageContainer>
    );
}

export default function PlannerPage() {
    return (
        <ProtectedRoute>
            <Suspense fallback={<PageContainer><LoadingBlock label="Loading planner…" /></PageContainer>}>
                <PlanTripInner />
            </Suspense>
        </ProtectedRoute>
    );
}
