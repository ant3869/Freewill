# server/src/data/memory_manager.py
from typing import Dict, Any, List, Optional
import sqlite3
import json
from datetime import datetime
from ..core.exceptions import MemoryError
from ..core.constants import MemoryTypes
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

class MemoryManager:
    def __init__(self, db_path: str = "memories.db"):
        """Initialize memory manager with database path."""
        self.db_path = db_path
        self._init_db()
        
    def _init_db(self):
        """Initialize SQLite database."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS memories (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        type TEXT NOT NULL,
                        content TEXT NOT NULL,
                        metadata TEXT,
                        created_at TEXT NOT NULL,
                        expires_at TEXT,
                        importance INTEGER DEFAULT 0
                    )
                """)
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_type_time 
                    ON memories(type, created_at)
                """)
        except sqlite3.Error as e:
            logger.error(f"Database initialization failed: {e}")
            raise MemoryError(message="Failed to initialize database", details={"error": str(e)})

    async def store(
        self,
        content: Any,
        memory_type: MemoryTypes,
        metadata: Optional[Dict] = None,
        expires_at: Optional[str] = None,
        importance: int = 0
    ) -> int:
        """Store a new memory."""
        try:
            now = datetime.now().isoformat()
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    """
                    INSERT INTO memories 
                    (type, content, metadata, created_at, expires_at, importance)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        memory_type.value,
                        json.dumps(content),
                        json.dumps(metadata or {}),
                        now,
                        expires_at,
                        importance
                    )
                )
                memory_id = cursor.lastrowid
                logger.debug(f"Stored memory {memory_id} of type {memory_type.value}")
                return memory_id
                
        except Exception as e:
            logger.error(f"Failed to store memory: {e}")
            raise MemoryError(message="Failed to store memory", details={"error": str(e)})

    async def retrieve(
        self,
        memory_type: Optional[MemoryTypes] = None,
        limit: int = 10,
        min_importance: int = 0
    ) -> List[Dict[str, Any]]:
        """Retrieve memories of given type."""
        try:
            query = """
                SELECT * FROM memories 
                WHERE (expires_at IS NULL OR expires_at > ?)
            """
            params = [datetime.now().isoformat()]

            if memory_type:
                query += " AND type = ?"
                params.append(memory_type.value)

            if min_importance > 0:
                query += " AND importance >= ?"
                params.append(min_importance)

            query += " ORDER BY created_at DESC LIMIT ?"
            params.append(limit)

            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(query, params)
                rows = cursor.fetchall()

                memories = [{
                    'id': row[0],
                    'type': row[1],
                    'content': json.loads(row[2]),
                    'metadata': json.loads(row[3]),
                    'created_at': row[4],
                    'expires_at': row[5],
                    'importance': row[6]
                } for row in rows]

                logger.debug(f"Retrieved {len(memories)} memories")
                return memories

        except Exception as e:
            logger.error(f"Failed to retrieve memories: {e}")
            raise MemoryError(message="Failed to retrieve memories", details={"error": str(e)})

    async def delete(self, memory_id: int) -> bool:
        """Delete a specific memory."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    "DELETE FROM memories WHERE id = ?",
                    (memory_id,)
                )
                success = cursor.rowcount > 0
                logger.debug(f"Deleted memory {memory_id}: {success}")
                return success
                
        except Exception as e:
            logger.error(f"Failed to delete memory: {e}")
            raise MemoryError(message="Failed to delete memory", details={"error": str(e)})

    async def clear(self, memory_type: Optional[MemoryTypes] = None) -> int:
        """Clear memories of given type or all if type not specified."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                if memory_type:
                    cursor = conn.execute(
                        "DELETE FROM memories WHERE type = ?",
                        (memory_type.value,)
                    )
                else:
                    cursor = conn.execute("DELETE FROM memories")
                    
                count = cursor.rowcount
                logger.debug(f"Cleared {count} memories")
                return count
                
        except Exception as e:
            logger.error(f"Failed to clear memories: {e}")
            raise MemoryError(message="Failed to clear memories", details={"error": str(e)})

# # src/data/memory_manager.py
# from typing import Dict, Any, Optional, List
# from datetime import datetime
# import sqlite3
# import json
# import os
# from pathlib import Path

# from ..core.exceptions import MemoryError
# from ..core.constants import ErrorCodes, MemoryTypes

# class MemoryManager:
#     def __init__(self, db_path: str):
#         """Initialize memory manager with database path."""
#         try:
#             # Basic path sanity check first
#             if not isinstance(db_path, (str, Path)):
#                 raise MemoryError(
#                     message="Invalid database path type",
#                     code=ErrorCodes.MEMORY_STORE_FAILED,
#                     details={"path": str(db_path), "type": str(type(db_path))}
#                 )

#             # Convert to string path without resolving
#             self.db_path = str(db_path)
#             db_dir = os.path.dirname(self.db_path)

#             # Check if path is obviously invalid
#             if os.name == 'nt':  # Windows
#                 if any(c in self.db_path for c in '<>"|?*'):
#                     raise MemoryError(
#                         message="Invalid characters in database path",
#                         code=ErrorCodes.MEMORY_STORE_FAILED,
#                         details={"path": self.db_path}
#                     )
                
#                 # Check for invalid Windows device names
#                 drive = os.path.splitdrive(self.db_path)[0]
#                 if drive.upper().rstrip(':') in ('COM1', 'COM2', 'COM3', 'COM4', 'PRN', 'AUX', 'NUL', 'CON'):
#                     raise MemoryError(
#                         message="Invalid Windows device name in path",
#                         code=ErrorCodes.MEMORY_STORE_FAILED,
#                         details={"path": self.db_path}
#                     )

#             # Only try to create directory if path seems valid
#             if db_dir:
#                 try:
#                     os.makedirs(db_dir, exist_ok=True)
#                 except (OSError, PermissionError) as e:
#                     raise MemoryError(
#                         message="Cannot create database directory",
#                         code=ErrorCodes.MEMORY_STORE_FAILED,
#                         details={"path": self.db_path, "error": str(e)}
#                     )

#             self._init_db()

#         except MemoryError:
#             raise
#         except Exception as e:
#             raise MemoryError(
#                 message=f"Failed to initialize memory manager",
#                 code=ErrorCodes.MEMORY_STORE_FAILED,
#                 details={"path": db_path, "error": str(e)}
#             )

#     def _init_db(self):
#         """Initialize the memory database."""
#         try:
#             with sqlite3.connect(self.db_path) as conn:
#                 conn.execute("""
#                     CREATE TABLE IF NOT EXISTS memories (
#                         id INTEGER PRIMARY KEY AUTOINCREMENT,
#                         type TEXT NOT NULL,
#                         content TEXT NOT NULL,
#                         metadata TEXT,
#                         created_at REAL NOT NULL,
#                         expires_at REAL,
#                         importance INTEGER DEFAULT 0
#                     )
#                 """)
#                 conn.execute("""
#                     CREATE INDEX IF NOT EXISTS idx_type_time 
#                     ON memories(type, created_at)
#                 """)
#         except sqlite3.Error as e:
#             raise MemoryError(
#                 message="Failed to initialize memory database",
#                 code=ErrorCodes.MEMORY_STORE_FAILED,
#                 details={"error": str(e), "path": self.db_path}
#             )

#     async def store(
#         self,
#         content: Any,
#         memory_type: MemoryTypes,
#         metadata: Optional[Dict] = None,
#         expires_in: Optional[int] = None,
#         importance: int = 0
#         ) -> int:
#             """Store a new memory."""
#             try:
#                 now = datetime.now().timestamp()
#                 expires_at = now + expires_in if expires_in else None

#                 with sqlite3.connect(self.db_path) as conn:
#                     cursor = conn.execute(
#                         """
#                         INSERT INTO memories 
#                         (type, content, metadata, created_at, expires_at, importance)
#                         VALUES (?, ?, ?, ?, ?, ?)
#                         """,
#                         (
#                             memory_type.value,
#                             json.dumps(content),
#                             json.dumps(metadata or {}),
#                             now,
#                             expires_at,
#                             importance
#                         )
#                     )
#                     return cursor.lastrowid
#             except Exception as e:
#                 raise MemoryError(
#                     message="Failed to store memory",
#                     code=ErrorCodes.MEMORY_STORE_FAILED,
#                     details={"error": str(e)}
#                 )

#     async def retrieve(
#         self,
#         memory_type: Optional[MemoryTypes] = None,
#         limit: int = 10,
#         min_importance: int = 0
#     ) -> List[Dict[str, Any]]:
#         """Retrieve memories of given type."""
#         try:
#             query = """
#                 SELECT * FROM memories 
#                 WHERE (expires_at IS NULL OR expires_at > ?)
#             """
#             params = [datetime.now().timestamp()]

#             if memory_type:
#                 query += " AND type = ?"
#                 params.append(memory_type.value)

#             if min_importance > 0:
#                 query += " AND importance >= ?"
#                 params.append(min_importance)

#             query += " ORDER BY created_at DESC LIMIT ?"
#             params.append(limit)

#             with sqlite3.connect(self.db_path) as conn:
#                 cursor = conn.execute(query, params)
#                 rows = cursor.fetchall()

#                 return [{
#                     'id': row[0],
#                     'type': row[1],
#                     'content': json.loads(row[2]),
#                     'metadata': json.loads(row[3]),
#                     'created_at': row[4],
#                     'expires_at': row[5],
#                     'importance': row[6]
#                 } for row in rows]

#         except Exception as e:
#             raise MemoryError(
#                 message="Failed to retrieve memories",
#                 code=ErrorCodes.MEMORY_RETRIEVE_FAILED,
#                 details={"error": str(e)}
#             )

#     async def clear(self, memory_type: Optional[MemoryTypes] = None) -> int:
#         """Clear memories of given type or all if type not specified."""
#         try:
#             with sqlite3.connect(self.db_path) as conn:
#                 if memory_type:
#                     cursor = conn.execute(
#                         "DELETE FROM memories WHERE type = ?",
#                         (memory_type.value,)
#                     )
#                 else:
#                     cursor = conn.execute("DELETE FROM memories")
#                 return cursor.rowcount
#         except Exception as e:
#             raise MemoryError(
#                 message="Failed to clear memories",
#                 code=ErrorCodes.MEMORY_STORE_FAILED,
#                 details={"error": str(e)}
#             )