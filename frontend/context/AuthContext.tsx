'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, setAccessToken, getAccessToken } from '@/lib/api';

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
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'trek_pal_user';

function applySession(
    setUser: (user: User | null) => void,
    data: {
        access_token: string;
        user_id: number;
        full_name: string;
        experience_level: string | null;
    }
) {
    setAccessToken(data.access_token);
    const userData: User = {
        id: data.user_id,
        full_name: data.full_name,
        experience_level: data.experience_level || '',
    };
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const clearSession = () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem(USER_KEY);
    };

    useEffect(() => {
        const hydrate = async () => {
            const token = getAccessToken();
            if (!token) {
                localStorage.removeItem(USER_KEY);
                setUser(null);
                setIsLoading(false);
                return;
            }

            try {
                const me = await authApi.me();
                const userData: User = {
                    id: me.user_id,
                    full_name: me.full_name,
                    experience_level: me.experience_level || '',
                    email: me.email,
                };
                setUser(userData);
                localStorage.setItem(USER_KEY, JSON.stringify(userData));
            } catch {
                clearSession();
            } finally {
                setIsLoading(false);
            }
        };

        void hydrate();

        const onExpired = () => {
            setUser(null);
            localStorage.removeItem(USER_KEY);
        };
        window.addEventListener('trekpal:auth-expired', onExpired);
        return () => window.removeEventListener('trekpal:auth-expired', onExpired);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        applySession(setUser, response);
    };

    const signup = async (
        full_name: string,
        email: string,
        password: string,
        experience_level: string
    ) => {
        const response = await authApi.signup(full_name, email, password, experience_level);
        applySession(setUser, response);
    };

    const updateProfile = async (payload: { full_name?: string; experience_level?: string }) => {
        const me = await authApi.updateMe(payload);
        const userData: User = {
            id: me.user_id,
            full_name: me.full_name,
            experience_level: me.experience_level || '',
            email: me.email,
        };
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    };

    const logout = () => {
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
