const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route: /api/products

// Tìm kiếm sản phẩm (phải đặt trước /:id)
router.get('/search', productController.searchProducts);

// Lấy sản phẩm nổi bật
router.get('/featured', productController.getFeaturedProducts);

// Lấy tất cả sản phẩm
router.get('/', productController.getAllProducts);

// Lấy sản phẩm theo ID
router.get('/:id', productController.getProductById);

// Tạo sản phẩm mới
router.post('/', productController.createProduct);

// Cập nhật sản phẩm
router.put('/:id', productController.updateProduct);

// Xóa sản phẩm
router.delete('/:id', productController.deleteProduct);

module.exports = router;