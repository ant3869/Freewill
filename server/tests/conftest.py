# server/tests/conftest.py
import pytest
from app import create_app
from llm.engine import LLMEngine
from core.constants import ModelStatus

@pytest.fixture
def app():
    """Create test Flask app."""
    app = create_app()
    app.config['TESTING'] = True
    return app

@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()

@pytest.fixture
def mock_llm_engine():
    """Create test LLM engine."""
    engine = LLMEngine('test-model')
    return engine