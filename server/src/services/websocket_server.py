# src/services/websocket_server.py
try:
    from flask_socketio import SocketIO, emit
except ImportError:
    raise ImportError("Please install flask-socketio using: pip install flask-socketio")

from flask import request
from datetime import datetime
from typing import Callable, Dict, Any, Optional
from ..core.exceptions import APIError
from ..core.constants import ModelStatus, ErrorCodes
from ..utils.logger import setup_logger
from ..llm.engine import LLMEngine

logger = setup_logger(__name__)

# Initialize SocketIO instance
socketio = SocketIO()
llm_engine: Optional[LLMEngine] = None

class WebSocketManager:
    def __init__(self):
        self.connected_clients: Dict[str, Dict[str, Any]] = {}
        self._llm_engine: Optional[LLMEngine] = None
        self._event_handlers: Dict[str, Callable] = {}
        
    def set_engine(self, engine: Optional[LLMEngine]) -> None:
        """Set the LLM engine instance."""
        self._llm_engine = engine

    def _register_handler(self, event: str, handler: Callable) -> None:
        """Register an event handler with Socket.IO."""
        self._event_handlers[event] = handler
        socketio.on(event)(handler)

    def setup_events(self) -> None:
        """Setup WebSocket event handlers."""
        # Register connect handler
        def on_connect() -> None:
            try:
                client_id = request.sid
                self.connected_clients[client_id] = {
                    'status': 'connected',
                    'timestamp': datetime.now().isoformat()
                }
                logger.info(f"Client connected: {client_id}")
                emit('connection_acknowledged', {'status': 'connected'})
            except Exception as e:
                logger.error(f"Connection error: {str(e)}")
                raise APIError(
                    message="WebSocket connection failed",
                    code=ErrorCodes.API_ERROR,
                    details={"error": str(e)}
                )
        self._register_handler('connect', on_connect)

        # Register disconnect handler
        def on_disconnect() -> None:
            client_id = request.sid
            if client_id in self.connected_clients:
                del self.connected_clients[client_id]
                logger.info(f"Client disconnected: {client_id}")
        self._register_handler('disconnect', on_disconnect)

        # Register status request handler
        def on_status_request(data: Dict[str, Any] = None) -> None:
            try:
                if self._llm_engine:
                    status = self._llm_engine.get_status()
                    emit('model_status_update', status)
                else:
                    emit('model_status_update', {'status': ModelStatus.STOPPED})
            except Exception as e:
                logger.error(f"Status request error: {str(e)}")
                emit('error', {
                    'message': 'Failed to get model status',
                    'code': ErrorCodes.API_ERROR
                })
        self._register_handler('model_status_request', on_status_request)

        logger.info("WebSocket event handlers registered")

    def broadcast_status(self, status: Dict[str, Any]) -> None:
        """Broadcast status updates to all connected clients."""
        try:
            socketio.emit('model_status_update', status)
            logger.debug(f"Status broadcast: {status}")
        except Exception as e:
            logger.error(f"Broadcast error: {str(e)}")
            raise APIError(
                message="Failed to broadcast status",
                code=ErrorCodes.API_ERROR,
                details={"error": str(e)}
            )

    @property
    def connected_count(self) -> int:
        """Get the number of connected clients."""
        return len(self.connected_clients)

    def get_client_info(self, client_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific client."""
        return self.connected_clients.get(client_id)

# class WebSocketManager:
#     def __init__(self):
#         self.connected_clients: Dict[str, Dict[str, Any]] = {}
        
#     def setup_events(self, engine: Optional[LLMEngine] = None):
#         """Setup WebSocket event handlers."""
#         global llm_engine
#         llm_engine = engine

#         @socketio.on('connect')
#         def handle_connect():
#             """Handle new client connections."""
#             try:
#                 client_id = request.sid
#                 self.connected_clients[client_id] = {
#                     'status': 'connected',
#                     'timestamp': datetime.now().isoformat()
#                 }
#                 logger.info(f"Client connected: {client_id}")
#                 emit('connection_acknowledged', {'status': 'connected'})
#             except Exception as e:
#                 logger.error(f"Connection error: {str(e)}")
#                 raise APIError(
#                     message="WebSocket connection failed",
#                     code=ErrorCodes.API_ERROR,
#                     details={"error": str(e)}
#                 )

#         @socketio.on('disconnect')
#         def handle_disconnect():
#             """Handle client disconnections."""
#             client_id = request.sid
#             if client_id in self.connected_clients:
#                 del self.connected_clients[client_id]
#                 logger.info(f"Client disconnected: {client_id}")

#         @socketio.on('model_status_request')
#         def handle_status_request(data: Dict[str, Any] = None):
#             """Handle requests for model status updates."""
#             try:
#                 if llm_engine:
#                     status = llm_engine.get_status()
#                     emit('model_status_update', status)
#                 else:
#                     emit('model_status_update', {'status': ModelStatus.STOPPED})
#             except Exception as e:
#                 logger.error(f"Status request error: {str(e)}")
#                 emit('error', {
#                     'message': 'Failed to get model status',
#                     'code': ErrorCodes.API_ERROR
#                 })

#     def broadcast_status(self, status: Dict[str, Any]):
#         """Broadcast status updates to all connected clients."""
#         try:
#             socketio.emit('model_status_update', status)
#             logger.debug(f"Status broadcast: {status}")
#         except Exception as e:
#             logger.error(f"Broadcast error: {str(e)}")
#             raise APIError(
#                 message="Failed to broadcast status",
#                 code=ErrorCodes.API_ERROR,
#                 details={"error": str(e)}
#             )

# Create singleton instance
websocket_manager = WebSocketManager()

# class WebSocketManager:
#     def __init__(self):
#         self.connected_clients: Dict[str, Dict[str, Any]] = {}
        
#     def setup_events(self):
#         @socketio.on('connect')
#         def handle_connect():
#             """Handle new client connections."""
#             try:
#                 client_id = request.sid
#                 self.connected_clients[client_id] = {
#                     'status': 'connected',
#                     'timestamp': datetime.now().isoformat()
#                 }
#                 logger.info(f"Client connected: {client_id}")
#                 emit('connection_acknowledged', {'status': 'connected'})
#             except Exception as e:
#                 logger.error(f"Connection error: {str(e)}")
#                 raise APIError(
#                     message="WebSocket connection failed",
#                     code=ErrorCodes.API_ERROR,
#                     details={"error": str(e)}
#                 )

#         @socketio.on('disconnect')
#         def handle_disconnect():
#             """Handle client disconnections."""
#             client_id = request.sid
#             if client_id in self.connected_clients:
#                 del self.connected_clients[client_id]
#                 logger.info(f"Client disconnected: {client_id}")

#         @socketio.on('model_status_request')
#         def handle_status_request(data):
#             """Handle requests for model status updates."""
#             try:
#                 if llm_engine:
#                     status = llm_engine.get_status()
#                     emit('model_status_update', status)
#                 else:
#                     emit('model_status_update', {'status': ModelStatus.STOPPED})
#             except Exception as e:
#                 logger.error(f"Status request error: {str(e)}")
#                 emit('error', {
#                     'message': 'Failed to get model status',
#                     'code': ErrorCodes.API_ERROR
#                 })

#     def broadcast_status(self, status: Dict[str, Any]):
#         """Broadcast status updates to all connected clients."""
#         try:
#             socketio.emit('model_status_update', status)
#             logger.debug(f"Status broadcast: {status}")
#         except Exception as e:
#             logger.error(f"Broadcast error: {str(e)}")
#             raise APIError(
#                 message="Failed to broadcast status",
#                 code=ErrorCodes.API_ERROR,
#                 details={"error": str(e)}
#             )

# websocket_manager = WebSocketManager()