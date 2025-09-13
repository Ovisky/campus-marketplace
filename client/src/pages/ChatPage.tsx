import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { socketService } from '../services/socket';
import ChatList from '../components/ChatList';

const ChatPage: React.FC = () => {
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      // 连接Socket.IO
      socketService.connect(token).catch(error => {
        console.error('Socket连接失败:', error);
      });
    }

    // 不要在这里断开连接，让Socket保持连接状态
    // return () => {
    //   socketService.disconnect();
    // };
  }, [token]);

  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-500">请先登录以使用聊天功能</p>
        </div>
      </div>
    );
  }

  //

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="w-full h-full flex flex-col">
        {/* 移动端标题栏 */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-900">我的聊天</h1>
        </div>
        
        {/* 桌面端标题 */}
        <div className="hidden md:block px-4 sm:px-6 lg:px-8 py-8 flex-shrink-0">
          <div className="w-full max-w-8xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">我的聊天</h1>
              <p className="text-gray-600 mt-2">与买家和卖家实时沟通</p>
            </div>
          </div>
        </div>
        
        {/* 聊天内容区域 */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <ChatList currentUserId={user._id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
