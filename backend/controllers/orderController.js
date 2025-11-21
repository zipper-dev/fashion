const Order = require('../models/Order');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'Không có sản phẩm trong đơn hàng' });
      return;
    }

    const order = new Order({
      user: req.body.userId || '000000000000000000000000', // Demo ID
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy đơn hàng theo ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy đơn hàng của user
const getMyOrders = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    const orders = await Order.find({ user: userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái thanh toán
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        transactionId: req.body.transactionId,
        status: req.body.status,
        updateTime: req.body.updateTime,
      };
      order.orderStatus = 'Processing';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả đơn hàng (Admin hoặc Public để demo)
const getAllOrders = async (req, res) => {
  try {
    console.log('📦 Nhận request GET /api/orders/all');
    
    // Lấy tất cả đơn hàng, sắp xếp mới nhất trước
    const orders = await Order.find({})
      .sort({ createdAt: -1 }) // -1 = giảm dần (mới nhất trước)
      .lean(); // .lean() để tăng performance, trả về plain object thay vì Mongoose document
    
    console.log(`✅ Tìm thấy ${orders.length} đơn hàng`);
    
    res.json(orders);
  } catch (error) {
    console.error('❌ Lỗi getAllOrders:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message 
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderToPaid,
  getAllOrders,
};