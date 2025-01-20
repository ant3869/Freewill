# server/src/api/metrics_routes.py
from flask import Blueprint, jsonify
import psutil
import GPUtil
from datetime import datetime
from ..utils.logger import setup_logger
from ..llm.engine import LLMEngine
from ..core.constants import ModelStatus

logger = setup_logger(__name__)
metrics_api = Blueprint('metrics_api', __name__)

class MetricsCollector:
    """Collect system and model metrics."""
    
    @staticmethod
    def get_cpu_usage() -> float:
        """Get CPU usage percentage."""
        return psutil.cpu_percent(interval=0.1)
    
    @staticmethod
    def get_ram_usage() -> float:
        """Get RAM usage percentage."""
        return psutil.virtual_memory().percent
    
    @staticmethod
    def get_gpu_usage() -> float:
        """Get GPU usage if available."""
        try:
            gpus = GPUtil.getGPUs()
            if gpus:
                return sum(gpu.load * 100 for gpu in gpus) / len(gpus)
            return None
        except:
            return None
    
    @staticmethod
    def get_token_metrics() -> dict:
        """Get token usage metrics."""
        try:
            if not hasattr(LLMEngine, "status") or LLMEngine.status != ModelStatus.READY:
                return {'current': 0, 'total': 0, 'limit': 2048}
            
            return {
                'current': getattr(LLMEngine, 'current_tokens', 0),
                'total': getattr(LLMEngine, 'total_tokens', 0),
                'limit': LLMEngine.settings.get('max_tokens', 2048)
            }
        except Exception as e:
            logger.error(f"Error in get_token_metrics: {str(e)}")
            return {'current': 0, 'total': 0, 'limit': 2048}
    
    @staticmethod
    def get_response_time() -> float:
        """Get average response time."""
        if not LLMEngine or not hasattr(LLMEngine, 'response_times'):
            return 0.0
            
        times = LLMEngine.response_times[-10:]  # Last 10 responses
        return sum(times) / len(times) if times else 0.0
    
    @staticmethod
    def get_alignment_score() -> int:
        """Get model alignment score."""
        if not LLMEngine:
            return 0
            
        # This would be replaced with actual alignment metrics
        return 85  # Mock value for now
    
    @classmethod
    def collect_all(cls) -> dict:
        """Collect all metrics."""
        return {
            'cpu_usage': cls.get_cpu_usage(),
            'ram_usage': cls.get_ram_usage(),
            'gpu_usage': cls.get_gpu_usage(),
            'tokens': cls.get_token_metrics(),
            'response_time': cls.get_response_time(),
            'alignment_score': cls.get_alignment_score(),
            'timestamp': datetime.now().isoformat()
        }

@metrics_api.route('/api/metrics/system', methods=['GET'])
async def get_system_metrics():
    """Get current system metrics."""
    try:
        metrics = MetricsCollector.collect_all()
        return jsonify({
            'status': 'success',
            'data': metrics
        })
    except Exception as e:
        logger.error(f"Failed to collect metrics: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500