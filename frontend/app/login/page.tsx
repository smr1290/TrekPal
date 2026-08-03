'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageContainer from '@/components/PageContainer';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>(
        {}
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
    };

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!formData.email) newErrors.email = 'Please enter your email';
        if (!formData.password) newErrors.password = 'Please enter your password';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await login(formData.email, formData.password);
            const next = new URLSearchParams(window.location.search).get('next');
            const safeNext =
                next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
            router.push(safeNext);
        } catch {
            setErrors({ general: 'Invalid email or password. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer className="flex min-h-[75vh] flex-col items-center justify-center">
            <div className="w-full max-w-md">
                <div className="mb-10 text-center">
                    <p className="eyebrow justify-center">Welcome back</p>
                    <h1 className="display-title mt-3 text-4xl sm:text-5xl">Sign in</h1>
                    <p className="mt-3 text-[var(--muted)]">
                        Your trail buddy is waiting.
                    </p>
                </div>

                <Card className="p-8 sm:p-9">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                        {errors.general && (
                            <div className="mb-4 rounded-[var(--radius)] border border-[var(--danger)]/30 bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger)]">
                                {errors.general}
                            </div>
                        )}

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
                            placeholder="••••••••"
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            size="lg"
                            disabled={isLoading}
                            className="mt-2"
                        >
                            {isLoading ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </form>

                    <p className="mt-8 border-t border-[var(--border)] pt-6 text-center text-sm text-[var(--muted)]">
                        New to TrekPal?{' '}
                        <Link
                            href="/signup"
                            className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
                        >
                            Create an account
                        </Link>
                    </p>
                </Card>
            </div>
        </PageContainer>
    );
}
