import React, { useState, useEffect } from 'react';
import type { Notification } from '../types/notification';
import { notificationService } from '../services/notificationService';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleNotificationsChange = (newNotifications: Notification[]) => {
      setNotifications(newNotifications);
    };

    notificationService.addListener(handleNotificationsChange);
    setNotifications(notificationService.getNotifications());

    return () => {
      notificationService.removeListener(handleNotificationsChange);
    };
  }, []);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleRemove = (id: string) => {
    notificationService.removeNotification(id);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    if (window.confirm('确定要清空所有通知吗？')) {
      notificationService.clearAll();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'info':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">通知中心</h1>
              <p className="text-gray-600 mt-2">查看您的订单和系统通知</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                className="border-2 border-green-600 text-green-600 bg-white px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
              >
                全部已读
              </button>
              <button
                onClick={handleClearAll}
                className="border-2 border-gray-400 text-gray-400 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                清空全部
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无通知</h3>
              <p className="text-gray-500">当有新的订单状态更新时，您会在这里看到通知</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-medium ${getTypeColor(notification.type)}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                          {!notification.read && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              未读
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{notification.message}</p>
                      <div className="mt-4 flex space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-sm text-green-600 hover:text-green-500"
                          >
                            标记为已读
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(notification.id)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
