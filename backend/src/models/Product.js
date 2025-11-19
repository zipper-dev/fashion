const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Tên sản phẩm
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên sản phẩm'],
    trim: true,
    maxLength: [200, 'Tên sản phẩm không được quá 200 ký tự']
  },
  
  // Mô tả
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sản phẩm'],
    maxLength: [2000, 'Mô tả không được quá 2000 ký tự']
  },
  
  // Giá
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá sản phẩm'],
    min: [0, 'Giá không được âm'],
    max: [999999999, 'Giá quá lớn']
  },
  
  // Giá gốc (để hiển thị giảm giá)
  originalPrice: {
    type: Number,
    default: 0
  },
  
  // Danh mục
  category: {
    type: String,
    required: [true, 'Vui lòng chọn danh mục'],
    enum: {
      values: ['Áo sơ mi', 'Quần tây', 'Áo khoác', 'Áo thun', 'Áo polo', 'Quần jean', 'Phụ kiện'],
      message: 'Danh mục không hợp lệ'
    }
  },
  
  // Kích thước
  sizes: [{
    type: String,
    enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  }],
  
  // Màu sắc
  colors: [{
    name: String,
    code: String // Mã màu hex, ví dụ: #000000
  }],
  
  // Hình ảnh
  images: [{
    url: String,
    alt: String
  }],
  
  // Số lượng tồn kho
  stock: {
    type: Number,
    required: [true, 'Vui lòng nhập số lượng tồn kho'],
    min: [0, 'Số lượng không được âm'],
    default: 0
  },
  
  // Sản phẩm nổi bật
  featured: {
    type: Boolean,
    default: false
  },
  
  // Đánh giá
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Số lượt xem
  views: {
    type: Number,
    default: 0
  },
  
  // Đã bán
  sold: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Tự động tạo createdAt và updatedAt
});

// Tạo index để tìm kiếm nhanh hơn
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);