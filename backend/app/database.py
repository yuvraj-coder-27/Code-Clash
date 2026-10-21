from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import DATABASE_URL

_is_sqlite = "sqlite" in DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
    # Keep up to 5 connections alive — avoids reconnect overhead on every request
    pool_size=5,
    max_overflow=10,
)

# ─── SQLite-specific performance pragmas ──────────────────────────────────────
if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragmas(dbapi_conn, _connection_record):
        cur = dbapi_conn.cursor()
        # WAL allows concurrent reads while a write is happening
        cur.execute("PRAGMA journal_mode=WAL")
        # Keep 64 MB of pages in memory
        cur.execute("PRAGMA cache_size=-65536")
        # Skip fsync — safe for a contest (no crash durability needed)
        cur.execute("PRAGMA synchronous=NORMAL")
        # Store temp tables in memory
        cur.execute("PRAGMA temp_store=MEMORY")
        cur.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
