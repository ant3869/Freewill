# server/src/app.py
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from src.api.routes import api
from src.api.middleware import init_middleware
from src.services.websocket_server import socketio, websocket_manager
from src.llm.engine import LLMEngine
from src.utils.logger import setup_logger
from src.utils.error_handler import setup_error_handlers


logger = setup_logger(__name__)

def create_app():
    """Create and configure the Flask application."""
    logger.info("Initializing Flask application")
    
    # Create Flask app
    app = Flask(__name__)
    CORS(app)
    
    # Initialize middleware
    app = init_middleware(app)
    
    # Register blueprints
    app.register_blueprint(api)
    logger.debug("API blueprint registered")

    # Register error handlers
    setup_error_handlers(app)
    
    # Initialize LLM engine
    llm_engine = None  # Initialize when needed
    
    # Initialize WebSocket
    socketio.init_app(app, cors_allowed_origins="*")
    websocket_manager.set_engine(llm_engine)
    websocket_manager.setup_events()
    logger.debug("WebSocket server initialized")
    
    return app

def main():
    """Main entry point for the application."""
    app = create_app()
    logger.info("Starting Flask application")
   # socketio.run(app, debug=True, port=5000, use_reloader=True)
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)

if __name__ == "__main__":
    main()