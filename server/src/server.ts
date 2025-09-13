import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/camp';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增加请求体大小限制到50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Campus Marketplace API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend initialization completed successfully!',
    features: ['Express', 'TypeScript', 'CORS', 'Environment Variables', 'MongoDB', 'JWT Auth']
  });
});

// API Routes
import authRoutes from './routes/auth';
import itemRoutes from './routes/items';
import orderRoutes from './routes/orders';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO 连接处理
import { handleSocketConnection } from './socket/socketHandler';

io.on('connection', (socket) => {
  handleSocketConnection(socket, io);
});

// Start server
server.listen(PORT, () => {
  
});
