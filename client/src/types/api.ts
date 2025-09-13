// API 类型定义
export interface User {
  _id: string;
  studentId: string;
  email: string;
  name: string;
  nickname?: string;
  school?: string;
  college?: string;
  avatar?: string;
  phone?: string;
  isVerified: boolean;
}

export interface Item {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: 'electronics' | 'books' | 'clothing' | 'furniture' | 'sports' | 'other';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  images: string[];
  seller: User;
  status: 'active' | 'inactive' | 'sold';
  location?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ItemsResponse {
  items: Item[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Order {
  _id: string;
  item: Item;
  buyer: User;
  seller: User;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  message?: string;
  buyerContact?: string;
  sellerContact?: string;
  meetingLocation?: string;
  meetingTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// 聊天相关类型
export interface ChatMessage {
  id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
    avatar?: string;
  };
  message: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  id: string;
  otherParticipant: {
    _id: string;
    name: string;
    avatar?: string;
  };
  item?: {
    _id: string;
    title: string;
    price: number;
    images: string[];
  };
  lastMessage?: ChatMessage;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
}

export interface ChatRoomsResponse {
  rooms: ChatRoom[];
}

export interface MessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
