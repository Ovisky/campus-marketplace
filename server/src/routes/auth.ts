import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 注册验证模式
const registerSchema = z.object({
  studentId: z.string().min(1, '学号不能为空'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().min(1, '姓名不能为空')
});

// 登录验证模式
const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空')
});

// 注册
router.post('/register', async (req, res) => {
  try {
    const { studentId, email, password, name } = registerSchema.parse(req.body);

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { studentId }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? '邮箱已注册' : '学号已注册' 
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = new User({
      studentId,
      email,
      password: hashedPassword,
      name
    });

    await user.save();

    // 生成 JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        email: user.email,
        name: user.name,
        avatar: user.avatar || '',
        phone: user.phone || '',
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入验证失败', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        email: user.email,
        name: user.name,
        avatar: user.avatar || '',
        phone: user.phone || '',
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入验证失败', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户资料验证模式
const updateProfileSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名不能超过50字符'),
  nickname: z.string().max(50, '昵称不能超过50字符').optional(),
  school: z.string().max(100, '学校名称不能超过100字符').optional(),
  college: z.string().max(100, '学院名称不能超过100字符').optional(),
  phone: z.string().max(20, '手机号不能超过20字符').optional(),
  avatar: z.string().optional()
});

// 更新用户资料
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    // 验证输入数据
    const validatedData = updateProfileSchema.parse(req.body);

    // 更新用户信息
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: validatedData },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      message: '个人资料更新成功',
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入验证失败', 
        errors: error.errors 
      });
    }
    console.error('更新用户资料错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
