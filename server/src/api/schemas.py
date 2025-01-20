# server/src/api/schemas.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime

class ModelSettings(BaseModel):
    """Model settings validation schema."""
    temperature: float = Field(0.7, ge=0.0, le=1.0)
    max_tokens: int = Field(512, ge=1, le=2048)
    top_p: float = Field(0.9, ge=0.0, le=1.0)
    frequency_penalty: float = Field(0.0, ge=-2.0, le=2.0)
    presence_penalty: float = Field(0.0, ge=-2.0, le=2.0)
    stop_sequences: List[str] = Field(default_factory=list)

class ChatRequest(BaseModel):
    """Chat message request validation schema."""
    message: str = Field(..., min_length=1)
    settings: Optional[ModelSettings] = None

    @field_validator('message')
    def message_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()

class ChatResponse(BaseModel):
    """Chat message response validation schema."""
    response: str
    tokens_used: int
    finish_reason: Optional[str]

class ModelStartRequest(BaseModel):
    """Model start request validation schema."""
    model_path: str = Field(..., min_length=1)
    settings: Optional[ModelSettings] = None

class ModelStatusResponse(BaseModel):
    """Model status response validation schema."""
    status: str
    model_path: Optional[str]
    settings: Optional[ModelSettings]
    ready: bool
    uptime: Optional[float]
    memory_usage: Optional[float]

class ErrorResponse(BaseModel):
    """Error response validation schema."""
    error: str
    code: str
    details: Optional[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=datetime.now)

# class MessageRequest(BaseModel):
#     content: str = Field(..., min_length=1)
#     max_tokens: Optional[int] = Field(512, ge=1, le=2048)
#     temperature: Optional[float] = Field(0.7, ge=0, le=2)

# class MessageResponse(BaseModel):
#     response: str
#     tokens_used: int
#     finish_reason: Optional[str]

# class ModelSettings(BaseModel):
#     temperature: float = Field(0.7, ge=0, le=2)
#     top_p: float = Field(0.9, ge=0, le=1)
#     max_tokens: int = Field(512, ge=1, le=2048)
#     frequency_penalty: float = Field(0.0, ge=-2, le=2)
#     presence_penalty: float = Field(0.0, ge=-2, le=2)

# class Memory(BaseModel):
#     content: Any
#     type: str
#     metadata: Optional[Dict[str, Any]] = {}
#     importance: Optional[int] = Field(0, ge=0, le=10)
#     timestamp: Optional[datetime] = None

#     class Config:
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }