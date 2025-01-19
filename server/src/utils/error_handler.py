# server/src/utils/error_handler.py
from functools import wraps
from flask import jsonify
from src.core.exceptions import (
    ModelError,
    MemoryError,
    TokenizationError,
    DatabaseError,
    APIError,
    LLMBaseException
)
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

def handle_exceptions(f):
    """Decorator for handling exceptions in API routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except LLMBaseException as e:
            logger.error(f"Known error occurred: {str(e)}", exc_info=True)
            return jsonify(e.to_dict()), 400
        except Exception as e:
            logger.error(f"Unexpected error occurred: {str(e)}", exc_info=True)
            return jsonify({
                'error': 'Internal Server Error',
                'message': str(e),
                'code': 'INTERNAL_ERROR'
            }), 500
    return decorated

def setup_error_handlers(app):
    """Sets up global error handlers for the Flask application."""

    @app.errorhandler(404)
    def not_found_error(error):  # noqa
        """Handle 404 Not Found errors."""
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found',
            'code': 'NOT_FOUND'
        }), 404

    @app.errorhandler(405)
    def method_not_allowed_error(error):  # noqa
        """Handle 405 Method Not Allowed errors."""
        return jsonify({
            'error': 'Method Not Allowed',
            'message': 'The method is not allowed for this endpoint',
            'code': 'METHOD_NOT_ALLOWED'
        }), 405

    @app.errorhandler(500)
    def internal_error(error):  # noqa
        """Handle 500 Internal Server Error."""
        logger.error("500 Internal Server Error", exc_info=True)
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred',
            'code': 'INTERNAL_ERROR'
        }), 500