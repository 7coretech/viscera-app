import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://api.visceraconnect.com';

class SocketService {
    private socket: Socket | null = null;

    initialize() {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        this.socket.on('connect', async () => {
            console.log('✅ Connected to socket server');
            const token = await AsyncStorage.getItem('accessToken');
            const userStr = await AsyncStorage.getItem('user');
            if (token && userStr) {
                const user = JSON.parse(userStr);
                this.socket?.emit('register', {
                    token,
                    accessToken: token,
                    userId: user.userId || user.id || user._id,
                    role: user.role || 'NURSE'
                });
            }
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from socket server');
        });

        this.socket.on('error', (error) => {
            console.log('Socket Error:', error);
        });
    }

    joinConversation(applicationId: string) {
        if (!this.socket) this.initialize();
        console.log(`Joining conversation: ${applicationId}`);
        this.socket?.emit('join_conversation', { applicationId });
    }

    onNewMessage(callback: (message: any) => void) {
        this.socket?.on('new_message', callback);
    }

    offNewMessage() {
        this.socket?.off('new_message');
    }

    onNotification(callback: (notification: any) => void) {
        this.socket?.on('notification', callback);
        this.socket?.on('new_notification', callback);
    }

    offNotification() {
        this.socket?.off('notification');
        this.socket?.off('new_notification');
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }
}

const socketService = new SocketService();
export default socketService;
