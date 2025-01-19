# src/llm/engine.py
from typing import Dict, Any, Optional
import os
from llama_cpp import Llama
from ..core.exceptions import ModelError
from ..core.constants import ErrorCodes, ModelStatus

class LLMEngine:
    def __init__(self, model_path: str):
        """Initialize LLM engine with model path."""
        self.model_path = model_path
        self.model = None
        self.status = ModelStatus.INITIALIZING

    async def load_model(self):
        """Load the LLM model."""
        try:
            if not os.path.exists(self.model_path):
                raise ModelError(
                    message="Model file not found",
                    code=ErrorCodes.MODEL_NOT_FOUND,
                    details={"path": self.model_path}
                )

            self.model = Llama(
                model_path=self.model_path,
                n_ctx=4096,  # Context window
                n_batch=512  # Batch size for prompt processing
            )
            self.status = ModelStatus.READY
            
        except Exception as e:
            self.status = ModelStatus.ERROR
            raise ModelError(
                message="Failed to load model",
                code=ErrorCodes.MODEL_LOAD_FAILED,
                details={"error": str(e)}
            )

    async def generate_response(
        self,
        prompt: str,
        max_tokens: int = 512,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generate a response for the given prompt."""
        if not self.model or self.status != ModelStatus.READY:
            raise ModelError(
                message="Model not ready",
                code=ErrorCodes.MODEL_NOT_FOUND,
                details={"status": self.status}
            )

        try:
            self.status = ModelStatus.PROCESSING
            
            response = self.model(
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                echo=False
            )

            self.status = ModelStatus.READY
            
            return {
                "response": response["choices"][0]["text"],
                "tokens_used": len(response["usage"]["prompt_tokens"]) + len(response["usage"]["completion_tokens"]),
                "finish_reason": response["choices"][0]["finish_reason"]
            }
            
        except Exception as e:
            self.status = ModelStatus.ERROR
            raise ModelError(
                message="Failed to generate response",
                code=ErrorCodes.MODEL_RESPONSE_FAILED,
                details={"error": str(e)}
            )

    def get_status(self) -> Dict[str, Any]:
        """Get current model status."""
        return {
            "status": self.status,
            "model_path": self.model_path,
            "initialized": self.model is not None
        }