'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, clearLegacyAccessToken } from '@/lib/api';

interface User {
    id: number;
    full_name: string;
    experience_level: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (full_name: string, email: string, password: string, experience_level: string) => Promise<void>;
    updateProfile: (payload: { full_name?: string; experience_level?: string }) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'trek_pal_user';

function cacheUser(setUser: (user: User | null) => void, userData: User) {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const clearSession = () => {
        setUser(null);
        clearLegacyAccessToken();
        localStorage.removeItem(USER_KEY);
    };

    useEffect(() => {
        let cancelled = false;
        const hydrate = async () => {
            // Drop any pre-M7 JWT so scripts cannot read it from localStorage.
            clearLegacyAccessToken();

            try {
                // Cookie is sent automatically with credentials: 'include'.
                // Timeout so a slow/unreachable API cannot leave phones on "Loading…".
                const me = await Promise.race([
                    authApi.me(),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('auth-timeout')), 8000)
                    ),
                ]);
                if (cancelled) return;
                cacheUser(setUser, {
                    id: me.user_id,
                    full_name: me.full_name,
                    experience_level: me.experience_level || '',
                    email: me.email,
                });
            } catch {
                if (!cancelled) clearSession();
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        void hydrate();

        const onExpired = () => {
            setUser(null);
            localStorage.removeItem(USER_KEY);
            clearLegacyAccessToken();
        };
        window.addEventListener('trekpal:auth-expired', onExpired);
        return () => {
            cancelled = true;
            window.removeEventListener('trekpal:auth-expired', onExpired);
        };
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        // access_token is also set as httpOnly cookie by the API — do not store it in JS.
        cacheUser(setUser, {
            id: response.user_id,
            full_name: response.full_name,
            experience_level: response.experience_level || '',
        });
    };

    const signup = async (
        full_name: string,
        email: string,
        password: string,
        experience_level: string
    ) => {
        const response = await authApi.signup(full_name, email, password, experience_level);
        cacheUser(setUser, {
            id: response.user_id,
            full_name: response.full_name,
            experience_level: response.experience_level || '',
        });
    };

    const updateProfile = async (payload: { full_name?: string; experience_level?: string }) => {
        const me = await authApi.updateMe(payload);
        cacheUser(setUser, {
            id: me.user_id,
            full_name: me.full_name,
            experience_level: me.experience_level || '',
            email: me.email,
        });
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Still clear local UI state even if the network call fails.
        }
        clearSession();
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-sm text-[var(--muted)]">
                Loading TrekPal…
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                signup,
                updateProfile,
                logout,
                isAuthenticated: !!user,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
