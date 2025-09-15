import express from 'express';
import { z } from 'zod';
import Order from '../models/Order';
import Item from '../models/Item';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 创建订单验证模式
const createOrderSchema = z.object({
  itemId: z.string().min(1, '商品ID不能为空'),
  message: z.string().max(500, '留言不能超过500字符').optional(),
  buyerContact: z.string().trim().optional(),
  meetingLocation: z.string().trim().optional(),
  meetingTime: z.string().datetime().optional()
});

// 更新订单状态验证模式
const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  sellerContact: z.string().trim().optional(),
  meetingLocation: z.string().trim().optional(),
  meetingTime: z.string().datetime().optional()
});

// 创建订单
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createOrderSchema.parse(req.body);
    // 禁用用户不可下单
    if (req.user && req.user.isActive === false) {
      return res.status(403).json({ message: '账号已被禁用，无法下单' });
    }
    
    // 检查商品是否存在且可购买
    const item = await Item.findById(data.itemId).populate('seller');
    if (!item) {
      return res.status(404).json({ message: '商品不存在' });
    }

    if (item.status !== 'active') {
      return res.status(400).json({ message: '商品不可购买' });
    }

    if (item.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: '不能购买自己的商品' });
    }

    // 检查是否已有待处理的订单
    const existingOrder = await Order.findOne({
      item: data.itemId,
      buyer: req.user._id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingOrder) {
      return res.status(400).json({ message: '您已对此商品下单，请勿重复下单' });
    }

    // 创建订单
    const order = new Order({
      item: data.itemId,
      buyer: req.user._id,
      seller: item.seller._id,
      price: item.price,
      message: data.message,
      buyerContact: data.buyerContact,
      meetingLocation: data.meetingLocation,
      meetingTime: data.meetingTime ? new Date(data.meetingTime) : undefined
    });

    await order.save();
    await order.populate([
      { path: 'item', select: 'title price images' },
      { path: 'buyer', select: 'name studentId' },
      { path: 'seller', select: 'name studentId' }
    ]);

    res.status(201).json({
      message: '订单创建成功',
      order
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入验证失败', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: '创建订单失败' });
  }
});

// 获取我的订单（作为买家）
router.get('/my-orders', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query: any = { buyer: req.user._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate([
        { path: 'item', select: 'title price images status' },
        { path: 'seller', select: 'name studentId phone' }
      ])
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: '获取订单列表失败' });
  }
});

// 获取我的销售订单（作为卖家）
router.get('/my-sales', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query: any = { seller: req.user._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate([
        { path: 'item', select: 'title price images status' },
        { path: 'buyer', select: 'name studentId phone' }
      ])
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: '获取销售订单失败' });
  }
});

// 获取单个订单详情
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate([
        { path: 'item', select: 'title price images description' },
        { path: 'buyer', select: 'name studentId phone' },
        { path: 'seller', select: 'name studentId phone' }
      ]);

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查权限：只有买家和卖家可以查看订单
    if (order.buyer._id.toString() !== req.user._id.toString() && 
        order.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权限查看此订单' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: '获取订单详情失败' });
  }
});

// 更新订单状态（卖家操作）
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, sellerContact, meetingLocation, meetingTime } = updateOrderStatusSchema.parse(req.body);
    const { id } = req.params;

    const order = await Order.findById(id).populate('seller');
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查权限：只有卖家可以更新订单状态
    if (order.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权限操作此订单' });
    }

    // 更新订单状态
    order.status = status;
    if (sellerContact) order.sellerContact = sellerContact;
    if (meetingLocation) order.meetingLocation = meetingLocation;
    if (meetingTime) order.meetingTime = new Date(meetingTime);

    await order.save();

    // 如果订单确认，将商品状态改为已预订
    if (status === 'confirmed') {
      await Item.findByIdAndUpdate(order.item, { status: 'sold' });
    }

    // 如果订单完成或取消，将商品状态改回可售
    if (status === 'completed' || status === 'cancelled') {
      await Item.findByIdAndUpdate(order.item, { status: 'active' });
    }

    await order.populate([
      { path: 'item', select: 'title price images status' },
      { path: 'buyer', select: 'name studentId phone' },
      { path: 'seller', select: 'name studentId phone' }
    ]);

    res.json({ message: '订单状态更新成功', order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入验证失败', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: '更新订单状态失败' });
  }
});

// 取消订单（买家操作）
router.patch('/:id/cancel', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查权限：只有买家可以取消订单
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权限操作此订单' });
    }

    // 只有待处理状态的订单可以取消
    if (order.status !== 'pending') {
      return res.status(400).json({ message: '只有待处理状态的订单可以取消' });
    }

    order.status = 'cancelled';
    await order.save();

    // 将商品状态改回可售
    await Item.findByIdAndUpdate(order.item, { status: 'active' });

    res.json({ message: '订单取消成功' });
  } catch (error) {
    res.status(500).json({ message: '取消订单失败' });
  }
});

export default router;
