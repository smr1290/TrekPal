// TypeScript type definitions for Trek_Pal

export interface User {
  id: number;
  full_name: string;
  email: string;
  experience_level: string;
  created_at?: string;
}

export interface Trek {
  id: number;
  trek_name: string;
  max_altitude: number;
  duration_days: number;
  difficulty: string;
}

export interface Gear {
  id: number;
  gear_name: string;
  category: string;
  photo_url: string;
  description: string;
}

export interface TrekHistory {
  history_id: number;
  trek_name: string;
  season: string;
  duration: number;
  risk_level: string;
  date: string;
}

export interface TrekHistoryDetail {
  trek: string;
  season: string;
  duration: number;
  risk_level: string;
  recommended_gear: {
    gear_name: string;
    photo_url: string;
    category: string;
  }[];
}

export interface TrekPreparationRequest {
  user_id: number;
  trek_type: string;
  experience_level: string;
  altitude: number;
  season: string;
  duration: number;
}

export interface TrekPreparationResponse {
  risk_level: string;
  recommended_gear: {
    gear_name: string;
    photo_url: string;
    description: string;
  }[];
}

export interface SignupRequest {
  full_name: string;
  email: string;
  password: string;
  experience_level: string;
}

export interface SignupResponse {
  message: string;
  user_id: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user_id: number;
  full_name: string;
  experience_level: string;
}

export interface AuthContextType {
  user: {
    id: number;
    full_name: string;
    experience_level: string;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (full_name: string, email: string, password: string, experience_level: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
