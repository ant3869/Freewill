# server/tests/test_api_routes.py
import pytest
import json

async def test_model_start(client):
    """Test model start endpoint."""
    response = await client.post('/api/model/start', 
        json={'model_path': 'test-model'})
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['status'] == 'success'
    assert 'model_info' in data

async def test_chat_endpoint(client):
    """Test chat endpoint."""
    # First start the model
    await client.post('/api/model/start', 
        json={'model_path': 'test-model'})
    
    # Test chat message
    response = await client.post('/api/chat/send', 
        json={'message': 'Hello'})
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['status'] == 'success'
    assert 'response' in data