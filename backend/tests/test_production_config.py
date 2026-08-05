"""S1/S2: production config must refuse unsafe settings; cookie SameSite defaults."""

import pytest

from config import (
    internal_ml_routes_enabled,
    resolve_auth_cookie_samesite,
    validate_production_config,
)


def test_validate_production_accepts_safe_settings():
    validate_production_config(
        app_env="production",
        jwt_secret="this-is-a-long-enough-secret-for-tests-012345",
        cors_origins=["https://trekpal.example.com"],
        enable_internal_ml="false",
        allow_internal_ml_override="false",
        database_url="postgresql://user:pass@db.example.com:5432/trekpal",
        auth_cookie_secure=True,
        auth_cookie_samesite="none",
    )


def test_validate_production_accepts_same_site_lax():
    # Reverse-proxy / same-site deploy can keep Lax + Secure.
    validate_production_config(
        app_env="production",
        jwt_secret="this-is-a-long-enough-secret-for-tests-012345",
        cors_origins=["https://trekpal.example.com"],
        enable_internal_ml="false",
        database_url="postgresql://user:pass@db.example.com:5432/trekpal",
        auth_cookie_secure=True,
        auth_cookie_samesite="lax",
    )


def test_validate_production_skips_development():
    # Would be illegal in production; development must allow local defaults.
    validate_production_config(
        app_env="development",
        jwt_secret="short",
        cors_origins=["*"],
        enable_internal_ml="true",
        database_url="postgresql://postgres:root@localhost:5432/TrekPal",
        auth_cookie_secure=False,
        auth_cookie_samesite="lax",
    )


def test_samesite_none_requires_secure_even_in_dev():
    with pytest.raises(RuntimeError, match="AUTH_COOKIE_SAMESITE=none"):
        validate_production_config(
            app_env="development",
            jwt_secret="short",
            cors_origins=["http://localhost:3000"],
            enable_internal_ml="true",
            auth_cookie_secure=False,
            auth_cookie_samesite="none",
        )


@pytest.mark.parametrize(
    "kwargs,match",
    [
        (
            {
                "jwt_secret": "replace-with-a-long-random-secret",
                "cors_origins": ["https://app.example.com"],
                "enable_internal_ml": "false",
                "database_url": "postgresql://u:p@db.example.com/trekpal",
                "auth_cookie_secure": True,
                "auth_cookie_samesite": "none",
            },
            "JWT_SECRET",
        ),
        (
            {
                "jwt_secret": "this-is-a-long-enough-secret-for-tests-012345",
                "cors_origins": ["*"],
                "enable_internal_ml": "false",
                "database_url": "postgresql://u:p@db.example.com/trekpal",
                "auth_cookie_secure": True,
                "auth_cookie_samesite": "none",
            },
            "CORS_ORIGINS",
        ),
        (
            {
                "jwt_secret": "this-is-a-long-enough-secret-for-tests-012345",
                "cors_origins": ["https://app.example.com"],
                "enable_internal_ml": "true",
                "allow_internal_ml_override": "false",
                "database_url": "postgresql://u:p@db.example.com/trekpal",
                "auth_cookie_secure": True,
                "auth_cookie_samesite": "none",
            },
            "ENABLE_INTERNAL_ML",
        ),
        (
            {
                "jwt_secret": "this-is-a-long-enough-secret-for-tests-012345",
                "cors_origins": ["https://app.example.com"],
                "enable_internal_ml": "false",
                "database_url": "postgresql://postgres:root@localhost:5432/TrekPal",
                "auth_cookie_secure": True,
                "auth_cookie_samesite": "none",
            },
            "DATABASE_URL",
        ),
        (
            {
                "jwt_secret": "this-is-a-long-enough-secret-for-tests-012345",
                "cors_origins": ["https://app.example.com"],
                "enable_internal_ml": "false",
                "database_url": "postgresql://u:p@db.example.com/trekpal",
                "auth_cookie_secure": False,
                "auth_cookie_samesite": "lax",
            },
            "AUTH_COOKIE_SECURE",
        ),
        (
            {
                "jwt_secret": "this-is-a-long-enough-secret-for-tests-012345",
                "cors_origins": ["https://app.example.com"],
                "enable_internal_ml": "false",
                "database_url": "postgresql://u:p@db.example.com/trekpal",
                "auth_cookie_secure": False,
                "auth_cookie_samesite": "none",
            },
            "AUTH_COOKIE_SAMESITE=none",
        ),
    ],
)
def test_validate_production_rejects_unsafe(kwargs, match):
    with pytest.raises(RuntimeError, match=match):
        validate_production_config(app_env="production", **kwargs)


def test_resolve_auth_cookie_samesite_defaults():
    assert resolve_auth_cookie_samesite("development") == "lax"
    assert resolve_auth_cookie_samesite("production") == "none"
    assert resolve_auth_cookie_samesite("production", "lax") == "lax"
    assert resolve_auth_cookie_samesite("development", "none") == "none"


def test_resolve_auth_cookie_samesite_rejects_invalid():
    with pytest.raises(RuntimeError, match="AUTH_COOKIE_SAMESITE"):
        resolve_auth_cookie_samesite("development", "invalid")


def test_internal_ml_requires_override_in_production():
    assert internal_ml_routes_enabled("production", "false", "false") is False
    assert internal_ml_routes_enabled("production", "true", "false") is False
    assert internal_ml_routes_enabled("production", "true", "true") is True
    assert internal_ml_routes_enabled("development", "false", "false") is True
