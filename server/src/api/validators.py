# server/src/api/validators.py
from functools import wraps
from flask import request, jsonify
from pydantic import ValidationError
from typing import Type, Optional
from .schemas import ErrorResponse
from datetime import datetime

def validate_request(request_model: Optional[Type] = None, response_model: Optional[Type] = None):
    """Validate request and response data using Pydantic models."""
    def decorator(f):
        @wraps(f)
        async def wrapper(*args, **kwargs):
            try:
                # Validate request data if model provided
                if request_model:
                    if request.is_json:
                        data = request_model(**request.get_json())
                    else:
                        data = request_model(**request.args)
                    kwargs['validated_data'] = data

                # Execute handler
                result = await f(*args, **kwargs)

                # Validate response if model provided
                if response_model:
                    if isinstance(result, tuple):
                        response_data, status_code = result
                    else:
                        response_data, status_code = result, 200

                    # Validate and serialize response
                    validated_response = response_model(**response_data)
                    return jsonify(validated_response.dict()), status_code

                return result

            except ValidationError as e:
                error_response = ErrorResponse(
                    error="Validation Error",
                    code="VALIDATION_ERROR",
                    details={'errors': e.errors()},  # Ensure dictionary format
                    timestamp=datetime.now()
                )
                return jsonify(error_response.dict()), 400

            except Exception as e:
                error_response = ErrorResponse(
                    error=str(e),
                    code="INTERNAL_ERROR",
                    details={"type": type(e).__name__},
                    timestamp=datetime.now()
                )
                return jsonify(error_response.dict()), 500

        return wrapper
    return decorator

# def validate_request(schema_cls):
#     """Decorator to validate request data against a Pydantic schema."""
#     def decorator(f):
#         @wraps(f)
#         async def decorated(*args, **kwargs):
#             try:
#                 # Handle both JSON and query parameters
#                 if request.is_json:
#                     data = schema_cls(**request.get_json())
#                 else:
#                     data = schema_cls(**request.args)
#                 return await f(data, *args, **kwargs)
#             except ValidationError as e:
#                 return jsonify({
#                     'error': 'Validation Error',
#                     'details': e.errors()
#                 }), 400
#         return decorated
#     return decorator