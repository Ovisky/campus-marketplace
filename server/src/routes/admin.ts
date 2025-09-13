import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Item from '../models/Item';

const router = express.Router();

// 简化的管理员权限检查中间件 - 暂时不需要登录
const requireAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  // 暂时允许所有用户访问管理功能，不需要登录
  next();
};

// 获取用户列表
router.get('/users', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const skip = (page - 1) * limit;

    // 构建搜索条件
    const searchConditions: any = {};
    if (search) {
      searchConditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // 获取用户列表
    const users = await User.find(searchConditions)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 获取总数
    const total = await User.countDocuments(searchConditions);
    const totalPages = Math.ceil(total / limit);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '获取用户列表失败' });
  }
});

// 更新用户信息
router.put('/users/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 移除不应该更新的字段
    delete updateData.password;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      message: '用户信息更新成功',
      user
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ message: '更新用户信息失败' });
  }
});

// 切换用户状态
router.put('/users/:id/status', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      message: `用户已${isActive ? '启用' : '禁用'}`
    });
  } catch (error) {
    console.error('切换用户状态失败:', error);
    res.status(500).json({ message: '操作失败' });
  }
});

// 获取商品列表
router.get('/items', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string;
    const approvalStatus = req.query.approvalStatus as string;
    const skip = (page - 1) * limit;

    // 构建搜索条件
    const searchConditions: any = {};
    if (search) {
      searchConditions.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'all') {
      searchConditions.status = status;
    }
    if (approvalStatus && approvalStatus !== 'all') {
      searchConditions.approvalStatus = approvalStatus;
    }

    // 获取商品列表
    const items = await Item.find(searchConditions)
      .populate('seller', '_id name studentId email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 获取总数
    const total = await Item.countDocuments(searchConditions);
    const totalPages = Math.ceil(total / limit);

    res.json({
      items,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({ message: '获取商品列表失败' });
  }
});

// 更新商品状态
router.put('/items/:id/status', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'sold'].includes(status)) {
      return res.status(400).json({ message: '无效的商品状态' });
    }

    const item = await Item.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('seller', '_id name studentId email');

    if (!item) {
      return res.status(404).json({ message: '商品不存在' });
    }

    res.json({
      message: `商品已${status === 'active' ? '上架' : status === 'inactive' ? '下架' : '标记为已售'}`,
      item
    });
  } catch (error) {
    console.error('更新商品状态失败:', error);
    res.status(500).json({ message: '操作失败' });
  }
});

// 更新商品审核状态
router.put('/items/:id/approval', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: '无效的审核状态' });
    }

    const item = await Item.findByIdAndUpdate(
      id,
      { approvalStatus },
      { new: true }
    ).populate('seller', '_id name studentId email');

    if (!item) {
      return res.status(404).json({ message: '商品不存在' });
    }

    res.json({
      message: `商品已${approvalStatus === 'approved' ? '通过审核' : approvalStatus === 'rejected' ? '拒绝审核' : '重置为待审核'}`,
      item
    });
  } catch (error) {
    console.error('更新商品审核状态失败:', error);
    res.status(500).json({ message: '操作失败' });
  }
});

export default router;
