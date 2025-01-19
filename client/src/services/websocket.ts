// src/services/websocket.ts
import { io, Socket } from 'socket.io-client';
import { ModelStatus } from '../types';

export class WebSocketClient {
    private socket: Socket | null = null;
    private statusCallback: ((status: ModelStatus) => void) | null = null;
    private errorCallback: ((error: any) => void) | null = null;

    constructor(private url: string = 'http://localhost:5000') {}

    connect() {
        if (this.socket) return;

        this.socket = io(this.url, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
            this.requestModelStatus();
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        this.socket.on('model_status_update', (status: ModelStatus) => {
            if (this.statusCallback) {
                this.statusCallback(status);
            }
        });

        this.socket.on('error', (error: any) => {
            console.error('WebSocket error:', error);
            if (this.errorCallback) {
                this.errorCallback(error);
            }
        });
    }

    requestModelStatus() {
        if (this.socket?.connected) {
            this.socket.emit('model_status_request');
        }
    }

    onModelStatus(callback: (status: ModelStatus) => void) {
        this.statusCallback = callback;
    }

    onError(callback: (error: any) => void) {
        this.errorCallback = callback;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

// Create singleton instance
export const websocketClient = new WebSocketClient();
export default websocketClient;