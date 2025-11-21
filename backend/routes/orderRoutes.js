const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderToPaid,
  getAllOrders,
} = require('../controllers/orderController');

// Tạm thời bỏ middleware auth để demo đơn giản
// Trong thực tế cần thêm: const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', createOrder); // Cần: protect
router.get('/myorders', getMyOrders); // Cần: protect
router.get('/all', getAllOrders); // Cần: protect, admin
router.get('/:id', getOrderById); // Cần: protect
router.put('/:id/pay', updateOrderToPaid); // Cần: protect

module.exports = router;