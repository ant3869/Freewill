# src/core/exceptions.py
from typing import Optional, Dict, Any
from datetime import datetime

class LLMBaseException(Exception):
    """Base exception for all LLM-related errors."""
    def __init__(
        self, 
        message: str,
        code: str = None,
        details: Dict[str, Any] = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary format."""
        return {
            'error': self.__class__.__name__,
            'message': self.message,
            'code': self.code,
            'details': self.details,
            'timestamp': self.timestamp.isoformat()
        }

class ModelError(LLMBaseException):
    """Errors related to model operations."""
    pass

class TokenizationError(LLMBaseException):
    """Errors during text tokenization."""
    pass

class MemoryError(LLMBaseException):
    """Errors related to memory operations."""
    pass

class DatabaseError(LLMBaseException):
    """Errors related to database operations."""
    pass

class ConfigurationError(LLMBaseException):
    """Errors related to system configuration."""
    pass

class APIError(LLMBaseException):
    """Errors related to API operations."""
    pass