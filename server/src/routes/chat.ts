import express from 'express';
import { authenticateToken } from '../middleware/auth';
import Chat from '../models/Chat';
import ChatRoom from '../models/ChatRoom';
import User from '../models/User';
import Item from '../models/Item';
import { z } from 'zod';

const router = express.Router();

// 获取用户的聊天室列表
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const chatRooms = await ChatRoom.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name avatar')
    .populate('item', 'title price images')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    const roomsWithUnreadCount = await Promise.all(
      chatRooms.map(async (room) => {
        const unreadCount = await Chat.countDocuments({
          receiver: userId,
          sender: { $ne: userId },
          isRead: false
        });

        const otherParticipant = room.participants.find(
          (p: any) => p._id.toString() !== userId
        );

        return {
          id: room._id,
          otherParticipant: {
            id: otherParticipant?._id,
            name: otherParticipant?.name,
            avatar: otherParticipant?.avatar
          },
          item: room.item,
          lastMessage: room.lastMessage,
          lastMessageAt: room.lastMessageAt,
          unreadCount,
          createdAt: room.createdAt
        };
      })
    );

    res.json({ rooms: roomsWithUnreadCount });
  } catch (error) {
    console.error('❌ Get chat rooms error:', error);
    res.status(500).json({ message: '获取聊天室列表失败' });
  }
});

// 获取或创建聊天室
router.post('/rooms', authenticateToken, async (req, res) => {
  try {
    
    
    const userId = req.user?.userId;
    const { sellerId, itemId } = req.body;
    const buyerId = req.body.buyerId || userId.toString();

    // 如果buyerId缺失，使用userId作为buyerId
    if (!req.body.buyerId) {
      
    }

    

    if (!sellerId || !itemId) {
      
      return res.status(400).json({ 
        message: '缺少必要参数',
        received: { buyerId, sellerId, itemId, userId }
      });
    }

    // 验证buyerId是否与认证用户匹配
    if (buyerId !== userId.toString()) {
      console.log('买家ID不匹配 - buyerId:', buyerId, 'userId:', userId);
      return res.status(400).json({ message: '买家ID不匹配' });
    }

    // 验证商品和卖家
    const item = await Item.findById(itemId);
    
    
    if (!item) {
      return res.status(404).json({ message: '商品不存在' });
    }

    
    if (item.seller.toString() !== sellerId) {
      
      // return res.status(400).json({ message: '卖家信息不匹配' });
    }

    // 检查是否已存在聊天室
    // 尝试多种查询方式，因为索引可能不匹配
    let chatRoom = await ChatRoom.findOne({
      participants: { $all: [userId, sellerId] },
      item: itemId,
      isActive: true
    });

    // 如果没找到，尝试其他查询方式
    if (!chatRoom) {
      chatRoom = await ChatRoom.findOne({
        $or: [
          { participants: [userId, sellerId], item: itemId },
          { participants: [sellerId, userId], item: itemId }
        ],
        isActive: true
      });
    }

    // 如果还是没找到，尝试只按item查询
    if (!chatRoom) {
      chatRoom = await ChatRoom.findOne({
        item: itemId,
        participants: { $in: [userId, sellerId] },
        isActive: true
      });
    }

    

    if (!chatRoom) {
      // 创建新聊天室
      
      try {
        chatRoom = new ChatRoom({
          participants: [userId, sellerId],
          item: itemId,
          isActive: true
        });
        await chatRoom.save();
        
      } catch (error: any) {
        // 如果是重复键错误，尝试查找现有聊天室
        if (error.code === 11000) {
          
          chatRoom = await ChatRoom.findOne({
            item: itemId,
            participants: { $in: [userId, sellerId] }
          });
          
          if (chatRoom) {
            
            // 确保聊天室是活跃状态
            if (!chatRoom.isActive) {
              chatRoom.isActive = true;
              await chatRoom.save();
            }
          } else {
            console.error('重复键错误但找不到现有聊天室:', error);
            return res.status(500).json({ message: '聊天室创建失败' });
          }
        } else {
          console.error('创建聊天室时发生错误:', error);
          return res.status(500).json({ message: '聊天室创建失败' });
        }
      }
    }

    // 获取聊天室详细信息
    const roomDetails = await ChatRoom.findById(chatRoom._id)
      .populate('participants', 'name avatar')
      .populate('item', 'title price images')
      .populate('lastMessage');

    const otherParticipant = roomDetails?.participants.find(
      (p: any) => p._id.toString() !== userId
    );

    res.json({
      room: {
        id: roomDetails?._id,
        otherParticipant: {
          id: otherParticipant?._id,
          name: otherParticipant?.name,
          avatar: otherParticipant?.avatar
        },
        item: roomDetails?.item,
        lastMessage: roomDetails?.lastMessage,
        lastMessageAt: roomDetails?.lastMessageAt,
        createdAt: roomDetails?.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Create/get chat room error:', error);
    res.status(500).json({ message: '创建聊天室失败' });
  }
});

// 获取聊天室的消息历史
router.get('/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // 验证用户是否有权限访问这个聊天室
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom || !chatRoom.participants.includes(userId as any)) {
      return res.status(403).json({ message: '无权限访问此聊天室' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Chat.find({
      $or: [
        { sender: userId, receiver: { $in: chatRoom.participants } },
        { receiver: userId, sender: { $in: chatRoom.participants } }
      ]
    })
    .populate('sender', '_id name avatar')
    .populate('receiver', '_id name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

    // 标记消息为已读
    await Chat.updateMany(
      {
        receiver: userId,
        sender: { $ne: userId },
        _id: { $in: messages.map(m => m._id) }
      },
      { isRead: true }
    );

    res.json({
      messages: messages.reverse(),
      hasMore: messages.length === Number(limit)
    });
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ message: '获取消息失败' });
  }
});

// 获取未读消息数量
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const unreadCount = await Chat.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('❌ Get unread count error:', error);
    res.status(500).json({ message: '获取未读消息数量失败' });
  }
});

// 标记所有消息为已读
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    await Chat.updateMany(
      { receiver: userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: '所有消息已标记为已读' });
  } catch (error) {
    console.error('❌ Mark all read error:', error);
    res.status(500).json({ message: '标记消息失败' });
  }
});

export default router;
