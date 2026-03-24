from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
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

    trek_type = Column(String(50))         # User selected trek type
    experience_level = Column(String(20))  # User selected experience
    input_altitude = Column(Integer)       # User entered altitude

    season = Column(String(20))
    planned_duration = Column(Integer)
    risk_level = Column(String(20))

    created_at = Column(TIMESTAMP, server_default=func.now())


class Gear(Base):
    __tablename__ = "gear"

    id = Column(Integer, primary_key=True, index=True)
    gear_name = Column(String(150), nullable=False)
    category = Column(String(50))
    photo_url = Column(Text)
    description = Column(Text)


class TrekGearRecommendation(Base):
    __tablename__ = "trek_gear_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    history_id = Column(Integer, ForeignKey("user_trek_history.id", ondelete="CASCADE"))
    gear_id = Column(Integer, ForeignKey("gear.id"))