# server/src/api/routes.py
# from flask import Blueprint, request, jsonify
from datetime import datetime
from ..core.constants import ModelStatus, MemoryTypes
from ..core.exceptions import LLMBaseException, ModelError, MemoryError
from ..llm.engine import LLMEngine
from ..data.memory_manager import MemoryManager
# from ..api.schemas import MessageRequest, ModelSettings, Memory
from ..api.validators import validate_request
from ..utils.error_handler import handle_exceptions
from ..utils.logger import setup_logger
from flask import Blueprint, jsonify
from .schemas import (
    ChatRequest,
    ChatResponse,
    ModelSettings,
    ModelStartRequest,
    ModelStatusResponse,
    ErrorResponse
)

logger = setup_logger(__name__)
api = Blueprint('api', __name__)

# Initialize managers (these should be properly initialized with your config)
llm_engine = None
memory_manager = None

@api.route('/api/model/start', methods=['POST'])
@validate_request(ModelStartRequest, ModelStatusResponse)
async def start_model(validated_data):
    """Start and initialize the model."""
    global llm_engine
    try:
        llm_engine = LLMEngine(validated_data.model_path)
        if validated_data.settings:
            llm_engine.update_settings(validated_data.settings.dict())
        
        await llm_engine.initialize()
        status = llm_engine.get_status()
        
        return status
    
    except Exception as e:
        logger.error(f"Failed to start model: {str(e)}")
        raise

@api.route('/api/chat/send', methods=['POST'])
@validate_request(ChatRequest, ChatResponse)
async def send_message(validated_data):
    """Handle chat message sending."""
    global llm_engine
    try:
        if not llm_engine:
            raise ValueError('Model not initialized')

        settings = validated_data.settings.dict() if validated_data.settings else {}
        response = await llm_engine.generate_response(
            prompt=validated_data.message,
            **settings
        )
        
        return response
    
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        raise

# @api.route('/api/model/start', methods=['POST'])
# @validate_request(ModelStartRequest, ModelStatusResponse)
# async def start_model():
#     """Start and initialize the model."""
#     global llm_engine
#     try:
#         data = request.get_json()
#         model_path = data.get('model_path', 'default-model')
        
#         llm_engine = LLMEngine(model_path)
#         await llm_engine.initialize()
        
#         return jsonify({
#             "status": "success",
#             "model_info": llm_engine.get_status()
#         })
    
#     except Exception as e:
#         logger.error(f"Failed to start model: {str(e)}")
#         return jsonify({
#             "status": "error",
#             "error": str(e)
#         }), 500

# @api.route('/api/chat/send', methods=['POST'])
# @validate_request(ChatRequest, ChatResponse)
# async def send_message():
#     """Handle chat message sending."""
#     global llm_engine
#     try:
#         data = request.get_json()
#         if not data or 'message' not in data:
#             return jsonify({'error': 'No message provided'}), 400

#         if not llm_engine:
#             return jsonify({'error': 'Model not initialized'}), 503

#         response = await llm_engine.generate_response(
#             prompt=data['message'],
#             max_tokens=data.get('max_tokens', 512),
#             temperature=data.get('temperature', 0.7)
#         )

#         return jsonify({
#             "status": "success",
#             "response": response
#         })

#     except Exception as e:
#         logger.error(f"Error generating response: {str(e)}")
#         return jsonify({
#             "status": "error",
#             "error": str(e)
#         }), 500

@api.route('/api/model/settings', methods=['POST'])
@validate_request(ModelSettings, ModelStatusResponse)
async def update_settings(validated_data):
    """Update model settings."""
    global llm_engine
    try:
        if not llm_engine:
            raise ValueError('Model not initialized')
            
        llm_engine.update_settings(validated_data.dict())
        return llm_engine.get_status()
    
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}")
        raise

@api.route('/api/model/status', methods=['GET'])
@validate_request(response_model=ModelStatusResponse)
async def get_status():
    """Get current model status."""
    global llm_engine
    try:
        if not llm_engine:
            return {
                'status': ModelStatus.STOPPED,
                'ready': False,
                'model_path': None,
                'settings': None
            }
            
        return llm_engine.get_status()
    
    except Exception as e:
        logger.error(f"Error getting status: {str(e)}")
        raise

# @api.route('/api/send', methods=['POST'])
# async def send_message():
#     """Handle chat message sending."""
#     try:
#         data = request.json
#         if not data or 'message' not in data:
#             return jsonify({'error': 'No message provided'}), 400

#         if not llm_engine:
#             return jsonify({'error': 'Model not initialized'}), 503

#         return jsonify({"status": "success", "message": "Message endpoint working"})

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @api.route('/api/start', methods=['POST'])
# async def start_model():
#     """Start and load the LLM model."""
#     try:
#         global llm_engine
#         data = request.get_json()
#         model_path = data.get('model_path')
        
#         if not model_path:
#             return jsonify({
#                 "error": "No model path provided"
#             }), 400

#         llm_engine = LLMEngine(model_path)
#         await llm_engine.load_model()
        
#         return jsonify({
#             "status": "success",
#             "model_info": llm_engine.get_status()
#         })
        
#     except LLMBaseException as e:
#         return jsonify(e.to_dict()), 500
#     except Exception as e:
#         return jsonify({
#             "error": str(e)
#         }), 500

# @api.route('/api/generate', methods=['POST'])
# async def generate():
#     """Generate a response for the given prompt."""
#     try:
#         if not llm_engine:
#             return jsonify({
#                 "error": "Model not initialized"
#             }), 400

#         data = request.get_json()
#         prompt = data.get('prompt')
#         max_tokens = data.get('max_tokens', 512)
#         temperature = data.get('temperature', 0.7)

#         if not prompt:
#             return jsonify({
#                 "error": "No prompt provided"
#             }), 400

#         response = await llm_engine.generate_response(
#             prompt=prompt,
#             max_tokens=max_tokens,
#             temperature=temperature
#         )
        
#         return jsonify(response)
        
#     except LLMBaseException as e:
#         return jsonify(e.to_dict()), 500
#     except Exception as e:
#         return jsonify({
#             "error": str(e)
#         }), 500

# @api.route('/api/status', methods=['GET'])
# async def get_status():
#     """Get current model status."""
#     try:
#         if not llm_engine:
#             return jsonify({
#                 "status": "not_initialized"
#             })
            
#         return jsonify(llm_engine.get_status())
        
#     except Exception as e:
#         return jsonify({
#             "error": str(e)
#         }), 500

# @api.route('/api/control', methods=['POST'])
# async def control_model():
#     """Control model state (start/stop)."""
#     try:
#         data = request.json
#         action = data.get('action')
        
#         if action == 'start':
#             if not llm_engine:
#                 llm_engine = LLMEngine(data.get('model_path'))
#             await llm_engine.load_model()
#             return jsonify({'status': 'started'})
            
#         elif action == 'stop':
#             if llm_engine:
#                 llm_engine = None
#             return jsonify({'status': 'stopped'})
            
#         return jsonify({'error': 'Invalid action'}), 400

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @api.route('/api/memory', methods=['GET'])
# async def get_memories():
#     """Retrieve memories."""
#     try:
#         if not memory_manager:
#             return jsonify({'error': 'Memory system not initialized'}), 503

#         memory_type = request.args.get('type')
#         limit = int(request.args.get('limit', 10))
        
#         memories = await memory_manager.retrieve(
#             memory_type=MemoryTypes[memory_type] if memory_type else None,
#             limit=limit
#         )
        
#         return jsonify({'memories': memories})

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @api.route('/api/settings', methods=['GET', 'POST'])
# async def model_settings():
#     """Get or update model settings."""
#     try:
#         if request.method == 'GET':
#             if not llm_engine:
#                 return jsonify({'error': 'Model not initialized'}), 503
#             return jsonify(llm_engine.get_status())
            
#         else:  # POST
#             if not llm_engine:
#                 return jsonify({'error': 'Model not initialized'}), 503
                
#             settings = request.json
#             # Update model settings (implement this in your LLMEngine)
#             llm_engine.update_settings(settings)
#             return jsonify({'status': 'settings updated'})

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
    

# @api.route('/api/model/settings', methods=['POST'])
# @handle_exceptions
# @validate_request(ModelSettings)
# async def update_model_settings(data: ModelSettings):
#     """Update model settings with validation."""
#     if not llm_engine:
#         return jsonify({'error': 'Model not initialized'}), 503
        
#     # Update model settings
#     llm_engine.update_settings(data.dict())
#     return jsonify({'status': 'settings updated'})

# @api.route('/api/memory', methods=['POST'])
# @handle_exceptions
# @validate_request(Memory)
# async def store_memory(data: Memory):
#     """Store validated memory."""
#     if not memory_manager:
#         return jsonify({'error': 'Memory system not initialized'}), 503

#     memory_id = await memory_manager.store(
#         content=data.content,
#         memory_type=data.type,
#         metadata=data.metadata,
#         importance=data.importance
#     )
    
#     return jsonify({'id': memory_id})