'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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
            router.push('/dashboard');
        } catch {
            setErrors({ general: 'Something went wrong. Please try again later.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer className="flex min-h-[70vh] flex-col items-center justify-center">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
                        Join TrekPal
                    </h1>
                    <p className="mt-2 text-[var(--muted)]">
                        Set your experience level and start preparing smarter.
                    </p>
                </div>

                <Card className="p-8">
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
