'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageContainer from '@/components/PageContainer';
import { PageHeader } from '@/components/ui';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        experience_level: user?.experience_level || 'Beginner',
    });
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
        if (!user) return;
        setFormData({
            full_name: user.full_name,
            experience_level: user.experience_level || 'Beginner',
        });
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage(null);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.full_name.trim()) {
            setError('Name cannot be empty');
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            await updateProfile({
                full_name: formData.full_name.trim(),
                experience_level: formData.experience_level,
            });
            setMessage('Profile saved. Plan trip will use your updated experience level.');
        } catch {
            setError('Could not save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <PageContainer>
                <PageHeader
                    eyebrow="Your trail identity"
                    title="Profile"
                    description="Update your name and trek experience — this feeds risk and gear recommendations."
                />

                <Card className="mx-auto max-w-lg p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                        {error && (
                            <div className="mb-3 rounded-[var(--radius)] border border-[var(--danger)]/30 bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger)]">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="mb-3 rounded-[var(--radius)] border border-[var(--success)]/30 bg-[var(--success-bg)] p-3 text-sm text-[var(--success)]">
                                {message}
                            </div>
                        )}

                        {user?.email && (
                            <div className="mb-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                    Email
                                </p>
                                <p className="mt-1 text-sm font-medium">{user.email}</p>
                            </div>
                        )}

                        <Input
                            label="Full name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
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
                        <p className="mb-3 -mt-1 text-xs text-[var(--muted)]">
                            Beginners get more essential safety gear weight; advanced trekkers get a
                            tighter list.
                        </p>

                        <Button type="submit" fullWidth size="lg" disabled={isSaving}>
                            {isSaving ? 'Saving…' : 'Save profile'}
                        </Button>
                    </form>
                </Card>
            </PageContainer>
        </ProtectedRoute>
    );
}
