const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

// Load environment variables
dotenv.config();

// Kết nối Database
connectDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route kiểm tra server
app.get('/', (req, res) => {
  res.json({ 
    message: '🎉 Owen Fashion API Server đang chạy!',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      users: '/api/users',
      orders: '/api/orders'
    }
  });
});

// Import routes
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route không tồn tại' 
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📅 Thời gian: ${new Date().toLocaleString('vi-VN')}`);
  console.log('=================================');
});