# server/src/utils/decorators.py
from functools import wraps
from typing import Optional, Callable
import hashlib
import json
from flask import request
from ..services.cache_service import cache_service
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

def cache_response(expire: Optional[int] = 300):
    """Cache API response decorator.
    
    Args:
        expire: Cache expiration time in seconds (default: 5 minutes)
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function name and request data
            key_parts = [
                func.__name__,
                request.path,
                request.method,
                str(request.args),
                request.get_data().decode('utf-8')
            ]
            cache_key = hashlib.md5(
                json.dumps(key_parts, sort_keys=True).encode('utf-8')
            ).hexdigest()

            # Try to get from cache
            cached_response = await cache_service.get(cache_key)
            if cached_response is not None:
                logger.debug(f"Returning cached response for {func.__name__}")
                return cached_response

            # Execute function and cache result
            response = await func(*args, **kwargs)
            await cache_service.set(cache_key, response, expire=expire)
            return response

        return wrapper
    return decorator