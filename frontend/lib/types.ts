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
  input_altitude?: number;
}

export interface RecommendedGearItem {
  gear_name: string;
  photo_url: string;
  category?: string;
  description?: string;
}

export interface TrekHistoryDetail {
  trek: string;
  season: string;
  duration: number;
  risk_level: string;
  input_altitude?: number;
  date?: string;
  recommended_gear: RecommendedGearItem[];
}

export interface TrekPreparationRequest {
  trek_type: string;
  experience_level: string;
  altitude: number;
  season: string;
  duration: number;
}

export interface TrekPreparationResponse {
  risk_level: string;
  risk_source?: string;
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
  recommended_gear: RecommendedGearItem[];
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
  access_token: string;
  token_type: string;
  user_id: number;
  full_name: string;
  experience_level: string;
}

export interface MeResponse {
  user_id: number;
  full_name: string;
  experience_level: string | null;
  email: string;
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

export interface KnowledgeArticle {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  trek_id?: number | null;
}

export interface KnowledgeArticleDetail extends KnowledgeArticle {
  content: string;
  source_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ChatAnswer {
  answer: string;
  sources: string[];
}

export interface ChatResponse {
  result: ChatAnswer;
}

export interface BudgetEstimate {
  low_usd: number;
  mid_usd: number;
  high_usd: number;
  source?: string;
}

export interface TrekRecommendation {
  id: number;
  trek_name: string;
  max_altitude?: number | null;
  duration_days?: number | null;
  difficulty?: string | null;
  match_score?: number | null;
}

export interface MLInsights {
  risk_level: string;
  risk_source: string;
  difficulty: string;
  difficulty_source: string;
  budget: BudgetEstimate;
  recommended_treks: TrekRecommendation[];
  recommend_source: string;
}

export interface TripPlanItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface TripPlanPrepBlock {
  when: string;
  tasks: string[];
}

export interface TripPlanContent {
  title?: string;
  summary?: string;
  itinerary?: TripPlanItineraryDay[];
  budget?: {
    low_usd?: number;
    mid_usd?: number;
    high_usd?: number;
    notes?: string;
  };
  permits?: string[];
  packing_list?: string[];
  transport?: string[];
  accommodations?: string[];
  preparation_schedule?: TripPlanPrepBlock[];
  knowledge_sources?: string[];
}

export interface TripPlanSummary {
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
}

export interface TripPlanDetail extends TripPlanSummary {
  plan: TripPlanContent;
}

export interface MapLocation {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  elevation_m?: number | null;
  region?: string | null;
  description?: string | null;
  trek_id?: number | null;
}
