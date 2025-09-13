import mongoose, { Document, Schema } from 'mongoose';

export interface IChatRoom extends Document {
  participants: mongoose.Types.ObjectId[]; // 参与者ID数组
  item?: mongoose.Types.ObjectId; // 关联的商品ID
  lastMessage?: mongoose.Types.ObjectId; // 最后一条消息ID
  lastMessageAt?: Date; // 最后消息时间
  isActive: boolean; // 聊天室是否活跃
  createdAt: Date;
  updatedAt: Date;
}

const chatRoomSchema = new Schema<IChatRoom>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: false
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: false
  },
  lastMessageAt: {
    type: Date,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 创建索引
chatRoomSchema.index({ lastMessageAt: -1 });
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ item: 1 });

export default mongoose.model<IChatRoom>('ChatRoom', chatRoomSchema);
