'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error for this field
        setErrors({ ...errors, [e.target.name]: undefined });
    };

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            await login(formData.email, formData.password);
            router.push('/dashboard');
        } catch (error: any) {
            setErrors({ general: error.message || 'Login failed. Please check your credentials.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)]">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
                    <p className="text-white text-opacity-90">Sign in to continue your trek journey</p>
                </div>

                <Card glass>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.general && (
                            <div className="p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-30 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="your@email.com"
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
                            fullWidth
                            disabled={isLoading}
                            size="lg"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[var(--muted)]">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-[var(--primary)] font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
