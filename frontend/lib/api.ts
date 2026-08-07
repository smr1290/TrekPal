// API client utility for TrekPal backend
//
// M7: Session JWT lives in an httpOnly cookie set by the API.
// The browser sends it via credentials: 'include'. We no longer store
// the access token in localStorage (XSS could steal it from there).

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
/** Legacy key — cleared on load so old JWTs are not left readable by scripts. */
const LEGACY_TOKEN_KEY = 'trek_pal_token';

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

/** Remove any pre-M7 JWT left in localStorage. */
export function clearLegacyAccessToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LEGACY_TOKEN_KEY);
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

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> | undefined),
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
        });

        if (!response.ok) {
            // Expired / invalid session — clear local profile cache so UI can recover.
            if (response.status === 401 && typeof window !== 'undefined') {
                clearLegacyAccessToken();
                localStorage.removeItem('trek_pal_user');
                window.dispatchEvent(new Event('trekpal:auth-expired'));
            }
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
            throw new ApiError(response.status, formatErrorDetail(error.detail) || 'Request failed');
        }

        // DELETE (and some endpoints) may return an empty body.
        if (response.status === 204) {
            return undefined as T;
        }
        const text = await response.text();
        if (!text) {
            return undefined as T;
        }
        return JSON.parse(text) as T;
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

    logout: async () => {
        return fetchApi<{ ok: boolean }>('/auth/logout', {
            method: 'POST',
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
                image_url?: string | null;
                image_credit?: string | null;
                region?: string | null;
                summary?: string | null;
                best_seasons?: string | null;
                highlights?: string | null;
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

    deleteHistory: async (history_id: number) => {
        return fetchApi<{ ok: boolean; deleted_id: number }>(`/trek/history/${history_id}`, {
            method: 'DELETE',
        });
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
                has_source?: boolean;
                source_label?: string | null;
            }[]
        >(`/knowledge/${query}`);
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
            source_label?: string | null;
            has_source?: boolean;
            disclaimer?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
            related?: {
                id: number;
                title: string;
                slug: string;
                category: string;
                summary: string;
                has_source?: boolean;
                source_label?: string | null;
            }[];
        }>(`/knowledge/${encodeURIComponent(slug)}`);
    },
};

export const chatApi = {
    ask: async (message: string) => {
        return fetchApi<{
            result: {
                answer: string;
                sources: { slug: string; title: string }[];
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

    delete: async (planId: number) => {
        return fetchApi<{ ok: boolean; deleted_id: number }>(`/trip-plans/${planId}`, {
            method: 'DELETE',
        });
    },
};

export const mapsApi = {
    listLocations: async (options?: {
        category?: string;
        region?: string;
        showUnverifiedSafety?: boolean;
        verifiedOnly?: boolean;
    }) => {
        const params = new URLSearchParams();
        if (options?.category) params.set('category', options.category);
        if (options?.region) params.set('region', options.region);
        if (options?.showUnverifiedSafety) params.set('show_unverified_safety', 'true');
        if (options?.verifiedOnly) params.set('verified_only', 'true');
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
                trust_label?: string | null;
            }[]
        >(`/maps/locations${query}`);
    },
};

export const weatherApi = {
    forecast: async (destination: string, days: number = 7) => {
        const params = new URLSearchParams({
            destination,
            days: String(days),
        });
        return fetchApi<{
            destination_label: string;
            latitude: number;
            longitude: number;
            elevation_m?: number | null;
            timezone: string;
            source: string;
            explanation: string;
            warnings: string[];
            days: {
                date: string;
                temp_max_c?: number | null;
                temp_min_c?: number | null;
                precipitation_mm?: number | null;
                snowfall_cm?: number | null;
                wind_max_kmh?: number | null;
                weather_code?: number | null;
                summary: string;
                warnings: string[];
            }[];
            matched_query?: string | null;
        }>(`/weather/forecast?${params.toString()}`);
    },
};
