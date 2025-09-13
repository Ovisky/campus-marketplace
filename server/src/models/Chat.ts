import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  item?: mongoose.Types.ObjectId; // 关联的商品ID
  message: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: false
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 创建索引以提高查询性能
chatSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
chatSchema.index({ item: 1 });

export default mongoose.model<IChat>('Chat', chatSchema);
