import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';

interface NotificationIconProps {
  onClick: () => void;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleNotificationsChange = (notifications: Notification[]) => {
      setUnreadCount(notificationService.getUnreadCount());
    };

    notificationService.addListener(handleNotificationsChange);
    setUnreadCount(notificationService.getUnreadCount());

    return () => {
      notificationService.removeListener(handleNotificationsChange);
    };
  }, []);

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-700 hover:text-green-600 focus:outline-none"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationIcon;
