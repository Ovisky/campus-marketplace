import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socket';
import { apiService } from '../services/api';
import type { ChatMessage, ChatRoom } from '../types/api';

interface ChatWindowProps {
  room: ChatRoom;
  currentUserId: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ room, currentUserId, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 修复currentUserId为undefined的问题
  const actualCurrentUserId = currentUserId || (() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const id = user?._id || user?.id;
        return id;
      }
    } catch (error) {
      console.error('🔧 从localStorage获取用户信息失败:', error);
    }
    return undefined;
  })();

  //

  useEffect(() => {
    loadMessages();
    setupSocketListeners();
    
    // 等待Socket连接和认证完成后再加入房间
    const joinRoomWhenReady = async () => {
      if (socketService.isConnected()) {
        joinRoom();
      } else {
        // 如果Socket未连接，等待连接完成
        const checkConnection = setInterval(() => {
          if (socketService.isConnected()) {
            clearInterval(checkConnection);
            joinRoom();
          }
        }, 100);
        
        // 5秒后停止检查
        setTimeout(() => clearInterval(checkConnection), 5000);
      }
    };
    
    joinRoomWhenReady();

    return () => {
      socketService.leaveRoom(room.id);
      socketService.removeAllListeners();
    };
  }, [room.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await apiService.getChatMessages(room.id);
      setMessages(response.messages);
    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = () => {
    socketService.joinRoom(room.id, room.item?._id);
  };

  const setupSocketListeners = () => {
    socketService.onNewMessage((message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socketService.onJoinedRoom((data) => {
      socketService.markMessagesRead(room.id);
    });

    socketService.onError((error) => {
      console.error('Socket错误:', error);
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      socketService.sendMessage({
        roomId: room.id,
        message: newMessage.trim(),
        messageType: 'text',
        itemId: room.item?._id
      });
      setNewMessage('');
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp?: string | Date) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">加载消息中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full md:h-96 bg-white border border-gray-200 rounded-lg shadow-lg">
      {/* 聊天头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
            {room.otherParticipant.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{room.otherParticipant.name}</h3>
            {room.item && (
              <p className="text-sm text-gray-500">关于: {room.item.title}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            还没有消息，开始聊天吧！
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender._id === actualCurrentUserId;
            
            return (
            <div
              key={message._id || message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] sm:max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender._id === actualCurrentUserId
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.sender._id === actualCurrentUserId ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {formatTime((message as any).createdAt || (message as any).timestamp)}
                </p>
              </div>
            </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 消息输入 */}
      <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-3 md:px-4 py-2 text-sm md:text-base bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? '发送中...' : '发送'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
