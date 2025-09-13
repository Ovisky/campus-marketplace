import React, { useState, useEffect } from 'react';
import NotificationToast from './NotificationToast';
import type { Notification } from '../types/notification';
import { notificationService } from '../services/notificationService';

const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // 监听通知变化
    const handleNotificationsChange = (newNotifications: Notification[]) => {
      setNotifications(newNotifications);
    };

    notificationService.addListener(handleNotificationsChange);
    
    // 初始化通知列表
    setNotifications(notificationService.getNotifications());

    return () => {
      notificationService.removeListener(handleNotificationsChange);
    };
  }, []);

  const handleClose = (id: string) => {
    notificationService.removeNotification(id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.slice(0, 3).map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
