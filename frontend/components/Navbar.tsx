'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';

type NavLink = { href: string; label: string; public: boolean };

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const isHome = pathname === '/';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const links: NavLink[] = isAuthenticated
        ? [
              { href: '/dashboard', label: 'Dashboard', public: false },
              { href: '/treks', label: 'Treks', public: true },
              { href: '/planner', label: 'Plan trip', public: false },
              { href: '/knowledge', label: 'Knowledge', public: true },
              { href: '/maps', label: 'Maps', public: true },
          ]
        : [
              { href: '/treks', label: 'Treks', public: true },
              { href: '/gear', label: 'Gear', public: true },
              { href: '/knowledge', label: 'Knowledge', public: true },
              { href: '/maps', label: 'Maps', public: true },
          ];

    const accountLinks: NavLink[] = [
        { href: '/history', label: 'My plans', public: false },
        { href: '/gear', label: 'Gear', public: true },
        { href: '/chat', label: 'Chat', public: false },
        { href: '/profile', label: 'Profile', public: false },
    ];

    const linkClass = (href: string) => {
        const active =
            pathname === href ||
            (href === '/planner' &&
                (pathname.startsWith('/planner') || pathname.startsWith('/prepare'))) ||
            (href === '/dashboard' && pathname.startsWith('/dashboard')) ||
            (href === '/history' && pathname.startsWith('/history')) ||
            (href === '/profile' && pathname.startsWith('/profile')) ||
            (href === '/knowledge' && pathname.startsWith('/knowledge'));
        return `rounded-[var(--radius-sm)] px-3 py-2 text-[13px] font-semibold tracking-wide transition-colors ${
            active
                ? isHome && !mobileOpen
                    ? 'bg-white/12 text-white'
                    : 'bg-[var(--accent-soft)] text-[var(--accent)]'
                : isHome && !mobileOpen
                  ? 'text-white/75 hover:bg-white/8 hover:text-white'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]'
        }`;
    };

    const closeMobile = () => setMobileOpen(false);

    return (
        <nav
            className={`nav-shell fixed top-0 left-0 z-50 h-14 w-full transition-[box-shadow,background-color] duration-300 sm:h-[4.25rem] ${
                isHome ? 'nav-glass-home' : 'nav-glass'
            } ${scrolled ? 'nav-elevated' : ''}`}
        >
            <div className="relative mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link
                    href={isAuthenticated ? '/dashboard' : '/'}
                    onClick={closeMobile}
                    className={`group flex items-center gap-2.5 ${
                        isHome ? 'text-white' : 'text-[var(--foreground)]'
                    }`}
                >
                    <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                            isHome
                                ? 'border-white/30 bg-white/10'
                                : 'border-[var(--accent)]/25 bg-[var(--accent-soft)]'
                        }`}
                        aria-hidden
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M3 19L10.5 6l3.5 6 2.5-4L21 19H3z"
                                fill="currentColor"
                                className={isHome ? 'text-white' : 'text-[var(--accent)]'}
                            />
                        </svg>
                    </span>
                    <span className="font-[family-name:var(--font-display)] text-[1.65rem] font-semibold tracking-tight">
                        TrekPal
                    </span>
                </Link>

                <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex">
                    {links.map((link) => (
                        <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2.5">
                    {isAuthenticated ? (
                        <div className="hidden items-center gap-1 sm:flex">
                            {accountLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[11px] font-semibold tracking-wide ${
                                        isHome
                                            ? 'text-white/70 hover:bg-white/10 hover:text-white'
                                            : 'text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    void logout().then(() => {
                                        router.push('/');
                                        closeMobile();
                                    });
                                }}
                                className={`ml-1 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[11px] font-semibold tracking-wide ${
                                    isHome
                                        ? 'text-white/75 hover:bg-white/10 hover:text-white'
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
                                className={`px-3 text-sm font-semibold ${
                                    isHome
                                        ? 'text-white/85 hover:text-white'
                                        : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                                }`}
                            >
                                Login
                            </Link>
                            <Link href="/signup" className="btn-link">
                                <Button
                                    size="sm"
                                    className={
                                        isHome
                                            ? 'bg-white text-[var(--accent-deep)] shadow-none hover:bg-white/90'
                                            : ''
                                    }
                                >
                                    Sign up
                                </Button>
                            </Link>
                        </div>
                    )}

                    <button
                        type="button"
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border md:hidden ${
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
                <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-5 shadow-[var(--shadow-deep)] md:hidden">
                    <div className="flex flex-col gap-1">
                        {[...links, ...(isAuthenticated ? accountLinks : [])].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-semibold ${
                                    pathname === link.href
                                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
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
                                    void logout().then(() => {
                                        router.push('/');
                                        closeMobile();
                                    });
                                }}
                            >
                                Logout{user?.full_name ? ` · ${user.full_name.split(' ')[0]}` : ''}
                            </button>
                        ) : (
                            <div className="btn-row mt-4">
                                <Link href="/login" onClick={closeMobile} className="btn-link">
                                    <Button variant="outline" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/signup" onClick={closeMobile} className="btn-link">
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
