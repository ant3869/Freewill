# server/src/services/analytics.py
from typing import Dict, Any, List, Optional
import sqlite3
import json
from datetime import datetime, timedelta
import statistics
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

class AnalyticsService:
    """Service for tracking and analyzing LLM performance."""
    
    def __init__(self, db_path: str = "analytics.db"):
        self.db_path = db_path
        self._init_db()
        
    def _init_db(self):
        """Initialize analytics database."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Request metrics
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS request_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        prompt_length INTEGER NOT NULL,
                        response_length INTEGER NOT NULL,
                        generation_time REAL NOT NULL,
                        tokens_used INTEGER NOT NULL,
                        temperature REAL NOT NULL,
                        success BOOLEAN NOT NULL,
                        error_type TEXT,
                        memory_usage REAL
                    )
                """)
                
                # Performance metrics
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS performance_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        cpu_usage REAL NOT NULL,
                        memory_usage REAL NOT NULL,
                        active_threads INTEGER NOT NULL,
                        queue_size INTEGER NOT NULL
                    )
                """)
                
                # Create indices
                conn.execute("CREATE INDEX IF NOT EXISTS idx_request_timestamp ON request_metrics(timestamp)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_metrics(timestamp)")
                
        except sqlite3.Error as e:
            logger.error(f"Failed to initialize analytics database: {str(e)}")
            raise

    async def record_request(
        self,
        prompt_length: int,
        response_length: int,
        generation_time: float,
        tokens_used: int,
        temperature: float,
        success: bool,
        error_type: Optional[str] = None,
        memory_usage: Optional[float] = None
    ):
        """Record metrics for a single request."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    """
                    INSERT INTO request_metrics (
                        timestamp, prompt_length, response_length, generation_time,
                        tokens_used, temperature, success, error_type, memory_usage
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        datetime.now().isoformat(),
                        prompt_length,
                        response_length,
                        generation_time,
                        tokens_used,
                        temperature,
                        success,
                        error_type,
                        memory_usage
                    )
                )
                
        except sqlite3.Error as e:
            logger.error(f"Failed to record request metrics: {str(e)}")
            raise

    async def record_performance(
        self,
        cpu_usage: float,
        memory_usage: float,
        active_threads: int,
        queue_size: int
    ):
        """Record system performance metrics."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    """
                    INSERT INTO performance_metrics (
                        timestamp, cpu_usage, memory_usage, 
                        active_threads, queue_size
                    ) VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        datetime.now().isoformat(),
                        cpu_usage,
                        memory_usage,
                        active_threads,
                        queue_size
                    )
                )
                
        except sqlite3.Error as e:
            logger.error(f"Failed to record performance metrics: {str(e)}")
            raise

    async def get_request_metrics(
        self,
        time_range: str = '1h'
    ) -> Dict[str, Any]:
        """Get aggregated request metrics."""
        try:
            time_ranges = {
                '1h': timedelta(hours=1),
                '24h': timedelta(days=1),
                '7d': timedelta(days=7),
                '30d': timedelta(days=30)
            }
            
            delta = time_ranges.get(time_range, timedelta(hours=1))
            start_time = (datetime.now() - delta).isoformat()
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    """
                    SELECT 
                        COUNT(*) as total_requests,
                        SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
                        AVG(generation_time) as avg_generation_time,
                        AVG(tokens_used) as avg_tokens,
                        AVG(prompt_length) as avg_prompt_length,
                        AVG(response_length) as avg_response_length,
                        AVG(memory_usage) as avg_memory_usage
                    FROM request_metrics
                    WHERE timestamp > ?
                    """,
                    (start_time,)
                )
                
                metrics = dict(zip(
                    [
                        'total_requests', 'successful_requests', 
                        'avg_generation_time', 'avg_tokens',
                        'avg_prompt_length', 'avg_response_length',
                        'avg_memory_usage'
                    ],
                    cursor.fetchone()
                ))
                
                # Get error distribution
                cursor = conn.execute(
                    """
                    SELECT error_type, COUNT(*) as count
                    FROM request_metrics
                    WHERE timestamp > ? AND error_type IS NOT NULL
                    GROUP BY error_type
                    """,
                    (start_time,)
                )
                
                metrics['error_distribution'] = dict(cursor.fetchall())
                
                return metrics
                
        except sqlite3.Error as e:
            logger.error(f"Failed to get request metrics: {str(e)}")
            raise

    async def get_performance_metrics(
        self,
        time_range: str = '1h'
    ) -> Dict[str, Any]:
        """Get system performance metrics."""
        try:
            time_ranges = {
                '1h': timedelta(hours=1),
                '24h': timedelta(days=1),
                '7d': timedelta(days=7),
                '30d': timedelta(days=30)
            }
            
            delta = time_ranges.get(time_range, timedelta(hours=1))
            start_time = (datetime.now() - delta).isoformat()
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    """
                    SELECT 
                        timestamp,
                        cpu_usage,
                        memory_usage,
                        active_threads,
                        queue_size
                    FROM performance_metrics
                    WHERE timestamp > ?
                    ORDER BY timestamp ASC
                    """,
                    (start_time,)
                )
                
                rows = cursor.fetchall()
                
                return {
                    'timeline': [{
                        'timestamp': row[0],
                        'cpu_usage': row[1],
                        'memory_usage': row[2],
                        'active_threads': row[3],
                        'queue_size': row[4]
                    } for row in rows],
                    'summary': {
                        'avg_cpu_usage': statistics.mean(row[1] for row in rows),
                        'avg_memory_usage': statistics.mean(row[2] for row in rows),
                        'max_cpu_usage': max(row[1] for row in rows),
                        'max_memory_usage': max(row[2] for row in rows),
                        'avg_queue_size': statistics.mean(row[4] for row in rows)
                    }
                }
                
        except sqlite3.Error as e:
            logger.error(f"Failed to get performance metrics: {str(e)}")
            raise

# Create singleton instance
analytics_service = AnalyticsService()