# server/src/api/middleware.py
import time
import uuid
from functools import wraps
from flask import request, g, current_app
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

def sanitize_data(data):
    """Sanitize sensitive information from logs."""
    if not isinstance(data, dict):
        return data
    sanitized = data.copy()
    for key in sanitized.keys():
        if key.lower() in {"password", "token", "api_key"}:
            sanitized[key] = "******"
    return sanitized

def init_middleware(app):
    """Initialize middleware for the Flask app."""
    
    @app.before_request
    def before_request():
        """Log request details before processing with error handling."""
        try:
            g.start_time = time.time()
            g.request_id = str(uuid.uuid4())
            logger.info(
                f"Request started: {request.method} {request.path}",
                extra={
                    'request_id': g.request_id,
                    'method': request.method,
                    'path': request.path,
                    'params': sanitize_data(dict(request.args)),
                }
            )
        except Exception as e:
            logger.error(f"Error in before_request: {str(e)}", exc_info=True)
            g.start_time = None  # Reset timing to avoid incorrect calculations

    @app.after_request
    def after_request(response):
        """Log request details after processing with error handling."""
        try:
            if hasattr(g, 'start_time') and g.start_time is not None:
                duration = time.time() - g.start_time
                logger.info(
                    f"Request completed: {request.method} {request.path}",
                    extra={
                        'request_id': g.request_id,
                        'method': request.method,
                        'path': request.path,
                        'status_code': response.status_code,
                        'duration': duration
                    }
                )
        except Exception as e:
            logger.error(f"Error in after_request: {str(e)}", exc_info=True)
        return response

    return app