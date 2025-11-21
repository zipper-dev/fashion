require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

// Kết nối database
connectDB();

// Dữ liệu mẫu
const sampleProducts = [
  {
    name: 'Áo Thun Basic Trắng',
    description: 'Áo thun cotton 100% cao cấp, form regular fit thoải mái, phù hợp cho mọi hoạt động hàng ngày.',
    price: 3000,
    category: 'Áo',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Trắng', 'Đen', 'Xám'],
    stock: 50,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    rating: 4.5,
    numReviews: 12,
  },
  {
    name: 'Quần Jeans Slim Fit',
    description: 'Quần jeans co giãn nhẹ, ôm vừa phải, tôn dáng và thoải mái khi vận động.',
    price: 2000,
    category: 'Quần',
    sizes: ['28', '29', '30', '31', '32'],
    colors: ['Xanh đậm', 'Xanh nhạt', 'Đen'],
    stock: 30,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
    rating: 4.7,
    numReviews: 25,
  },
  {
    name: 'Váy Maxi Hoa Nhí',
    description: 'Váy maxi thời trang họa tiết hoa nhí dễ thương, chất vải mềm mại, thoáng mát.',
    price: 2000,
    category: 'Váy',
    sizes: ['S', 'M', 'L'],
    colors: ['Hồng', 'Xanh', 'Vàng'],
    stock: 20,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
    rating: 4.8,
    numReviews: 18,
  },
  {
    name: 'Túi Xách Da Mini',
    description: 'Túi xách da PU cao cấp, kiểu dáng mini xinh xắn, nhiều ngăn tiện dụng.',
    price: 2000,
    category: 'Phụ kiện',
    sizes: ['One Size'],
    colors: ['Đen', 'Nâu', 'Be'],
    stock: 15,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
    rating: 4.6,
    numReviews: 8,
  },
  {
    name: 'Áo Hoodie Unisex',
    description: 'Áo hoodie nỉ bông dày dặn, giữ ấm tốt, phù hợp cho cả nam và nữ.',
    price: 2000,
    category: 'Áo',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Đen', 'Xám', 'Navy'],
    stock: 40,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
    rating: 4.9,
    numReviews: 32,
  },
  {
    name: 'Quần Short Kaki',
    description: 'Quần short kaki thoáng mát, thích hợp cho mùa hè, nhiều túi tiện lợi.',
    price: 2000,
    category: 'Quần',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Be', 'Xanh rêu', 'Xám'],
    stock: 35,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500',
    rating: 4.4,
    numReviews: 15,
  },
];

// Hàm import dữ liệu
const importData = async () => {
  try {
    // Xóa dữ liệu cũ
    await Product.deleteMany();
    console.log('✅ Đã xóa dữ liệu cũ');

    // Thêm dữ liệu mới
    await Product.insertMany(sampleProducts);
    console.log('✅ Đã thêm dữ liệu mẫu thành công!');

    process.exit();
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

// Hàm xóa dữ liệu
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('✅ Đã xóa toàn bộ dữ liệu!');

    process.exit();
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

// Chạy theo tham số
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}