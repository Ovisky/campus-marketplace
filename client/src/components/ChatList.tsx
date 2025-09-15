import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { socketService } from '../services/socket';
import type { ChatRoom, ChatMessage } from '../types/api';
import ChatWindow from './ChatWindow';

interface ChatListProps {
  currentUserId: string;
}

const ChatList: React.FC<ChatListProps> = ({ currentUserId }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  //

  useEffect(() => {
    loadChatRooms();
    loadUnreadCount();
    setupSocketListeners();

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const response = await apiService.getChatRooms();
      setChatRooms(response.rooms);
    } catch (error) {
      console.error('加载聊天室失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadCount();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('加载未读消息数量失败:', error);
    }
  };

  const setupSocketListeners = () => {
    socketService.onMessageNotification((data) => {
      // 更新未读消息数量
      setUnreadCount(data.unreadCount);
      
      // 更新聊天室列表中的最后消息
      setChatRooms(prev => prev.map(room => {
        if (room.id === data.roomId) {
          return {
            ...room,
            lastMessage: data.message,
            lastMessageAt: data.message.createdAt,
            unreadCount: room.id === data.roomId ? room.unreadCount + 1 : room.unreadCount
          };
        }
        return room;
      }));
    });

    socketService.onNewMessage((message: ChatMessage) => {
      // 更新聊天室列表中的最后消息
      setChatRooms(prev => prev.map(room => {
        // 优先使用 roomId 进行匹配，其次回退到 sender/receiver
        if ((message as any).roomId === room.id || room.id === message.sender._id || (message as any).receiver?._id === room.id) {
          return {
            ...room,
            lastMessage: message,
            lastMessageAt: (message as any).createdAt || (message as any).timestamp
          };
        }
        return room;
      }));
    });
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    // 标记该聊天室的消息为已读
    socketService.markMessagesRead(room.id);
    
    // 更新本地状态
    setChatRooms(prev => prev.map(r => 
      r.id === room.id ? { ...r, unreadCount: 0 } : r
    ));
  };

  const handleDeleteRoom = async (roomId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      await apiService.deleteChatRoom(roomId);
      setChatRooms(prev => prev.filter(r => r.id !== roomId));
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(null);
      }
    } catch (error) {
      console.error('删除聊天室失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleCloseChat = () => {
    setSelectedRoom(null);
  };

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载聊天列表...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {selectedRoom ? (
        <div className="flex-1 flex flex-col">
          {/* 移动端返回按钮 */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <button
              onClick={handleCloseChat}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回聊天列表
            </button>
            <h2 className="font-semibold text-gray-900">{selectedRoom.otherParticipant.name}</h2>
            <div></div>
          </div>
          
          {/* 聊天窗口 */}
          <div className="flex-1">
            <ChatWindow
              room={selectedRoom}
              currentUserId={currentUserId}
              onClose={handleCloseChat}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* 桌面端标题 */}
          <div className="hidden md:block mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">我的聊天</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          
          {/* 聊天列表 */}
          <div className="flex-1 overflow-y-auto">
          
            {chatRooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>还没有聊天记录</p>
                <p className="text-sm">在商品页面点击"联系卖家"开始聊天</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomSelect(room)}
                    className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {room.otherParticipant.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {room.otherParticipant.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {room.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {room.unreadCount}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(room.lastMessageAt)}
                          </span>
                          <button
                            onClick={(e) => handleDeleteRoom(room.id, e)}
                            title="删除聊天室"
                            className="border-2 border-green-600 text-green-600 bg-white px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      
                      {room.item && (
                        <p className="text-sm text-gray-600 truncate">
                          关于: {room.item.title}
                        </p>
                      )}
                      
                      {room.lastMessage && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {room.lastMessage.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
