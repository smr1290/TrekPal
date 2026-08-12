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
  image_url?: string | null;
  image_credit?: string | null;
  region?: string | null;
  summary?: string | null;
  best_seasons?: string | null;
  highlights?: string | null;
}

export interface Gear {
  id: number;
  gear_name: string;
  category: string;
  photo_url?: string | null;
  description: string;
  slug?: string;
  quantity_hint?: string;
  rent_hint?: string;
}

export interface TrekHistory {
  history_id: number;
  trek_name: string;
  season: string;
  duration: number;
  risk_level: string;
  date: string;
  input_altitude?: number;
  destination?: string | null;
  trek_type?: string | null;
}

export interface RecommendedGearItem {
  gear_name: string;
  photo_url: string;
  category?: string;
  description?: string;
  priority?: 'essential' | 'recommended' | 'optional' | string;
  reason?: string;
  quantity?: string;
  rent_hint?: string;
  slug?: string;
}

export interface TrekHistoryDetail {
  trek: string;
  season: string;
  duration: number;
  risk_level: string;
  input_altitude?: number;
  date?: string;
  destination?: string | null;
  trek_type?: string | null;
  heuristic_version?: string | null;
  risk_factors?: string[];
  recommended_gear: RecommendedGearItem[];
}

export interface TrekPreparationRequest {
  trek_type: string;
  experience_level: string;
  altitude: number;
  season: string;
  duration: number;
  destination?: string;
}

export interface TrekPreparationResponse {
  risk_level: string;
  risk_source?: string;
  risk_factors?: string[];
  heuristic_version?: string | null;
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
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  trek_id?: number | null;
  has_source?: boolean;
  source_label?: string | null;
}

export interface KnowledgeArticleDetail extends KnowledgeArticle {
  content: string;
  source_url?: string | null;
  disclaimer?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  related?: KnowledgeArticle[];
}

export interface ChatSource {
  slug: string;
  title: string;
}

export interface ChatAnswer {
  answer: string;
  sources: ChatSource[];
  source?: 'ai' | 'knowledge_fallback';
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
  warnings?: string[];
  traveler_type?: string;
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
  is_verified?: boolean;
  source_note?: string | null;
  trust_label?: string | null;
}

export interface WeatherDay {
  date: string;
  temp_max_c?: number | null;
  temp_min_c?: number | null;
  precipitation_mm?: number | null;
  snowfall_cm?: number | null;
  wind_max_kmh?: number | null;
  weather_code?: number | null;
  summary: string;
  warnings: string[];
}

export interface WeatherForecast {
  destination_label: string;
  latitude: number;
  longitude: number;
  elevation_m?: number | null;
  timezone: string;
  source: string;
  explanation: string;
  warnings: string[];
  days: WeatherDay[];
  matched_query?: string | null;
}

export interface WeatherDay {
  date: string;
  temp_max_c?: number | null;
  temp_min_c?: number | null;
  precipitation_mm?: number | null;
  snowfall_cm?: number | null;
  wind_max_kmh?: number | null;
  weather_code?: number | null;
  summary: string;
  warnings: string[];
}

export interface WeatherForecast {
  destination_label: string;
  latitude: number;
  longitude: number;
  elevation_m?: number | null;
  timezone: string;
  source: string;
  explanation: string;
  warnings: string[];
  days: WeatherDay[];
  matched_query?: string | null;
}
