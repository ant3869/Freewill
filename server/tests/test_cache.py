# server/tests/test_cache.py
import pytest
from src.services.cache_service import CacheService
import time

@pytest.fixture
def cache_service():
    """Create a test cache service."""
    service = CacheService(cache_dir=".test_cache")
    yield service
    service.clear()  # Clean up after tests

async def test_cache_basic_operations(cache_service):
    """Test basic cache operations."""
    # Test set and get
    await cache_service.set("test_key", "test_value")
    value = await cache_service.get("test_key")
    assert value == "test_value"
    
    # Test delete
    await cache_service.delete("test_key")
    value = await cache_service.get("test_key")
    assert value is None

async def test_cache_expiration(cache_service):
    """Test cache expiration."""
    await cache_service.set("expire_key", "expire_value", expire=1)
    value = await cache_service.get("expire_key")
    assert value == "expire_value"
    
    # Wait for expiration
    time.sleep(1.1)
    value = await cache_service.get("expire_key")
    assert value is None

async def test_cache_complex_data(cache_service):
    """Test caching complex data structures."""
    data = {
        "string": "value",
        "number": 123,
        "list": [1, 2, 3],
        "nested": {"key": "value"}
    }
    
    await cache_service.set("complex_key", data)
    value = await cache_service.get("complex_key")
    assert value == data