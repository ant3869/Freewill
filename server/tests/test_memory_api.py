# server/tests/test_memory_api.py
import pytest
import json
from src.app import create_app

@pytest.fixture
def client():
    """Create test client."""
    app = create_app()
    app.config['TESTING'] = True
    return app.test_client()

async def test_search_endpoint(client):
    """Test memory search API endpoint."""
    response = await client.get('/api/memories/search?query=test')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'status' in data
    assert 'results' in data

async def test_stats_endpoint(client):
    """Test memory stats API endpoint."""
    response = await client.get('/api/memories/stats?timeRange=7d')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'status' in data
    assert 'stats' in data
    
    stats = data['stats']
    assert 'totalMemories' in stats
    assert 'activity' in stats
    assert 'types' in stats
    assert 'connections' in stats

async def test_error_handling(client):
    """Test API error handling."""
    # Test invalid query
    response = await client.get('/api/memories/search')
    assert response.status_code == 400
    
    # Test invalid time range
    response = await client.get('/api/memories/stats?timeRange=invalid')
    assert response.status_code == 400