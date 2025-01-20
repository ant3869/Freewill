# server/src/llm/engine.py
from typing import Dict, Any, Optional
import time
from llama_cpp import Llama
import psutil
import os
from ..core.exceptions import ModelError
from ..core.constants import ModelStatus, ErrorCodes
from ..utils.logger import setup_logger
from ..services.cache_service import cache_service

logger = setup_logger(__name__)

class LLMEngine:
    """Real LLM Engine using llama.cpp."""
    
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model: Optional[Llama] = None
        self.status = ModelStatus.INITIALIZING
        self._start_time = time.time()
        self.settings = {
            'temperature': 0.7,
            'max_tokens': 512,
            'top_p': 0.9,
            'frequency_penalty': 0.0,
            'presence_penalty': 0.0,
            'stop_sequences': []
        }
        logger.info(f"Initializing LLM Engine with model: {model_path}")

    async def initialize(self) -> None:
        """Initialize the LLM model."""
        try:
            if not os.path.exists(self.model_path):
                raise ModelError(
                    message="Model file not found",
                    code=ErrorCodes.MODEL_NOT_FOUND,
                    details={"path": self.model_path}
                )

            self.model = Llama(
                model_path=self.model_path,
                n_ctx=2048,              # Context window
                n_parts=-1,              # Auto-detect number of parts
                n_gpu_layers=0,          # CPU only by default
                n_threads=os.cpu_count() # Use all CPU cores
            )
            
            self.status = ModelStatus.READY
            logger.info("Model initialized successfully")
            
        except Exception as e:
            self.status = ModelStatus.ERROR
            logger.error(f"Failed to initialize model: {str(e)}")
            raise ModelError(
                message="Failed to initialize model",
                code=ErrorCodes.MODEL_LOAD_FAILED,
                details={"error": str(e)}
            )

    async def generate_response(
        self,
        prompt: str,
        max_tokens: int = 512,
        temperature: float = 0.7,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """Generate a response using the LLM."""
        try:
            if not self.model or self.status != ModelStatus.READY:
                raise ModelError(
                    message="Model not ready",
                    code=ErrorCodes.MODEL_NOT_READY
                )

            # Check cache if enabled
            if use_cache:
                cache_key = f"llm_response:{prompt}:{max_tokens}:{temperature}"
                cached_response = await cache_service.get(cache_key)
                if cached_response:
                    logger.debug(f"Cache hit for prompt: {prompt[:50]}...")
                    return cached_response

            self.status = ModelStatus.PROCESSING
            start_time = time.time()
            logger.debug(f"Generating response for prompt: {prompt[:50]}...")

            # Generate response
            response = self.model.create_completion(
                prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=self.settings['top_p'],
                frequency_penalty=self.settings['frequency_penalty'],
                presence_penalty=self.settings['presence_penalty'],
                stop=self.settings['stop_sequences'] or None,
                echo=False
            )

            # Process response
            result = {
                "response": response['choices'][0]['text'].strip(),
                "tokens_used": response['usage']['total_tokens'],
                "finish_reason": response['choices'][0]['finish_reason'],
                "generation_time": time.time() - start_time
            }

            # Cache the response
            if use_cache:
                await cache_service.set(
                    cache_key,
                    result,
                    expire=300  # Cache for 5 minutes
                )

            self.status = ModelStatus.READY
            return result

        except Exception as e:
            self.status = ModelStatus.ERROR
            logger.error(f"Error generating response: {str(e)}")
            raise ModelError(
                message="Failed to generate response",
                code=ErrorCodes.MODEL_RESPONSE_FAILED,
                details={"error": str(e)}
            )

    def update_settings(self, settings: Dict[str, Any]) -> None:
        """Update model settings."""
        self.settings.update(settings)
        logger.info(f"Updated model settings: {settings}")

    def get_status(self) -> Dict[str, Any]:
        """Get detailed model status and metrics."""
        try:
            process = psutil.Process()
            memory_info = process.memory_info()
            
            return {
                "status": self.status,
                "model_path": self.model_path,
                "settings": self.settings,
                "ready": self.status == ModelStatus.READY,
                "uptime": time.time() - self._start_time,
                "memory_usage": {
                    "rss": memory_info.rss / 1024 / 1024,  # MB
                    "vms": memory_info.vms / 1024 / 1024   # MB
                },
                "cpu_usage": process.cpu_percent(),
                "thread_count": process.num_threads(),
                "context_size": 2048 if self.model else 0,
            }
        except Exception as e:
            logger.error(f"Error getting status: {str(e)}")
            return {
                "status": self.status,
                "model_path": self.model_path,
                "ready": False,
                "error": str(e)
            }

    def __str__(self) -> str:
        return f"LLMEngine(status={self.status}, model={self.model_path})"

# # src/llm/engine.py
# from typing import Dict, Any, Optional
# import random
# import time
# from llama_cpp import Llama
# from ..core.exceptions import ModelError
# from ..core.constants import ErrorCodes, ModelStatus
# from ..utils.logger import setup_logger
# from ..services.cache_service import cache_service
# import hashlib

# logger = setup_logger(__name__)

# class LLMEngine:
#     def __init__(self, model_path: str):
#         self.model_path = model_path
#         self.model = None
#         self.status = ModelStatus.INITIALIZING
#         self.settings = {
#             'temperature': 0.7,
#             'max_tokens': 512,
#             'top_p': 0.9,
#             'frequency_penalty': 0.0,
#             'presence_penalty': 0.0
#         }
#         logger.info(f"Initializing LLM Engine with model: {model_path}")

#     async def initialize(self) -> None:
#         """Simulate model initialization."""
#         try:
#             # Simulate loading time
#             time.sleep(1)
#             self.status = ModelStatus.READY
#             logger.info("LLM Engine initialized successfully")
#         except Exception as e:
#             self.status = ModelStatus.ERROR
#             logger.error(f"Failed to initialize LLM Engine: {str(e)}")
#             raise ModelError(
#                 message="Failed to initialize model",
#                 code=ErrorCodes.MODEL_LOAD_FAILED,
#                 details={"error": str(e)}
#             )

#     async def generate_response(
#         self,
#         prompt: str,
#         max_tokens: int = 512,
#         temperature: float = 0.7,
#         use_cache: bool = True
#     ) -> Dict[str, Any]:
#         """Generate a response for the given prompt."""
#         try:
#             if self.status != ModelStatus.READY:
#                 raise ModelError(
#                     message="Model not ready",
#                     code=ErrorCodes.MODEL_NOT_READY
#                 )

#             # Check cache if enabled
#             if use_cache:
#                 cache_key = hashlib.md5(
#                     f"{prompt}:{max_tokens}:{temperature}".encode('utf-8')
#                 ).hexdigest()
                
#                 cached_response = await cache_service.get(cache_key)
#                 if cached_response:
#                     logger.debug(f"Using cached response for prompt: {prompt[:50]}...")
#                     return cached_response

#             self.status = ModelStatus.PROCESSING
#             logger.debug(f"Generating response for prompt: {prompt[:50]}...")

#             # Simulate processing time
#             time.sleep(random.uniform(0.5, 2))

#             # Generate response
#             response = {
#                 "response": self._generate_mock_response(prompt),
#                 "tokens_used": len(prompt.split()) + len(response.split()),
#                 "finish_reason": "stop"
#             }
            
#             # Cache the response
#             if use_cache:
#                 await cache_service.set(
#                     cache_key,
#                     response,
#                     expire=300  # Cache for 5 minutes
#                 )
            
#             self.status = ModelStatus.READY
#             return response

#         except Exception as e:
#             self.status = ModelStatus.ERROR
#             logger.error(f"Error generating response: {str(e)}")
#             raise ModelError(
#                 message="Failed to generate response",
#                 code=ErrorCodes.MODEL_RESPONSE_FAILED,
#                 details={"error": str(e)}
#             )

#    # Add this to the LLMEngine class in server/src/llm/engine.py

#     def _generate_mock_response(self, prompt: str) -> str:
#         """Generate a contextual mock response based on the prompt."""
#         import random
        
#         prompt_lower = prompt.lower()
#         words = prompt_lower.split()
        
#         # Greeting patterns
#         greetings = {
#             "hello": ["Hello!", "Hi there!", "Greetings!"],
#             "hi": ["Hi!", "Hello!", "Hey there!"],
#             "hey": ["Hey!", "Hi!", "Hello there!"],
#             "good morning": ["Good morning! How can I help you today?"],
#             "good afternoon": ["Good afternoon! What can I do for you?"],
#             "good evening": ["Good evening! How may I assist you?"]
#         }
        
#         for greeting, responses in greetings.items():
#             if greeting in prompt_lower:
#                 return random.choice(responses)

#         # Question patterns
#         question_words = ["what", "who", "where", "when", "why", "how"]
#         if any(word in question_words for word in words):
#             topic = " ".join(words[1:4]) if len(words) > 3 else " ".join(words[1:])
#             responses = [
#                 f"That's an interesting question about {topic}. Let me analyze that for you...",
#                 f"Regarding {topic}, there are several important aspects to consider...",
#                 f"When it comes to {topic}, we need to look at multiple factors..."
#             ]
#             return random.choice(responses)

#         # Technical patterns
#         tech_keywords = ["code", "program", "bug", "error", "function", "api"]
#         if any(word in tech_keywords for word in words):
#             return self._generate_technical_response(prompt)

#         # Analytical patterns
#         analytical_keywords = ["analyze", "compare", "difference", "similar", "better", "worse"]
#         if any(word in analytical_keywords for word in words):
#             return self._generate_analytical_response(prompt)

#         # Default response patterns
#         if len(prompt) < 20:
#             return "Could you provide more details about that? It would help me give you a more specific response."
        
#         return self._generate_general_response(prompt)

#     def _generate_technical_response(self, prompt: str) -> str:
#         """Generate technical-focused responses."""
#         responses = [
#             "From a technical perspective, this involves several key components...",
#             "Let me break down the technical aspects of this for you...",
#             "This is an interesting technical challenge. Here's my analysis...",
#             "There are several approaches we could take to solve this...",
#             "Based on best practices, I would recommend the following approach..."
#         ]
#         return random.choice(responses)

#     def _generate_analytical_response(self, prompt: str) -> str:
#         """Generate analytical responses."""
#         responses = [
#             "Let's analyze this systematically. First, we should consider...",
#             "There are several key factors to compare here...",
#             "From an analytical perspective, we need to consider...",
#             "This requires a detailed analysis. Let's break it down...",
#             "Looking at this objectively, there are pros and cons to consider..."
#         ]
#         return random.choice(responses)

#     def _generate_general_response(self, prompt: str) -> str:
#         """Generate general responses."""
#         topic = " ".join(prompt.split()[:3])
#         responses = [
#             f"I understand you're interested in {topic}. Let me share my insights...",
#             f"Regarding {topic}, there are several important points to consider...",
#             f"When it comes to {topic}, I can provide some helpful information...",
#             f"I've analyzed your question about {topic}, and here's what I think...",
#             f"Based on my understanding of {topic}, here's what you should know..."
#         ]
#         return random.choice(responses)
#     # async def load_model(self):
#     #     """Load the LLM model."""
#     #     try:
#     #         if not os.path.exists(self.model_path):
#     #             raise ModelError(
#     #                 message="Model file not found",
#     #                 code=ErrorCodes.MODEL_NOT_FOUND,
#     #                 details={"path": self.model_path}
#     #             )

#     #         self.model = Llama(
#     #             model_path=self.model_path,
#     #             n_ctx=4096,  # Context window
#     #             n_batch=512  # Batch size for prompt processing
#     #         )
#     #         self.status = ModelStatus.READY
            
#     #     except Exception as e:
#     #         self.status = ModelStatus.ERROR
#     #         raise ModelError(
#     #             message="Failed to load model",
#     #             code=ErrorCodes.MODEL_LOAD_FAILED,
#     #             details={"error": str(e)}
#     #         )

#     # async def generate_response(
#     #     self,
#     #     prompt: str,
#     #     max_tokens: int = 512,
#     #     temperature: float = 0.7
#     # ) -> Dict[str, Any]:
#     #     """Generate a response for the given prompt."""
#     #     if not self.model or self.status != ModelStatus.READY:
#     #         raise ModelError(
#     #             message="Model not ready",
#     #             code=ErrorCodes.MODEL_NOT_FOUND,
#     #             details={"status": self.status}
#     #         )

#     #     try:
#     #         self.status = ModelStatus.PROCESSING
            
#     #         response = self.model(
#     #             prompt=prompt,
#     #             max_tokens=max_tokens,
#     #             temperature=temperature,
#     #             echo=False
#     #         )

#     #         self.status = ModelStatus.READY
            
#     #         return {
#     #             "response": response["choices"][0]["text"],
#     #             "tokens_used": len(response["usage"]["prompt_tokens"]) + len(response["usage"]["completion_tokens"]),
#     #             "finish_reason": response["choices"][0]["finish_reason"]
#     #         }
            
#     #     except Exception as e:
#     #         self.status = ModelStatus.ERROR
#     #         raise ModelError(
#     #             message="Failed to generate response",
#     #             code=ErrorCodes.MODEL_RESPONSE_FAILED,
#     #             details={"error": str(e)}
#     #         )

#     # def get_status(self) -> Dict[str, Any]:
#     #     """Get current model status."""
#     #     return {
#     #         "status": self.status,
#     #         "model_path": self.model_path,
#     #         "initialized": self.model is not None
#     #     }