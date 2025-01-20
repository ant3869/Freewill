# server/tests/test_llm_cache.py
import pytest
from src.llm.engine import LLMEngine
from src.services.cache_service import cache_service

@pytest.fixture
async def llm_engine():
    """Create and initialize test LLM engine."""
    engine = LLMEngine('test-model')
    await engine.initialize()
    return engine

async def test_response_caching(llm_engine):
    """Test that responses are properly cached."""
    # Clear cache first
    await cache_service.clear()
    
    # First request
    prompt = "Test prompt for caching"
    response1 = await llm_engine.generate_response(prompt, use_cache=True)
    
    # Second request with same prompt
    response2 = await llm_engine.generate_response(prompt, use_cache=True)
    
    # Responses should be identical when cached
    assert response1 == response2
    
    # Request with different temperature should bypass cache
    response3 = await llm_engine.generate_response(prompt, temperature=0.8, use_cache=True)
    assert response1 != response3