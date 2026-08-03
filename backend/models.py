from sqlalchemy import Boolean, Column, Integer, String, Text, ForeignKey, TIMESTAMP, Float
from sqlalchemy.sql import func
from db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    experience_level = Column(String(20))
    created_at = Column(TIMESTAMP, server_default=func.now())


class Trek(Base):
    __tablename__ = "treks"

    id = Column(Integer, primary_key=True, index=True)
    trek_name = Column(String(150), nullable=False)
    max_altitude = Column(Integer)
    typical_duration = Column(Integer)
    difficulty = Column(String(20))


class UserTrekHistory(Base):
    __tablename__ = "user_trek_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    trek_type = Column(String(50))
    experience_level = Column(String(20))
    input_altitude = Column(Integer)

    season = Column(String(20))
    planned_duration = Column(Integer)
    risk_level = Column(String(20))
    destination = Column(String(150), nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())


class Gear(Base):
    __tablename__ = "gear"

    id = Column(Integer, primary_key=True, index=True)
    gear_name = Column(String(150), nullable=False)
    category = Column(String(50))
    photo_url = Column(Text)
    description = Column(Text)
    slug = Column(String(80), unique=True, index=True, nullable=True)
    quantity_hint = Column(String(80), nullable=True)
    rent_hint = Column(Text, nullable=True)


class TrekGearRecommendation(Base):
    __tablename__ = "trek_gear_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    history_id = Column(Integer, ForeignKey("user_trek_history.id", ondelete="CASCADE"))
    gear_id = Column(Integer, ForeignKey("gear.id"))


class KnowledgeArticle(Base):
    """TrekPal knowledge base — guides, permits, safety, etc. (RAG-ready text)."""

    __tablename__ = "knowledge_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(220), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    summary = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    trek_id = Column(Integer, ForeignKey("treks.id", ondelete="SET NULL"), nullable=True)
    source_url = Column(Text, nullable=True)
    source_label = Column(String(200), nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class TripPlan(Base):
    """Saved AI-generated trip plans (Phase 5)."""

    __tablename__ = "trip_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trek_id = Column(Integer, ForeignKey("treks.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    destination = Column(String(150), nullable=False)
    season = Column(String(20), nullable=False)
    duration_days = Column(Integer, nullable=False)
    experience_level = Column(String(20), nullable=False)
    difficulty = Column(String(20), nullable=False)
    risk_level = Column(String(20), nullable=True)
    plan_json = Column(Text, nullable=False)
    source = Column(String(20), nullable=False, default="ai")
    created_at = Column(TIMESTAMP, server_default=func.now())


class MapLocation(Base):
    """Map points of interest for trekking regions (Phase 6)."""

    __tablename__ = "map_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(40), nullable=False, index=True)
    # tea_house | hospital | checkpoint | emergency | trailhead
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Integer, nullable=True)
    region = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    trek_id = Column(Integer, ForeignKey("treks.id", ondelete="SET NULL"), nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)
    # False = demo / approximate — never treat as live emergency guidance.
    is_verified = Column(Boolean, default=False, nullable=False)
    source_note = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
