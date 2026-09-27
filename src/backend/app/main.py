from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import auth, movies, ratings, watchlist, recommends, chat

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Movie Recommendation System API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
cors_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auto Database Migration / Init ──────────────────────────────────────────
@app.on_event("startup")
def startup_db():
    from sqlalchemy import text
    from app.db.session import engine
    from app.models.base import Base
    import app.models  # noqa: F401

    try:
        # Create all tables if not exist (especially for fresh PostgreSQL)
        Base.metadata.create_all(bind=engine)

        # Migrate missing columns for existing SQLite / PostgreSQL databases
        with engine.begin() as conn:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'"))
            except Exception:
                pass

            try:
                conn.execute(text("ALTER TABLE ratings ADD COLUMN review_text TEXT"))
            except Exception:
                pass

            try:
                conn.execute(text("ALTER TABLE ratings ADD COLUMN updated_at TIMESTAMP"))
            except Exception:
                pass
    except Exception as e:
        print(f"[Database Startup Notice] {e}")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/v1")
app.include_router(movies.router,    prefix="/api/v1")
app.include_router(ratings.router,   prefix="/api/v1")
app.include_router(watchlist.router, prefix="/api/v1")
app.include_router(recommends.router, prefix="/api/v1")
app.include_router(chat.router,      prefix="/api/v1")

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
