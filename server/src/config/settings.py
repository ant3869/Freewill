# src/config/settings.py
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List
import os
from pathlib import Path

from ..core.exceptions import ConfigurationError
from ..core.constants import ErrorCodes

@dataclass
class ModelConfig:
    """LLM model configuration."""
    model_path: str
    max_tokens: int = 512
    temperature: float = 0.7
    top_p: float = 0.9
    presence_penalty: float = 0.0
    frequency_penalty: float = 0.0
    stop_sequences: List[str] = field(default_factory=list)
    cache_size: Optional[int] = 1000

@dataclass
class MemoryConfig:
    """Memory system configuration."""
    db_path: str = "memory.db"
    max_entries: int = 10000
    ttl_seconds: int = 86400  # 24 hours
    vacuum_threshold: int = 1000
    index_fields: List[str] = field(default_factory=lambda: ["type", "timestamp"])

@dataclass
class LogConfig:
    """Logging configuration."""
    level: str = "INFO"
    file_path: str = "logs/system.log"
    max_size: int = 1024 * 1024 * 10  # 10MB
    backup_count: int = 5
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

@dataclass
class SystemConfig:
    """Main system configuration."""
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 5000
    worker_threads: int = 4
    models_dir: str = field(default_factory=lambda: str(Path("models").absolute()))
    
    model: ModelConfig = field(default_factory=ModelConfig)
    memory: MemoryConfig = field(default_factory=MemoryConfig)
    logging: LogConfig = field(default_factory=LogConfig)
    
    @classmethod
    def from_env(cls) -> 'SystemConfig':
        """Create configuration from environment variables."""
        return cls(
            debug=os.getenv("DEBUG", "false").lower() == "true",
            host=os.getenv("HOST", "0.0.0.0"),
            port=int(os.getenv("PORT", "5000")),
            worker_threads=int(os.getenv("WORKER_THREADS", "4")),
            models_dir=os.getenv("MODELS_DIR", str(Path("models").absolute()))
        )

    def validate(self) -> None:
        """Validate configuration settings."""
        if not os.path.exists(self.models_dir):
            raise ConfigurationError(
                message="Models directory does not exist",
                code=ErrorCodes.CONFIG_INVALID,
                details={"path": self.models_dir}
            )
        
        if self.worker_threads < 1:
            raise ConfigurationError(
                message="Worker threads must be at least 1",
                code=ErrorCodes.CONFIG_INVALID,
                details={"worker_threads": self.worker_threads}
            )
            
        # Ensure log directory exists
        log_dir = os.path.dirname(self.logging.file_path)
        os.makedirs(log_dir, exist_ok=True)

config = SystemConfig.from_env()