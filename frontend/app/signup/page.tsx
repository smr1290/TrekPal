'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function SignupPage() {
    const router = useRouter();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        experience_level: 'Beginner',
    });
    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: undefined });
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.full_name) {
            newErrors.full_name = 'Full name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            await signup(formData.full_name, formData.email, formData.password, formData.experience_level);
            router.push('/login?signup=success');
        } catch (error: any) {
            setErrors({ general: error.message || 'Signup failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const experienceLevels = [
        { value: 'Beginner', label: 'Beginner' },
        { value: 'Intermediate', label: 'Intermediate' },
        { value: 'Advanced', label: 'Advanced' },
        { value: 'Expert', label: 'Expert' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)]">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Join TrekPal</h1>
                    <p className="text-white text-opacity-90">Start your trekking adventure today</p>
                </div>

                <Card glass>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {errors.general && (
                            <div className="p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-30 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            error={errors.full_name}
                            placeholder="John Doe"
                            required
                        />

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
                            helperText="At least 6 characters"
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            placeholder="••••••••"
                            required
                        />

                        <Select
                            label="Experience Level"
                            name="experience_level"
                            value={formData.experience_level}
                            onChange={handleChange}
                            options={experienceLevels}
                            required
                        />

                        <Button
                            type="submit"
                            fullWidth
                            disabled={isLoading}
                            size="lg"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[var(--muted)]">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
