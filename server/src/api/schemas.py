# server/src/api/schemas.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class MessageRequest(BaseModel):
    content: str = Field(..., min_length=1)
    max_tokens: Optional[int] = Field(512, ge=1, le=2048)
    temperature: Optional[float] = Field(0.7, ge=0, le=2)

class MessageResponse(BaseModel):
    response: str
    tokens_used: int
    finish_reason: Optional[str]

class ModelSettings(BaseModel):
    temperature: float = Field(0.7, ge=0, le=2)
    top_p: float = Field(0.9, ge=0, le=1)
    max_tokens: int = Field(512, ge=1, le=2048)
    frequency_penalty: float = Field(0.0, ge=-2, le=2)
    presence_penalty: float = Field(0.0, ge=-2, le=2)

class Memory(BaseModel):
    content: Any
    type: str
    metadata: Optional[Dict[str, Any]] = {}
    importance: Optional[int] = Field(0, ge=0, le=10)
    timestamp: Optional[datetime] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }