# server/src/api/analytics_routes.py
from flask import Blueprint, jsonify, request
from ..services.analytics import analytics_service
from .validators import validate_request
from ..utils.logger import setup_logger

logger = setup_logger(__name__)
analytics_api = Blueprint('analytics_api', __name__)

@analytics_api.route('/api/analytics/request-metrics', methods=['GET'])
def get_request_metrics():
    """Get request-related analytics."""
    try:
        time_range = request.args.get('timeRange', '1h')
        metrics = analytics_service.get_request_metrics(time_range)
        return jsonify({
            'status': 'success',
            'data': metrics
        })
    except Exception as e:
        logger.error(f"Failed to get request metrics: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@analytics_api.route('/api/analytics/performance-metrics', methods=['GET'])
def get_performance_metrics():
    """Get performance-related analytics."""
    try:
        time_range = request.args.get('timeRange', '1h')
        metrics = analytics_service.get_performance_metrics(time_range)
        return jsonify({
            'status': 'success',
            'data': metrics
        })
    except Exception as e:
        logger.error(f"Failed to get performance metrics: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500