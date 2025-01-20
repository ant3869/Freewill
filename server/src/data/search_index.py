# server/src/data/search_index.py
from typing import Dict, List, Any, Optional
import sqlite3
import json
from datetime import datetime
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

class SearchIndex:
    """Search index for memory storage."""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_index()
        
    def _init_index(self):
        """Initialize search index tables."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Create full-text search table
                conn.execute("""
                    CREATE VIRTUAL TABLE IF NOT EXISTS memory_index 
                    USING fts5(
                        memory_id,
                        content,
                        metadata,
                        tokenize='porter'
                    )
                """)
                
                # Create index metadata table
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS index_metadata (
                        last_update TEXT,
                        total_documents INTEGER,
                        avg_length REAL
                    )
                """)
                
                logger.info("Search index initialized successfully")
                
        except sqlite3.Error as e:
            logger.error(f"Failed to initialize search index: {str(e)}")
            raise
            
    async def index_memory(self, memory_id: int, content: str, metadata: Dict[str, Any]):
        """Index a memory entry."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    """
                    INSERT INTO memory_index (memory_id, content, metadata)
                    VALUES (?, ?, ?)
                    """,
                    (
                        str(memory_id),
                        content,
                        json.dumps(metadata)
                    )
                )
                
                # Update metadata
                self._update_metadata(conn)
                logger.debug(f"Indexed memory {memory_id}")
                
        except sqlite3.Error as e:
            logger.error(f"Failed to index memory: {str(e)}")
            raise

    async def search(
        self,
        query: str,
        limit: int = 10,
        metadata_filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Search indexed memories."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                base_query = """
                    SELECT 
                        memory_id,
                        content,
                        metadata,
                        rank
                    FROM memory_index
                    WHERE memory_index MATCH ?
                """
                
                params = [query]
                
                if metadata_filters:
                    filter_conditions = []
                    for key, value in metadata_filters.items():
                        filter_conditions.append(f'json_extract(metadata, "$.{key}") = ?')
                        params.append(value)
                    
                    if filter_conditions:
                        base_query += " AND " + " AND ".join(filter_conditions)
                
                base_query += f" ORDER BY rank LIMIT {limit}"
                
                cursor = conn.execute(base_query, params)
                results = []
                
                for row in cursor:
                    results.append({
                        'memory_id': int(row[0]),
                        'content': row[1],
                        'metadata': json.loads(row[2]),
                        'relevance': row[3]
                    })
                
                logger.debug(f"Search query '{query}' returned {len(results)} results")
                return results
                
        except sqlite3.Error as e:
            logger.error(f"Search failed: {str(e)}")
            raise

    def _update_metadata(self, conn: sqlite3.Connection):
        """Update index metadata."""
        try:
            # Get current stats
            cursor = conn.execute("SELECT COUNT(*), AVG(LENGTH(content)) FROM memory_index")
            total_docs, avg_length = cursor.fetchone()
            
            # Update metadata
            conn.execute(
                """
                INSERT OR REPLACE INTO index_metadata 
                (last_update, total_documents, avg_length)
                VALUES (?, ?, ?)
                """,
                (
                    datetime.now().isoformat(),
                    total_docs or 0,
                    avg_length or 0
                )
            )
            
        except sqlite3.Error as e:
            logger.error(f"Failed to update metadata: {str(e)}")
            raise

    async def get_stats(self) -> Dict[str, Any]:
        """Get index statistics."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    "SELECT last_update, total_documents, avg_length FROM index_metadata"
                )
                row = cursor.fetchone()
                
                if row:
                    return {
                        'last_update': row[0],
                        'total_documents': row[1],
                        'avg_length': row[2]
                    }
                return {
                    'last_update': None,
                    'total_documents': 0,
                    'avg_length': 0
                }
                
        except sqlite3.Error as e:
            logger.error(f"Failed to get stats: {str(e)}")
            raise