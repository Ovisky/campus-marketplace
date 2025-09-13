import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  studentId: string;
  email: string;
  password: string;
  name: string;
  nickname?: string;
  school?: string;
  college?: string;
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  nickname: {
    type: String,
    trim: true
  },
  school: {
    type: String,
    trim: true
  },
  college: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
