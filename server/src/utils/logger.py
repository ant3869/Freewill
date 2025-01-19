# server/src/utils/logger.py
import logging
import sys
import json
from datetime import datetime
from pathlib import Path
from logging.handlers import RotatingFileHandler
from functools import wraps
import traceback
import time

class CustomFormatter(logging.Formatter):
    """Custom formatter with colored output for console."""
    
    COLORS = {
        'DEBUG': '\033[94m',    # Blue
        'INFO': '\033[92m',     # Green
        'WARNING': '\033[93m',  # Yellow
        'ERROR': '\033[91m',    # Red
        'CRITICAL': '\033[95m'  # Magenta
    }
    RESET = '\033[0m'

    def format(self, record):
        # Add timestamp to the record
        record.timestamp = datetime.fromtimestamp(record.created).isoformat()
        
        # Add trace ID if it exists
        record.trace_id = getattr(record, 'trace_id', 'no-trace')
        
        # Color the output for console handler
        if hasattr(self, 'is_console') and self.is_console:
            record.levelname = f"{self.COLORS.get(record.levelname, '')}{record.levelname}{self.RESET}"
        
        # Format exception info if it exists
        if record.exc_info:
            record.exc_text = ''.join(traceback.format_exception(*record.exc_info))
            
        return super().format(record)

def setup_logger(name: str, log_dir: str = "logs") -> logging.Logger:
    """Set up logger with both file and console handlers."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # Create logs directory if it doesn't exist
    Path(log_dir).mkdir(parents=True, exist_ok=True)
    
    # Prevent adding handlers multiple times
    if logger.hasHandlers():
        return logger
        
    # File handler for all logs
    file_handler = RotatingFileHandler(
        filename=f"{log_dir}/app.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_formatter = CustomFormatter(
        '%(timestamp)s [%(trace_id)s] %(levelname)s [%(name)s:%(lineno)d] %(message)s'
    )
    file_handler.setFormatter(file_formatter)
    
    # Error file handler
    error_handler = RotatingFileHandler(
        filename=f"{log_dir}/error.log",
        maxBytes=10 * 1024 * 1024,
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_formatter = CustomFormatter(
        '%(timestamp)s %(levelname)s [%(name)s] %(message)s'
    )
    console_formatter.is_console = True
    console_handler.setFormatter(console_formatter)
    
    # Add all handlers
    logger.addHandler(file_handler)
    logger.addHandler(error_handler)
    logger.addHandler(console_handler)
    
    return logger

def log_execution_time(logger):
    """Decorator to log function execution time."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                logger.debug(
                    f"Function {func.__name__} executed in {execution_time:.2f} seconds"
                )
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(
                    f"Function {func.__name__} failed after {execution_time:.2f} seconds",
                    exc_info=True
                )
                raise
        return wrapper
    return decorator

# Example usage:
logger = setup_logger(__name__)

@log_execution_time(logger)
def example_function():
    logger.info("This is an info message")
    logger.debug("This is a debug message")
    logger.error("This is an error message")

# # utils/logger.py
# import logging
# import sys
# from logging.handlers import RotatingFileHandler
# from typing import Optional
# from datetime import datetime
# from pathlib import Path

# class LogManager:
#     """Centralized logging management."""
    
#     def __init__(self, config):
#         self.config = config
#         self._loggers = {}
        
#     def get_logger(self, name: str) -> logging.Logger:
#         """Get or create a logger with given name."""
#         if name in self._loggers:
#             return self._loggers[name]
            
#         logger = logging.getLogger(name)
#         logger.setLevel(getattr(logging, self.config.logging.level))
        
#         # Ensure log directory exists
#         log_path = Path(self.config.logging.file_path)
#         log_path.parent.mkdir(parents=True, exist_ok=True)
        
#         # File handler
#         file_handler = RotatingFileHandler(
#             filename=str(log_path),
#             maxBytes=self.config.logging.max_size,
#             backupCount=self.config.logging.backup_count
#         )
#         file_handler.setFormatter(logging.Formatter(self.config.logging.format))
#         logger.addHandler(file_handler)
        
#         # Console handler
#         console_handler = logging.StreamHandler(sys.stdout)
#         console_handler.setFormatter(logging.Formatter(self.config.logging.format))
#         logger.addHandler(console_handler)
        
#         self._loggers[name] = logger
#         return logger
        
#     def log_exception(self, logger: logging.Logger, e: Exception, context: Optional[dict] = None):
#         """Log an exception with context."""
#         error_details = {
#             'type': type(e).__name__,
#             'message': str(e),
#             'timestamp': datetime.utcnow().isoformat(),
#             'context': context or {}
#         }
#         logger.error(f"Exception occurred: {error_details}", exc_info=True)

# # convenience.py
# def setup_logger(name: str, config) -> logging.Logger:
#     """Convenience function to get a logger."""
#     log_manager = LogManager(config)
#     return log_manager.get_logger(name)