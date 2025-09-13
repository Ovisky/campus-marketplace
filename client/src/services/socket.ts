import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../types/api';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private isAuthenticated: boolean = false;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 如果已经连接且认证，直接resolve
      if (this.socket?.connected && this.isAuthenticated) {
        resolve();
        return;
      }
      
      // 如果已经连接但未认证，先断开
      if (this.socket?.connected) {
        this.socket.disconnect();
      }
      
      this.token = token;
      this.isAuthenticated = false;
      
      
      
      // 在移动端使用实际的IP地址而不是localhost
      const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:4000' 
        : `http://${window.location.hostname}:4000`;
      
      
      
      this.socket = io(socketUrl, {
        auth: {
          token
        },
        timeout: 10000, // 10秒超时
        forceNew: true // 强制创建新连接
      });

      this.socket.on('connect', () => {
        this.authenticate();
      });

      this.socket.on('authenticated', (data) => {
        this.isAuthenticated = true;
        resolve();
      });

      this.socket.on('authentication_error', (error) => {
        console.error('❌ Socket authentication error:', error);
        this.isAuthenticated = false;
        reject(error);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        this.isAuthenticated = false;
      });
    });
  }

  private authenticate(): void {
    if (this.socket && this.token) {
      this.socket.emit('authenticate', this.token);
    } else {
      console.error('🔐 Cannot authenticate: socket or token missing');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 加入聊天室
  joinRoom(roomId: string, itemId?: string): void {
    if (this.socket) {
      this.socket.emit('join_room', { roomId, itemId });
    }
  }

  // 离开聊天室
  leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('leave_room', { roomId });
    }
  }

  // 发送消息
  sendMessage(data: {
    roomId: string;
    message: string;
    messageType?: 'text' | 'image' | 'file';
    itemId?: string;
  }): void {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  // 标记消息为已读
  markMessagesRead(roomId: string): void {
    if (this.socket) {
      this.socket.emit('mark_read', { roomId });
    }
  }

  // 监听新消息
  onNewMessage(callback: (message: ChatMessage) => void): void {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  // 监听消息通知
  onMessageNotification(callback: (data: {
    roomId: string;
    message: ChatMessage;
    unreadCount: number;
  }) => void): void {
    if (this.socket) {
      this.socket.on('message_notification', callback);
    }
  }

  // 监听消息已读状态
  onMessagesRead(callback: (data: { roomId: string }) => void): void {
    if (this.socket) {
      this.socket.on('messages_read', callback);
    }
  }

  // 监听认证成功
  onAuthenticated(callback: (data: { 
    success: boolean; 
    user: { id: string; name: string; avatar?: string } 
  }) => void): void {
    if (this.socket) {
      this.socket.on('authenticated', callback);
    }
  }

  // 监听认证错误
  onAuthenticationError(callback: (data: { message: string }) => void): void {
    if (this.socket) {
      this.socket.on('authentication_error', callback);
    }
  }

  // 监听加入房间成功
  onJoinedRoom(callback: (data: { roomId: string }) => void): void {
    if (this.socket) {
      this.socket.on('joined_room', callback);
    }
  }

  // 监听错误
  onError(callback: (data: { message: string }) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // 移除所有监听器
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // 检查连接状态
  isConnected(): boolean {
    const connected = this.socket?.connected && this.isAuthenticated;
    console.log('🔍 Socket连接状态检查:', {
      socketConnected: this.socket?.connected,
      isAuthenticated: this.isAuthenticated,
      finalResult: connected
    });
    return connected;
  }
}

export const socketService = new SocketService();
