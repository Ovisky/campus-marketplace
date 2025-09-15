import type { 
  AuthResponse, 
  ItemsResponse, 
  Item, 
  User, 
  Order, 
  OrdersResponse,
  ChatRoom,
  ChatRoomsResponse,
  MessagesResponse,
  UnreadCountResponse
} from '../types/api';

const API_BASE_URL = 'http://localhost:4000/api';

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: '请求失败' }));
        console.error('API错误响应:', response.status, error);
        throw new Error(error.message || '请求失败');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API请求异常:', error);
      throw error;
    }
  }

  // 认证相关
  async register(data: {
    studentId: string;
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 商品相关
  async getItems(params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<ItemsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request<ItemsResponse>(`/items${queryString ? `?${queryString}` : ''}`);
  }

  async getItem(id: string): Promise<Item> {
    return this.request<Item>(`/items/${id}`);
  }

  async createItem(data: {
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    images?: string[];
    location?: string;
    tags?: string[];
  }): Promise<{ message: string; item: Item }> {
    return this.request<{ message: string; item: Item }>('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyItems(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ItemsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request<ItemsResponse>(`/items/my/items${queryString ? `?${queryString}` : ''}`);
  }

  async updateItemStatus(id: string, status: string): Promise<{ message: string; item: Item }> {
    return this.request<{ message: string; item: Item }>(`/items/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // 订单相关
  async createOrder(data: {
    itemId: string;
    message?: string;
    buyerContact?: string;
    meetingLocation?: string;
    meetingTime?: string;
  }): Promise<{ message: string; order: Order }> {
    return this.request<{ message: string; order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<OrdersResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request<OrdersResponse>(`/orders/my-orders${queryString ? `?${queryString}` : ''}`);
  }

  async getMySales(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<OrdersResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request<OrdersResponse>(`/orders/my-sales${queryString ? `?${queryString}` : ''}`);
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, data: {
    status: string;
    sellerContact?: string;
    meetingLocation?: string;
    meetingTime?: string;
  }): Promise<{ message: string; order: Order }> {
    return this.request<{ message: string; order: Order }>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async cancelOrder(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${id}/cancel`, {
      method: 'PATCH',
    });
  }

  // 用户资料相关
  async updateProfile(data: {
    name: string;
    nickname?: string;
    school?: string;
    college?: string;
    phone?: string;
    avatar?: string;
  }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 聊天相关
  async getChatRooms(): Promise<ChatRoomsResponse> {
    return this.request<ChatRoomsResponse>('/chat/rooms');
  }

  async createOrGetChatRoom(data: {
    buyerId: string;
    sellerId: string;
    itemId: string;
  }): Promise<{ room: ChatRoom }> {
    const result = await this.request<{ room: ChatRoom }>('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  }

  async getChatMessages(roomId: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<MessagesResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request<MessagesResponse>(`/chat/rooms/${roomId}/messages${queryString ? `?${queryString}` : ''}`);
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return this.request<UnreadCountResponse>('/chat/unread-count');
  }

  async markAllMessagesRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/chat/mark-all-read', {
      method: 'PUT',
    });
  }

  async deleteChatRoom(roomId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/chat/rooms/${roomId}`, {
      method: 'DELETE',
    });
  }

  // 管理后台相关
  async getAdminUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request(`/admin/users${queryString ? `?${queryString}` : ''}`, {
      headers: {} // 不发送认证token
    });
  }

  async updateAdminUser(userId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    school?: string;
    college?: string;
    nickname?: string;
    isActive?: boolean;
  }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // 管理员 - 商品管理
  async getAdminItems(params?: string): Promise<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.request(`/admin/items${params ? `?${params}` : ''}`, {
      headers: {} // 不发送认证token
    });
  }

  async updateAdminItemStatus(itemId: string, status: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/items/${itemId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async updateItemApprovalStatus(itemId: string, approvalStatus: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/items/${itemId}/approval`, {
      method: 'PUT',
      body: JSON.stringify({ approvalStatus }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export const apiService = new ApiService();
