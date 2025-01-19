# server/src/api/validators.py
from functools import wraps
from flask import request, jsonify
from pydantic import ValidationError

def validate_request(schema_cls):
    """Decorator to validate request data against a Pydantic schema."""
    def decorator(f):
        @wraps(f)
        async def decorated(*args, **kwargs):
            try:
                # Handle both JSON and query parameters
                if request.is_json:
                    data = schema_cls(**request.get_json())
                else:
                    data = schema_cls(**request.args)
                return await f(data, *args, **kwargs)
            except ValidationError as e:
                return jsonify({
                    'error': 'Validation Error',
                    'details': e.errors()
                }), 400
        return decorated
    return decorator