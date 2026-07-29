from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    experience_level: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    full_name: str
    experience_level: str | None = None


class SignupResponse(BaseModel):
    message: str
    user_id: int


class UserMeResponse(BaseModel):
    user_id: int
    full_name: str
    experience_level: str | None = None
    email: str


# ---------- Catalog ----------


class TrekListItem(BaseModel):
    id: int
    trek_name: str
    max_altitude: int | None = None
    duration_days: int | None = None
    difficulty: str | None = None


class GearListItem(BaseModel):
    id: int
    gear_name: str
    category: str | None = None
    photo_url: str | None = None
    description: str | None = None


# ---------- Prepare / History ----------


class PrepareTrekRequest(BaseModel):
    trek_type: str
    experience_level: str
    altitude: int = Field(gt=0)
    season: str
    duration: int = Field(gt=0)


class RecommendedGearItem(BaseModel):
    gear_name: str
    photo_url: str | None = None
    category: str | None = None
    description: str | None = None


class PrepareTrekResponse(BaseModel):
    risk_level: str
    risk_source: str = "rules"  # "ml" | "rules"
    recommended_gear: list[RecommendedGearItem]
    budget_estimate: dict[str, float] | None = None
    budget_source: str | None = None
    recommended_treks: list[dict] | None = None
    recommend_source: str | None = None


class HistoryListItem(BaseModel):
    history_id: int
    trek_name: str | None = None
    season: str | None = None
    duration: int | None = None
    risk_level: str | None = None
    date: datetime | None = None
    input_altitude: int | None = None


class HistoryDetailResponse(BaseModel):
    trek: str | None = None
    season: str | None = None
    duration: int | None = None
    risk_level: str | None = None
    input_altitude: int | None = None
    date: datetime | None = None
    recommended_gear: list[RecommendedGearItem]


class HealthResponse(BaseModel):
    message: str


# ---------- Knowledge base ----------


class KnowledgeArticleListItem(BaseModel):
    id: int
    title: str
    slug: str
    category: str
    summary: str
    trek_id: int | None = None


class KnowledgeArticleDetail(BaseModel):
    id: int
    title: str
    slug: str
    category: str
    summary: str
    content: str
    trek_id: int | None = None
    source_url: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


# ---------- AI Chat (Phase 3) ----------


class ChatRequest(BaseModel):
    message: str


class ChatAnswer(BaseModel):
    answer: str
    sources: list[str]  # list of knowledge article slugs used for grounding


class ChatResponse(BaseModel):
    result: ChatAnswer


# ---------- Machine Learning (Phase 4) ----------


class MLFeatureRequest(BaseModel):
    altitude: int = Field(gt=0)
    experience_level: str
    trek_type: str
    season: str
    duration: int = Field(gt=0)


class DifficultyRequest(BaseModel):
    altitude: int = Field(gt=0)
    duration: int = Field(gt=0)
    season: str


class RiskPredictionResponse(BaseModel):
    risk_level: str
    source: str


class DifficultyPredictionResponse(BaseModel):
    difficulty: str
    source: str


class BudgetEstimateResponse(BaseModel):
    low_usd: float
    mid_usd: float
    high_usd: float
    source: str


class TrekRecommendationItem(BaseModel):
    id: int
    trek_name: str
    max_altitude: int | None = None
    duration_days: int | None = None
    difficulty: str | None = None
    match_score: float | None = None


class TrekRecommendationResponse(BaseModel):
    recommendations: list[TrekRecommendationItem]
    source: str


class MLInsightsResponse(BaseModel):
    risk_level: str
    risk_source: str
    difficulty: str
    difficulty_source: str
    budget: BudgetEstimateResponse
    recommended_treks: list[TrekRecommendationItem]
    recommend_source: str
