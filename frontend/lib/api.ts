// API client utility for Trek_Pal backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
            throw new ApiError(response.status, error.detail || 'Request failed');
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new Error('Network error. Please check your connection.');
    }
}

// Authentication APIs
export const authApi = {
    signup: async (full_name: string, email: string, password: string, experience_level: string) => {
        const params = new URLSearchParams({
            full_name,
            email,
            password,
            experience_level,
        });

        return fetchApi<{ message: string; user_id: number }>(
            `/auth/signup?${params.toString()}`,
            { method: 'POST' }
        );
    },

    login: async (email: string, password: string) => {
        const params = new URLSearchParams({
            email,
            password,
        });

        return fetchApi<{
            message: string;
            user_id: number;
            full_name: string;
            experience_level: string;
        }>(`/auth/login?${params.toString()}`, { method: 'POST' });
    },
};

// Trek APIs
export const trekApi = {
    prepareTrek: async (
        user_id: number,
        trek_type: string,
        experience_level: string,
        altitude: number,
        season: string,
        duration: number
    ) => {
        const params = new URLSearchParams({
            user_id: user_id.toString(),
            trek_type,
            experience_level,
            altitude: altitude.toString(),
            season,
            duration: duration.toString(),
        });

        return fetchApi<{
            risk_level: string;
            recommended_gear: {
                gear_name: string;
                photo_url: string;
                description: string;
            }[];
        }>(`/trek/prepare-trek?${params.toString()}`, { method: 'POST' });
    },

    listTreks: async () => {
        return fetchApi<{
            id: number;
            trek_name: string;
            max_altitude: number;
            duration_days: number;
            difficulty: string;
        }[]>('/trek/list');
    },

    getHistory: async (user_id: number) => {
        return fetchApi<{
            history_id: number;
            trek_name: string;
            season: string;
            duration: number;
            risk_level: string;
            date: string;
        }[]>(`/trek/history?user_id=${user_id}`);
    },

    getHistoryDetail: async (history_id: number) => {
        return fetchApi<{
            trek: string;
            season: string;
            duration: number;
            risk_level: string;
            recommended_gear: {
                gear_name: string;
                photo_url: string;
                category: string;
            }[];
        }>(`/trek/history/${history_id}`);
    },
};

// Gear APIs
export const gearApi = {
    listGear: async () => {
        return fetchApi<{
            id: number;
            gear_name: string;
            category: string;
            photo_url: string;
            description: string;
        }[]>('/gear/');
    },
};

export { ApiError };
