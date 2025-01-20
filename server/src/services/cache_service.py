# server/src/services/cache_service.py
from typing import Any, Optional, Dict
from datetime import datetime, timedelta
import diskcache
import json
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

class CacheService:
    """Service for handling caching operations."""
    
    def __init__(self, cache_dir: str = ".cache"):
        self.cache = diskcache.Cache(cache_dir)
        logger.info(f"Cache initialized at {cache_dir}")
        
    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache."""
        try:
            value = self.cache.get(key)
            if value is not None:
                logger.debug(f"Cache hit for key: {key}")
                return json.loads(value) if isinstance(value, str) else value
            logger.debug(f"Cache miss for key: {key}")
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {str(e)}")
            return None

    async def set(
        self, 
        key: str, 
        value: Any, 
        expire: Optional[int] = None
    ) -> bool:
        """Set a value in cache with optional expiration in seconds."""
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            self.cache.set(key, value, expire=expire)
            logger.debug(f"Cache set for key: {key}")
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {str(e)}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete a value from cache."""
        try:
            self.cache.delete(key)
            logger.debug(f"Cache delete for key: {key}")
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {str(e)}")
            return False

    async def clear(self) -> bool:
        """Clear all cached values."""
        try:
            self.cache.clear()
            logger.info("Cache cleared")
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {str(e)}")
            return False

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cache.close()

# Create singleton instance
cache_service = CacheService()