import { Socket, Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Chat from '../models/Chat';
import ChatRoom from '../models/ChatRoom';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const handleSocketConnection = (socket: AuthenticatedSocket, io: Server) => {
  

  // 用户认证
  socket.on('authenticate', async (token: string) => {
    
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      
      
      const user = await User.findById(decoded.userId).select('-password');
      
      
      if (user) {
        socket.userId = user._id.toString();
        socket.user = user;
        socket.join(`user_${user._id}`);
        
        
        socket.emit('authenticated', { 
          success: true, 
          user: { 
            id: user._id, 
            name: user.name, 
            avatar: user.avatar 
          } 
        });
        
      } else {
        
        socket.emit('authentication_error', { message: 'User not found' });
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      socket.emit('authentication_error', { message: 'Invalid token' });
    }
  });

  // 加入聊天室
  socket.on('join_room', async (data: { roomId: string, itemId?: string }) => {
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const { roomId, itemId } = data;
      
      // 验证用户是否有权限加入这个聊天室
      const chatRoom = await ChatRoom.findById(roomId);
      if (!chatRoom || !chatRoom.participants.includes(socket.userId as any)) {
        socket.emit('error', { message: 'No permission to join this room' });
        return;
      }

      socket.join(roomId);
      
      
      // 标记该用户在此聊天室的消息为已读
      await Chat.updateMany(
        { 
          receiver: socket.userId, 
          sender: { $ne: socket.userId },
          _id: { $in: chatRoom.participants }
        },
        { isRead: true }
      );

      socket.emit('joined_room', { roomId });
    } catch (error) {
      console.error('❌ Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // 离开聊天室
  socket.on('leave_room', async (data: { roomId: string }) => {
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const { roomId } = data;
      
      // 验证用户是否有权限离开这个聊天室
      const chatRoom = await ChatRoom.findById(roomId);
      if (!chatRoom || !chatRoom.participants.includes(socket.userId as any)) {
        socket.emit('error', { message: 'No permission to leave this room' });
        return;
      }

      socket.leave(roomId);
      
      
      socket.emit('left_room', { roomId });
    } catch (error) {
      console.error('❌ Leave room error:', error);
      socket.emit('error', { message: 'Failed to leave room' });
    }
  });

  // 发送消息
  socket.on('send_message', async (data: { 
    roomId: string, 
    message: string, 
    messageType?: 'text' | 'image' | 'file',
    itemId?: string 
  }) => {
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const { roomId, message, messageType = 'text', itemId } = data;
      
      // 验证聊天室
      const chatRoom = await ChatRoom.findById(roomId);
      if (!chatRoom || !chatRoom.participants.includes(socket.userId as any)) {
        socket.emit('error', { message: 'No permission to send message' });
        return;
      }

      // 创建消息
      const newMessage = new Chat({
        sender: socket.userId,
        receiver: chatRoom.participants.find(p => p.toString() !== socket.userId),
        item: itemId,
        message,
        messageType,
        isRead: false
      });

      await newMessage.save();

      // 更新聊天室的最后消息
      await ChatRoom.findByIdAndUpdate(roomId, {
        lastMessage: newMessage._id,
        lastMessageAt: new Date()
      });

      // 发送消息给聊天室内的所有用户（字段与前端类型保持一致）
      const receiverId = chatRoom.participants.find(p => p.toString() !== socket.userId);
      const messageData = {
        roomId,
        _id: newMessage._id,
        id: newMessage._id, // 兼容性
        sender: {
          _id: socket.userId as string,
          name: socket.user?.name,
          avatar: socket.user?.avatar
        },
        receiver: receiverId ? { _id: receiverId.toString() } : undefined,
        message,
        messageType,
        createdAt: newMessage.createdAt,
        isRead: false
      } as any;

      io.to(roomId).emit('new_message', messageData);
      
      // 发送通知给接收者（如果不在聊天室）
      if (receiverId) {
        io.to(`user_${receiverId}`).emit('message_notification', {
          roomId,
          message: messageData,
          unreadCount: await Chat.countDocuments({ 
            receiver: receiverId, 
            isRead: false 
          })
        });
      }

      
    } catch (error) {
      console.error('❌ Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // 标记消息为已读
  socket.on('mark_read', async (data: { roomId: string }) => {
    if (!socket.userId) {
      return;
    }

    try {
      const { roomId } = data;
      
      await Chat.updateMany(
        { 
          receiver: socket.userId,
          sender: { $ne: socket.userId }
        },
        { isRead: true }
      );

      // 通知发送者消息已被读取
      const chatRoom = await ChatRoom.findById(roomId);
      if (chatRoom) {
        const otherParticipant = chatRoom.participants.find(p => p.toString() !== socket.userId);
        if (otherParticipant) {
          io.to(`user_${otherParticipant}`).emit('messages_read', { roomId });
        }
      }
    } catch (error) {
      console.error('❌ Mark read error:', error);
    }
  });

  // 断开连接
  socket.on('disconnect', () => {
    
  });
};
