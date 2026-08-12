'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageContainer from '@/components/PageContainer';

export default function SignupPage() {
    const router = useRouter();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        experience_level: 'Beginner',
        goal: 'plan',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.full_name) newErrors.full_name = 'Please enter your name';
        if (!formData.email) newErrors.email = 'Please enter your email';
        if (!formData.password) newErrors.password = 'Please create a password';
        else if (formData.password.length < 6)
            newErrors.password = 'Password must be at least 6 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await signup(
                formData.full_name,
                formData.email,
                formData.password,
                formData.experience_level
            );
            if (typeof window !== 'undefined') {
                localStorage.setItem('trekpal_onboarding_goal', formData.goal);
            }
            router.push(formData.goal === 'research' ? '/treks' : '/dashboard');
        } catch (err) {
            if (err instanceof ApiError && err.status === 400) {
                setErrors({
                    general: err.message || 'Could not create account. Try a different email.',
                });
            } else {
                setErrors({
                    general:
                        'Could not reach TrekPal right now. Check your connection and try again.',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer className="relative flex min-h-[75vh] flex-col items-center justify-center">
            <div
                className="ambient-orb right-1/4 top-20 h-52 w-52 bg-[var(--accent-soft)]"
                aria-hidden
            />
            <div className="relative w-full max-w-md">
                <div className="mb-10 text-center">
                    <p className="eyebrow">Join TrekPal</p>
                    <h1 className="display-title mt-3 text-4xl sm:text-5xl">
                        Meet your trail buddy
                    </h1>
                    <p className="mt-3 text-[var(--muted)]">
                        Set your experience level and start preparing for Nepal.
                    </p>
                </div>

                <Card className="glass-panel p-8 sm:p-9" spotlight>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                        {errors.general && (
                            <div className="mb-4 rounded-[var(--radius)] border border-[var(--danger)]/30 bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger)]">
                                {errors.general}
                            </div>
                        )}

                        <Input
                            label="Full name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            error={errors.full_name}
                            placeholder="Your name"
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="you@example.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="At least 6 characters"
                            required
                        />

                        <Select
                            label="Experience level"
                            name="experience_level"
                            value={formData.experience_level}
                            onChange={handleChange}
                            options={[
                                { value: 'Beginner', label: 'Beginner' },
                                { value: 'Intermediate', label: 'Intermediate' },
                                { value: 'Advanced', label: 'Advanced' },
                            ]}
                        />

                        <Select
                            label="What brings you here?"
                            name="goal"
                            value={formData.goal}
                            onChange={handleChange}
                            options={[
                                { value: 'plan', label: 'Start planning a trek I’ve picked' },
                                { value: 'research', label: 'Research which trek fits me' },
                            ]}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            size="lg"
                            disabled={isLoading}
                            className="mt-2"
                        >
                            {isLoading ? 'Creating account…' : 'Create account'}
                        </Button>

                        <p className="mt-4 text-center text-xs leading-relaxed text-[var(--muted)]">
                            By creating an account you agree to our{' '}
                            <Link
                                href="/terms"
                                className="font-semibold text-[var(--accent)] hover:underline"
                            >
                                Terms
                            </Link>{' '}
                            and{' '}
                            <Link
                                href="/privacy"
                                className="font-semibold text-[var(--accent)] hover:underline"
                            >
                                Privacy
                            </Link>
                            . TrekPal is not medical or emergency advice.
                        </p>
                    </form>

                    <p className="mt-8 border-t border-[var(--border)] pt-6 text-center text-sm text-[var(--muted)]">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
                        >
                            Sign in
                        </Link>
                    </p>
                </Card>
            </div>
        </PageContainer>
    );
}
