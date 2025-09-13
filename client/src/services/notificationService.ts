import type { Notification } from '../types/notification';

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    this.loadNotifications();
  }

  // 加载本地存储的通知
  private loadNotifications() {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
      this.notifications = [];
    }
  }

  // 保存通知到本地存储
  private saveNotifications() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('保存通知失败:', error);
    }
  }

  // 通知监听器
  addListener(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (notifications: Notification[]) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // 通知所有监听器
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // 添加通知
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false
    };

    this.notifications.unshift(newNotification);
    
    // 只保留最近50条通知
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveNotifications();
    this.notifyListeners();
  }

  // 标记通知为已读
  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // 删除通知
  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.notifyListeners();
  }

  // 获取所有通知
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // 获取未读通知数量
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // 标记所有通知为已读
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  // 清空所有通知
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // 订单相关通知方法
  notifyOrderCreated(orderId: string, itemTitle: string) {
    this.addNotification({
      type: 'success',
      title: '订单创建成功',
      message: `您已成功创建订单：${itemTitle}`
    });
  }

  notifyOrderStatusChanged(orderId: string, itemTitle: string, status: string) {
    const statusText = this.getStatusText(status);
    this.addNotification({
      type: 'info',
      title: '订单状态更新',
      message: `订单"${itemTitle}"状态已更新为：${statusText}`
    });
  }

  notifyOrderCancelled(orderId: string, itemTitle: string) {
    this.addNotification({
      type: 'warning',
      title: '订单已取消',
      message: `订单"${itemTitle}"已被取消`
    });
  }

  // 获取状态文本
  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': '待确认',
      'confirmed': '已确认',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  }
}

export const notificationService = new NotificationService();
