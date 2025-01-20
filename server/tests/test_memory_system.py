# server/tests/test_memory_system.py
import pytest
from datetime import datetime, timedelta
from src.data.memory_manager import MemoryManager
from src.data.search_index import SearchIndex
from src.core.constants import MemoryTypes

@pytest.fixture
async def memory_manager():
    """Create a test memory manager."""
    manager = MemoryManager(db_path=":memory:")  # Use in-memory SQLite for tests
    return manager

@pytest.fixture
async def search_index():
    """Create a test search index."""
    index = SearchIndex(db_path=":memory:")
    return index

@pytest.fixture
async def sample_memories(memory_manager):
    """Create sample memories for testing."""
    memories = [
        {
            "content": "Test memory content 1",
            "type": MemoryTypes.CONVERSATION,
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "importance": 5
            }
        },
        {
            "content": "Test memory content 2",
            "type": MemoryTypes.FACT,
            "metadata": {
                "timestamp": (datetime.now() - timedelta(days=1)).isoformat(),
                "importance": 3
            }
        }
    ]
    
    memory_ids = []
    for memory in memories:
        memory_id = await memory_manager.store(
            content=memory["content"],
            memory_type=memory["type"],
            metadata=memory["metadata"]
        )
        memory_ids.append(memory_id)
    
    return memory_ids

async def test_memory_storage(memory_manager, sample_memories):
    """Test basic memory storage and retrieval."""
    # Test retrieval
    memories = await memory_manager.retrieve(limit=10)
    assert len(memories) == 2
    
    # Test single memory retrieval
    memory = await memory_manager.get_memory(sample_memories[0])
    assert memory is not None
    assert memory['content'] == "Test memory content 1"

async def test_memory_search(search_index, sample_memories):
    """Test memory search functionality."""
    # Test basic search
    results = await search_index.search("test memory")
    assert len(results) > 0
    
    # Test filtered search
    results = await search_index.search(
        "test memory",
        metadata_filters={"importance": 5}
    )
    assert len(results) == 1

async def test_memory_stats(memory_manager, sample_memories):
    """Test memory statistics and visualization data."""
    # Test basic stats
    stats = await memory_manager.get_stats()
    assert stats['total_memories'] == 2
    
    # Test activity data
    activity = await memory_manager.get_activity_data('7d')
    assert len(activity) > 0
    
    # Test type distribution
    types = await memory_manager.get_type_distribution()
    assert len(types) == 2  # CONVERSATION and FACT
    
    # Test connection stats
    connections = await memory_manager.get_connection_stats()
    assert isinstance(connections, list)

