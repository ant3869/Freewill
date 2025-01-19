# src/data/database/schema.py
import sqlite3
from pathlib import Path
from typing import Optional
from ...core.exceptions import DatabaseError
from ...core.constants import ErrorCodes
from ...utils.logger import setup_logger

logger = setup_logger(__name__)

class DatabaseManager:
    def __init__(self, db_path: str):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        """Initialize database schema."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Memory Table
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS memories (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        key TEXT UNIQUE NOT NULL,
                        value TEXT NOT NULL,
                        type TEXT NOT NULL,
                        timestamp REAL NOT NULL,
                        expires_at REAL,
                        metadata TEXT
                    )
                """)

                # Token Statistics Table
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS token_stats (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp REAL NOT NULL,
                        total_tokens INTEGER NOT NULL,
                        completion_tokens INTEGER NOT NULL,
                        latency REAL NOT NULL,
                        model TEXT NOT NULL
                    )
                """)

                # Create indices
                conn.execute("CREATE INDEX IF NOT EXISTS idx_memories_key ON memories(key)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_memories_timestamp ON memories(timestamp)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_token_stats_model ON token_stats(model)")

                logger.info("Database schema initialized successfully")

        except sqlite3.Error as e:
            raise DatabaseError(
                message="Failed to initialize database",
                code=ErrorCodes.DB_INIT_FAILED,
                details={"error": str(e)}
            )