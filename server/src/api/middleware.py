# server/src/api/middleware.py
import time
from functools import wraps
from flask import request, g, current_app
import uuid
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

def init_middleware(app):
    """Initialize middleware for the Flask app."""
    
    @app.before_request
    def before_request():
        """Log request details before processing."""
        g.start_time = time.time()
        g.request_id = str(uuid.uuid4())
        
        logger.info(
            f"Request started: {request.method} {request.path}",
            extra={
                'request_id': g.request_id,
                'method': request.method,
                'path': request.path,
                'params': dict(request.args),
            }
        )

    @app.after_request
    def after_request(response):
        """Log request details after processing."""
        if hasattr(g, 'start_time'):
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
        return response

    return app

# # server/src/api/middleware.py
# import time
# from functools import wraps
# from flask import request, g, current_app
# import uuid
# from ..utils.logger import setup_logger

# logger = setup_logger(__name__)

# def init_middleware(app):
#     """Initialize middleware for the Flask app."""
    
#     def log_request():
#         """Middleware to log API requests and responses."""
#         def decorator(f):
#             @wraps(f)
#             def wrapped(*args, **kwargs):
#                 # Generate unique request ID
#                 request_id = str(uuid.uuid4())
#                 g.request_id = request_id
                
#                 # Log request
#                 start_time = time.time()
#                 logger.info(
#                     f"Request started: {request.method} {request.path}",
#                     extra={
#                         'request_id': request_id,
#                         'method': request.method,
#                         'path': request.path,
#                         'params': dict(request.args),
#                         'headers': dict(request.headers),
#                         'body': request.get_json(silent=True)
#                     }
#                 )
                
#                 try:
#                     response = f(*args, **kwargs)
#                     duration = time.time() - start_time
                    
#                     # Log response
#                     logger.info(
#                         f"Request completed in {duration:.2f}s",
#                         extra={
#                             'request_id': request_id,
#                             'duration': duration,
#                             'status_code': response.status_code if hasattr(response, 'status_code') else None,
#                             'response_size': len(response.get_data()) if hasattr(response, 'get_data') else None
#                         }
#                     )
                    
#                     return response
                
#                 except Exception as e:
#                     duration = time.time() - start_time
#                     logger.error(
#                         f"Request failed after {duration:.2f}s",
#                         extra={
#                             'request_id': request_id,
#                             'duration': duration,
#                             'error': str(e)
#                         },
#                         exc_info=True
#                     )
#                     raise
                    
#             return wrapped
#         return decorator

# def setup_request_logging(app):
#     """Setup request logging for the Flask app."""
    
#     @app.before_request
#     def before_request():
#         g.start_time = time.time()
#         g.request_id = str(uuid.uuid4())

#     @app.after_request
#     def after_request(response):
#         if hasattr(g, 'start_time'):
#             duration = time.time() - g.start_time
#             logger.info(
#                 f"Request completed: {request.method} {request.path}",
#                 extra={
#                     'request_id': g.request_id,
#                     'method': request.method,
#                     'path': request.path,
#                     'status_code': response.status_code,
#                     'duration': duration,
#                     'response_size': len(response.get_data())
#                 }
#             )
#         return response

#     @app.before_request
#     def before_request():
#         """Log request details before processing."""
#         g.start_time = time.time()
#         g.request_id = str(uuid.uuid4())
        
#         logger.info(
#             f"Request started: {request.method} {request.path}",
#             extra={
#                 'request_id': g.request_id,
#                 'method': request.method,
#                 'path': request.path,
#                 'params': dict(request.args),
#             }
#         )

#     @app.after_request
#     def after_request(response):
#         """Log request details after processing."""
#         if hasattr(g, 'start_time'):
#             duration = time.time() - g.start_time
#             logger.info(
#                 f"Request completed: {request.method} {request.path}",
#                 extra={
#                     'request_id': g.request_id,
#                     'method': request.method,
#                     'path': request.path,
#                     'status_code': response.status_code,
#                     'duration': duration
#                 }
#             )
#         return response

#     return app

