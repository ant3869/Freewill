# src/core/constants.py
from enum import Enum

class ErrorCodes(str, Enum):
    """Error codes for system exceptions."""
    # Model related errors
    MODEL_LOAD_FAILED = "MODEL_LOAD_FAILED"
    MODEL_NOT_FOUND = "MODEL_NOT_FOUND"
    MODEL_RESPONSE_FAILED = "MODEL_RESPONSE_FAILED"
    
    # Token related errors
    TOKEN_PROCESS_FAILED = "TOKEN_PROCESS_FAILED"
    TOKEN_LIMIT_EXCEEDED = "TOKEN_LIMIT_EXCEEDED"
    
    # Memory related errors
    MEMORY_STORE_FAILED = "MEMORY_STORE_FAILED"
    MEMORY_RETRIEVE_FAILED = "MEMORY_RETRIEVE_FAILED"
    MEMORY_NOT_FOUND = "MEMORY_NOT_FOUND"
    
    # Database related errors
    DB_INIT_FAILED = "DB_INIT_FAILED"
    DB_READ_FAILED = "DB_READ_FAILED"
    DB_WRITE_FAILED = "DB_WRITE_FAILED"
    
    # Configuration related errors
    CONFIG_INVALID = "CONFIG_INVALID"
    CONFIG_MISSING = "CONFIG_MISSING"
    
    # API related errors
    API_ERROR = "API_ERROR"
    API_REQUEST_FAILED = "API_REQUEST_FAILED"
    API_RESPONSE_INVALID = "API_RESPONSE_INVALID"

class ModelStatus(str, Enum):
    """Status codes for model state."""
    INITIALIZING = "INITIALIZING"
    READY = "READY"
    ERROR = "ERROR"
    PROCESSING = "PROCESSING"
    STOPPED = "STOPPED"

class MessageTypes(str, Enum):
    """Types of messages in the system."""
    USER = "USER"
    SYSTEM = "SYSTEM"
    INTERNAL = "INTERNAL"
    EXTERNAL = "EXTERNAL"
    ERROR = "ERROR"

class MemoryTypes(str, Enum):
    """Types of memories stored in the system."""
    CONVERSATION = "CONVERSATION"
    CONTEXT = "CONTEXT"
    FACT = "FACT"
    PROMPT = "PROMPT"
    PREFERENCE = "PREFERENCE"