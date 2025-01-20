# server/src/api/memory_routes.py
from flask import Blueprint, jsonify, request
from ..data.memory_manager import MemoryManager
from ..data.search_index import SearchIndex
from .validators import validate_request
from ..utils.logger import setup_logger

logger = setup_logger(__name__)
memory_api = Blueprint('memory_api', __name__)

memory_manager = MemoryManager()
search_index = SearchIndex('memories.db')

@memory_api.route('/api/memories/search', methods=['GET'])
async def search_memories():
    """Search through memories."""
    try:
        query = request.args.get('query', '')
        limit = int(request.args.get('limit', 10))
        metadata_filters = request.args.get('filters', {})

        results = await search_index.search(
            query=query,
            limit=limit,
            metadata_filters=metadata_filters
        )

        return jsonify({
            'status': 'success',
            'results': results
        })

    except Exception as e:
        logger.error(f"Search failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@memory_api.route('/api/memories/stats', methods=['GET'])
async def get_memory_stats():
    """Get memory statistics and visualization data."""
    try:
        time_range = request.args.get('timeRange', '7d')
        
        # Get basic stats
        stats = await memory_manager.get_stats()
        
        # Get visualization data
        activity = await memory_manager.get_activity_data(time_range)
        types = await memory_manager.get_type_distribution()
        connections = await memory_manager.get_connection_stats()
        
        return jsonify({
            'status': 'success',
            'stats': {
                'totalMemories': stats['total_memories'],
                'activeConnections': stats['active_connections'],
                'memoryUsage': stats['memory_usage'],
                'activity': activity,
                'types': types,
                'connections': connections
            }
        })

    except Exception as e:
        logger.error(f"Failed to get memory stats: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500