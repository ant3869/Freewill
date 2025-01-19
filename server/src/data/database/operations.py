# src/data/database/operations.py
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

from ...core.exceptions import DatabaseError
from ...core.constants import ErrorCodes
from ...utils.logger import setup_logger

logger = setup_logger(__name__)

class DatabaseOperations:
    def __init__(self, db_manager):
        self.db_manager = db_manager

    async def store_memory(self, memory: Dict[str, Any]) -> None:
        """Store a memory entry."""
        try:
            with sqlite3.connect(self.db_manager.db_path) as conn:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO memories 
                    (key, value, type, timestamp, expires_at, metadata)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        memory['key'],
                        memory['value'],
                        memory['type'],
                        datetime.now().timestamp(),
                        memory.get('expires_at'),
                        json.dumps(memory.get('metadata', {}))
                    )
                )
                logger.debug(f"Stored memory with key: {memory['key']}")
        
        except sqlite3.Error as e:
            raise DatabaseError(
                message="Failed to store memory",
                code=ErrorCodes.DB_WRITE_FAILED,
                details={"error": str(e)}
            )

    async def get_memory(self, key: str) -> Optional[Dict[str, Any]]:
        """Retrieve a memory by key."""
        try:
            with sqlite3.connect(self.db_manager.db_path) as conn:
                cursor = conn.execute(
                    """
                    SELECT * FROM memories 
                    WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)
                    """,
                    (key, datetime.now().timestamp())
                )
                row = cursor.fetchone()
                
                if not row:
                    return None
                    
                return {
                    'key': row[1],
                    'value': row[2],
                    'type': row[3],
                    'timestamp': row[4],
                    'expires_at': row[5],
                    'metadata': json.loads(row[6]) if row[6] else {}
                }
                
        except sqlite3.Error as e:
            raise DatabaseError(
                message="Failed to retrieve memory",
                code=ErrorCodes.DB_READ_FAILED,
                details={"error": str(e)}
            )

    async def save_token_stats(self, stats: Dict[str, Any]) -> None:
        """Save token usage statistics."""
        try:
            with sqlite3.connect(self.db_manager.db_path) as conn:
                conn.execute(
                    """
                    INSERT INTO token_stats 
                    (timestamp, total_tokens, completion_tokens, latency, model)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        datetime.now().timestamp(),
                        stats['total_tokens'],
                        stats['completion_tokens'],
                        stats['latency'],
                        stats['model']
                    )
                )
                logger.debug("Token stats saved successfully")
                
        except sqlite3.Error as e:
            raise DatabaseError(
                message="Failed to save token stats",
                code=ErrorCodes.DB_WRITE_FAILED,
                details={"error": str(e)}
            )