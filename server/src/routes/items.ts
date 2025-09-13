import express from 'express';
import { z } from 'zod';
import Item from '../models/Item';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 商品创建验证模式
const createItemSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100字符'),
  description: z.string().min(1, '描述不能为空').max(1000, '描述不能超过1000字符'),
  price: z.number().min(0, '价格不能为负数'),
  category: z.enum(['electronics', 'books', 'clothing', 'furniture', 'sports', 'other']),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  images: z.array(z.string()).optional().default([]),
  location: z.string().optional(),
  tags: z.array(z.string()).optional().default([])
});

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      status = 'active',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = { status };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const items = await Item.find(query)
      .populate('seller', '_id name studentId avatar')
      .sort(sort)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Item.countDocuments(query);

    res.json({
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: '获取商品列表失败' });
  }
});

// 获取单个商品
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', '_id name studentId avatar phone');
    
    if (!item) {
      return res.status(404).json({ message: '商品不存在' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: '获取商品详情失败' });
  }
});

// 创建商品
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createItemSchema.parse(req.body);
    
    const item = new Item({
      ...data,
      seller: req.user._id
    });

    await item.save();
    await item.populate('seller', 'name studentId avatar');

    res.status(201).json({
      message: '商品发布成功',
      item
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: '输入验证失败', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: '发布商品失败' });
  }
});

// 获取我的商品
router.get('/my/items', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query: any = { seller: req.user._id };
    if (status) {
      query.status = status;
    }

    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Item.countDocuments(query);

    res.json({
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: '获取我的商品失败' });
  }
});

// 更新商品状态
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const item = await Item.findOne({ _id: id, seller: req.user._id });
    if (!item) {
      return res.status(404).json({ message: '商品不存在或无权限' });
    }

    item.status = status;
    await item.save();

    res.json({ message: '状态更新成功', item });
  } catch (error) {
    res.status(500).json({ message: '更新状态失败' });
  }
});

export default router;
