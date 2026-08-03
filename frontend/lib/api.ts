// API client utility for TrekPal backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'trek_pal_token';

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
    if (typeof window === 'undefined') return;
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

function formatErrorDetail(detail: unknown): string {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        return detail
            .map((item) => {
                if (typeof item === 'string') return item;
                if (item && typeof item === 'object' && 'msg' in item) {
                    return String((item as { msg: string }).msg);
                }
                return JSON.stringify(item);
            })
            .join(', ');
    }
    if (detail && typeof detail === 'object') {
        return JSON.stringify(detail);
    }
    return 'Request failed';
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAccessToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            // Expired / invalid session — clear local auth so UI can recover.
            if (response.status === 401 && typeof window !== 'undefined') {
                setAccessToken(null);
                localStorage.removeItem('trek_pal_user');
                window.dispatchEvent(new Event('trekpal:auth-expired'));
            }
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
            throw new ApiError(response.status, formatErrorDetail(error.detail) || 'Request failed');
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new Error('Network error. Please check your connection.');
    }
}

export const authApi = {
    signup: async (full_name: string, email: string, password: string, experience_level: string) => {
        return fetchApi<{
            access_token: string;
            token_type: string;
            user_id: number;
            full_name: string;
            experience_level: string;
        }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ full_name, email, password, experience_level }),
        });
    },

    login: async (email: string, password: string) => {
        return fetchApi<{
            access_token: string;
            token_type: string;
            user_id: number;
            full_name: string;
            experience_level: string;
        }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    me: async () => {
        return fetchApi<{
            user_id: number;
            full_name: string;
            experience_level: string | null;
            email: string;
        }>('/auth/me');
    },

    updateMe: async (payload: { full_name?: string; experience_level?: string }) => {
        return fetchApi<{
            user_id: number;
            full_name: string;
            experience_level: string | null;
            email: string;
        }>('/auth/me', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    },
};

export const trekApi = {
    prepareTrek: async (
        trek_type: string,
        experience_level: string,
        altitude: number,
        season: string,
        duration: number,
        destination?: string
    ) => {
        return fetchApi<{
            risk_level: string;
            risk_source?: string;
            risk_factors?: string[];
            safety_disclaimer?: string | null;
            ams_note?: string | null;
            budget_estimate?: {
                low_usd: number;
                mid_usd: number;
                high_usd: number;
            } | null;
            budget_source?: string | null;
            recommended_treks?: {
                id: number;
                trek_name: string;
                max_altitude?: number | null;
                duration_days?: number | null;
                difficulty?: string | null;
                match_score?: number | null;
            }[] | null;
            recommend_source?: string | null;
            recommended_gear: {
                gear_name: string;
                photo_url: string;
                category?: string;
                description: string;
                priority?: string;
                reason?: string;
                quantity?: string;
                rent_hint?: string;
                slug?: string;
            }[];
        }>('/trek/prepare-trek', {
            method: 'POST',
            body: JSON.stringify({
                trek_type,
                experience_level,
                altitude,
                season,
                duration,
                destination: destination || null,
            }),
        });
    },

    listTreks: async () => {
        return fetchApi<
            {
                id: number;
                trek_name: string;
                max_altitude: number;
                duration_days: number;
                difficulty: string;
            }[]
        >('/trek/list');
    },

    getHistory: async () => {
        return fetchApi<
            {
                history_id: number;
                trek_name: string;
                season: string;
                duration: number;
                risk_level: string;
                date: string;
                input_altitude: number;
                destination?: string | null;
                trek_type?: string | null;
            }[]
        >('/trek/history');
    },

    getHistoryDetail: async (history_id: number) => {
        return fetchApi<{
            trek: string;
            season: string;
            duration: number;
            risk_level: string;
            input_altitude: number;
            date: string;
            destination?: string | null;
            trek_type?: string | null;
            recommended_gear: {
                gear_name: string;
                photo_url: string;
                category?: string;
                description?: string;
                priority?: string;
                reason?: string;
                quantity?: string;
                rent_hint?: string;
                slug?: string;
            }[];
        }>(`/trek/history/${history_id}`);
    },
};

export const gearApi = {
    listGear: async () => {
        return fetchApi<
            {
                id: number;
                gear_name: string;
                category: string;
                photo_url: string;
                description: string;
            }[]
        >('/gear/');
    },
};

export const knowledgeApi = {
    listArticles: async (category?: string) => {
        const query = category ? `?category=${encodeURIComponent(category)}` : '';
        return fetchApi<
            {
                id: number;
                title: string;
                slug: string;
                category: string;
                summary: string;
                trek_id?: number | null;
            }[]
        >(`/knowledge${query}`);
    },

    getArticle: async (slug: string) => {
        return fetchApi<{
            id: number;
            title: string;
            slug: string;
            category: string;
            summary: string;
            content: string;
            trek_id?: number | null;
            source_url?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
        }>(`/knowledge/${encodeURIComponent(slug)}`);
    },
};

export const chatApi = {
    ask: async (message: string) => {
        return fetchApi<{
            result: {
                answer: string;
                sources: string[];
            };
        }>('/chat/ask', {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
    },
};

export const tripPlanApi = {
    generate: async (payload: {
        destination: string;
        duration_days: number;
        season: string;
        experience_level: string;
        difficulty: string;
        altitude: number;
        trek_id?: number | null;
        traveler_type?: 'nepali' | 'foreign';
    }) => {
        return fetchApi<{
            id: number;
            title: string;
            destination: string;
            season: string;
            duration_days: number;
            experience_level: string;
            difficulty: string;
            risk_level?: string | null;
            source: string;
            plan: Record<string, unknown>;
            created_at?: string | null;
        }>('/trip-plans/generate', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    list: async () => {
        return fetchApi<
            {
                id: number;
                title: string;
                destination: string;
                season: string;
                duration_days: number;
                experience_level: string;
                difficulty: string;
                risk_level?: string | null;
                source: string;
                created_at?: string | null;
            }[]
        >('/trip-plans/');
    },

    get: async (planId: number) => {
        return fetchApi<{
            id: number;
            title: string;
            destination: string;
            season: string;
            duration_days: number;
            experience_level: string;
            difficulty: string;
            risk_level?: string | null;
            source: string;
            plan: Record<string, unknown>;
            created_at?: string | null;
        }>(`/trip-plans/${planId}`);
    },
};

export const mapsApi = {
    listLocations: async (
        category?: string,
        region?: string,
        showUnverifiedSafety: boolean = false
    ) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (region) params.set('region', region);
        if (showUnverifiedSafety) params.set('show_unverified_safety', 'true');
        const query = params.toString() ? `?${params.toString()}` : '';
        return fetchApi<
            {
                id: number;
                name: string;
                category: string;
                latitude: number;
                longitude: number;
                elevation_m?: number | null;
                region?: string | null;
                description?: string | null;
                trek_id?: number | null;
                is_verified?: boolean;
                source_note?: string | null;
            }[]
        >(`/maps/locations${query}`);
    },
};
