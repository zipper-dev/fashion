const express = require('express');
const router = express.Router();
const {
  createMoMoPayment,
  momoCallback,
  checkPaymentStatus,
  createSepayPayment,
  sepayWebhook,
} = require('../controllers/paymentController');

// ===== MOMO ROUTES =====
// Tạo thanh toán MoMo
router.post('/momo/create', createMoMoPayment);

// Callback từ MoMo (IPN)
router.post('/momo/callback', momoCallback);

// Kiểm tra trạng thái thanh toán
router.get('/momo/status/:orderId', checkPaymentStatus);

// ===== SEPAY ROUTES =====
// Tạo thanh toán chuyển khoản
router.post('/sepay/create', createSepayPayment);

// Webhook từ SePay
router.post('/sepay/webhook', sepayWebhook);

module.exports = router;