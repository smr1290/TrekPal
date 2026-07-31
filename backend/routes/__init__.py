from .auth import router as auth_router
from .prepare import router as prepare_router
from .treks import router as treks_router
from .history import router as history_router
from .gear import router as gear_router
from .knowledge import router as knowledge_router
from .chat import router as chat_router
from .ml import router as ml_router
from .trip_plans import router as trip_plans_router
from .maps import router as maps_router

routers = [
    (auth_router, "/auth", ["Authentication"]),
    (prepare_router, "/trek", ["Trek Preparation"]),
    (treks_router, "/trek", ["Treks"]),
    (history_router, "/trek", ["History"]),
    (gear_router, "/gear", ["Gear"]),
    (knowledge_router, "/knowledge", ["Knowledge"]),
    (chat_router, "/chat", ["AI Chat"]),
    # Internal/dev estimates — Plan trip already exposes risk/budget to users.
    (ml_router, "/ml", ["Internal ML"]),
    (trip_plans_router, "/trip-plans", ["Trip Planner"]),
    (maps_router, "/maps", ["Maps"]),
]
