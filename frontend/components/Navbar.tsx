'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from './Button';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const navLinks = [
        { href: '/', label: 'Home', public: true },
        { href: '/treks', label: 'Treks', public: true },
        { href: '/gear', label: 'Gear', public: true },
        { href: '/dashboard', label: 'Dashboard', public: false },
        { href: '/prepare', label: 'Prepare Trek', public: false },
        { href: '/history', label: 'History', public: false },
    ];

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <nav className="sticky top-0 z-50 glass border-b border-[var(--border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl">🏔️</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                            TrekPal
                        </span>
                    </Link>

                    {/* Mobile menu toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        className="md:hidden inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
                        aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    >
                        <span aria-hidden="true">{mobileMenuOpen ? '✕' : '☰'}</span>
                    </button>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => {
                            if (!link.public && !isAuthenticated) return null;

                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'text-[var(--foreground)] hover:bg-[var(--primary)] hover:bg-opacity-10'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
                        {isAuthenticated ? (
                            <>
                                <span className="hidden sm:inline text-sm text-[var(--muted)]">
                                    Welcome, <span className="font-medium text-[var(--foreground)]">{user?.full_name}</span>
                                </span>
                                <Button variant="outline" size="sm" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="outline" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button variant="primary" size="sm">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile navigation links */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-[var(--border)] pt-3 pb-4">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                if (!link.public && !isAuthenticated) return null;

                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`px-3 py-2 rounded-lg font-medium text-sm ${
                                            isActive
                                                ? 'bg-[var(--primary)] text-white'
                                                : 'text-[var(--foreground)] hover:bg-[var(--primary)] hover:bg-opacity-10'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
