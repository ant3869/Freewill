# server/src/api/system_routes.py
from flask import Blueprint, jsonify, request
from ..llm.engine import LLMEngine
from .validators import validate_request
from ..utils.logger import setup_logger
from ..core.constants import ModelStatus

logger = setup_logger(__name__)
system_api = Blueprint('system_api', __name__)

# Global LLM engine instance
llm_engine = None

@system_api.route('/api/model/start', methods=['POST'])
async def start_model():
    """Start and initialize the LLM model."""
    global llm_engine
    try:
        data = request.get_json()
        model_path = data.get('model_path')
        
        if not model_path:
            return jsonify({
                'status': 'error',
                'message': 'No model path provided'
            }), 400

        if llm_engine and llm_engine.status == ModelStatus.READY:
            return jsonify({
                'status': 'success',
                'message': 'Model already running',
                'model_info': llm_engine.get_status()
            })

        llm_engine = LLMEngine(model_path)
        await llm_engine.initialize()
        
        return jsonify({
            'status': 'success',
            'message': 'Model started successfully',
            'model_info': llm_engine.get_status()
        })
        
    except Exception as e:
        logger.error(f"Failed to start model: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@system_api.route('/api/model/stop', methods=['POST'])
async def stop_model():
    """Stop the LLM model."""
    global llm_engine
    try:
        if not llm_engine:
            return jsonify({
                'status': 'success',
                'message': 'Model already stopped'
            })

        llm_engine = None
        return jsonify({
            'status': 'success',
            'message': 'Model stopped successfully'
        })
        
    except Exception as e:
        logger.error(f"Failed to stop model: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@system_api.route('/api/model/status', methods=['GET'])
async def get_model_status():
    """Get current model status."""
    global llm_engine
    try:
        if not llm_engine:
            return jsonify({
                'status': ModelStatus.STOPPED,
                'ready': False,
                'model_path': None,
                'settings': None
            })
            
        return jsonify(llm_engine.get_status())
        
    except Exception as e:
        logger.error(f"Failed to get model status: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@system_api.route('/api/system/health', methods=['GET'])
async def health_check():
    """System health check endpoint."""
    try:
        status = {
            'status': 'healthy',
            'model_status': llm_engine.status if llm_engine else ModelStatus.STOPPED,
            'api_version': '1.0.0'
        }
        
        return jsonify(status)
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500