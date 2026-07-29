'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const isHome = pathname === '/';

    const links = [
        { href: '/', label: 'Home', public: true },
        { href: '/treks', label: 'Treks', public: true },
        { href: '/gear', label: 'Gear', public: true },
        { href: '/knowledge', label: 'Knowledge', public: true },
        { href: '/chat', label: 'Chat', public: true },
        { href: '/dashboard', label: 'Dashboard', public: false },
        { href: '/prepare', label: 'Prepare', public: false },
        { href: '/planner', label: 'Planner', public: false },
        { href: '/history', label: 'History', public: false },
    ];

    const visibleLinks = links.filter((link) => link.public || isAuthenticated);

    const linkClass = (href: string) =>
        `rounded-[var(--radius)] px-3 py-2 text-sm font-medium ${
            pathname === href
                ? isHome && !mobileOpen
                    ? 'text-white'
                    : 'text-[var(--accent)]'
                : isHome && !mobileOpen
                  ? 'text-white/80 hover:text-white'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
        }`;

    const closeMobile = () => setMobileOpen(false);

    return (
        <nav
            className={`fixed top-0 left-0 z-50 h-16 w-full ${
                isHome
                    ? 'border-b border-white/10 bg-[rgb(21_32_28_/0.35)] backdrop-blur-md'
                    : 'border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md'
            }`}
        >
            <div className="relative mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link
                    href="/"
                    onClick={closeMobile}
                    className={`font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight ${
                        isHome ? 'text-white' : 'text-[var(--foreground)]'
                    }`}
                >
                    TrekPal
                </Link>

                <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
                    {visibleLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="hidden items-center gap-3 sm:flex">
                            <span
                                className={`text-xs ${isHome ? 'text-white/70' : 'text-[var(--muted)]'}`}
                            >
                                {user?.full_name.split(' ')[0]}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    logout();
                                    router.push('/');
                                    closeMobile();
                                }}
                                className={`text-xs font-semibold ${
                                    isHome
                                        ? 'text-white/80 hover:text-white'
                                        : 'text-[var(--muted)] hover:text-[var(--danger)]'
                                }`}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Link
                                href="/login"
                                className={`px-2 text-sm font-medium ${
                                    isHome
                                        ? 'text-white/85 hover:text-white'
                                        : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                                }`}
                            >
                                Login
                            </Link>
                            <Link href="/signup">
                                <Button size="sm">Sign up</Button>
                            </Link>
                        </div>
                    )}

                    <button
                        type="button"
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius)] border md:hidden ${
                            isHome
                                ? 'border-white/25 text-white'
                                : 'border-[var(--border)] text-[var(--foreground)]'
                        }`}
                        aria-expanded={mobileOpen}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        onClick={() => setMobileOpen((open) => !open)}
                    >
                        <span className="flex flex-col gap-1.5" aria-hidden>
                            <span className="block h-0.5 w-4 bg-current" />
                            <span className="block h-0.5 w-4 bg-current" />
                            <span className="block h-0.5 w-4 bg-current" />
                        </span>
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 md:hidden">
                    <div className="flex flex-col gap-1">
                        {visibleLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-[var(--radius)] px-3 py-2 text-sm font-medium ${
                                    pathname === link.href
                                        ? 'text-[var(--accent)]'
                                        : 'text-[var(--muted)]'
                                }`}
                                onClick={closeMobile}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="mt-4 border-t border-[var(--border)] pt-4">
                        {isAuthenticated ? (
                            <button
                                type="button"
                                className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--danger)]"
                                onClick={() => {
                                    logout();
                                    router.push('/');
                                    closeMobile();
                                }}
                            >
                                Logout
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <Link href="/login" onClick={closeMobile}>
                                    <Button variant="outline" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/signup" onClick={closeMobile}>
                                    <Button size="sm">Sign up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
