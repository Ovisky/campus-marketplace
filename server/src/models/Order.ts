import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  item: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  message?: string;
  buyerContact?: string;
  sellerContact?: string;
  meetingLocation?: string;
  meetingTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  message: {
    type: String,
    maxlength: 500
  },
  buyerContact: {
    type: String,
    trim: true
  },
  sellerContact: {
    type: String,
    trim: true
  },
  meetingLocation: {
    type: String,
    trim: true
  },
  meetingTime: {
    type: Date
  }
}, {
  timestamps: true
});

// 创建索引
OrderSchema.index({ buyer: 1 });
OrderSchema.index({ seller: 1 });
OrderSchema.index({ item: 1 });
OrderSchema.index({ status: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
