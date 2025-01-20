# server/tests/test_llm_engine.py
import pytest
from src.llm.engine import LLMEngine
from src.core.constants import ModelStatus
from src.core.exceptions import ModelError

async def test_llm_engine_initialization():
    """Test LLM engine initialization."""
    engine = LLMEngine('test-model')
    assert engine.status == ModelStatus.INITIALIZING
    
    await engine.initialize()
    assert engine.status == ModelStatus.READY
    assert engine.model_path == 'test-model'

async def test_generate_response():
    """Test response generation."""
    engine = LLMEngine('test-model')
    await engine.initialize()
    
    # Test basic response
    response = await engine.generate_response("Hello")
    assert isinstance(response, dict)
    assert "response" in response
    assert "tokens_used" in response
    
    # Test with different settings
    response = await engine.generate_response(
        "Test prompt",
        max_tokens=100,
        temperature=0.5
    )
    assert isinstance(response["tokens_used"], int)
    
    # Test error handling
    engine.status = ModelStatus.ERROR
    with pytest.raises(ModelError):
        await engine.generate_response("Should fail")