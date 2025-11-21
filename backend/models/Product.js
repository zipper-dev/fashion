const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Áo', 'Quần', 'Váy', 'Phụ kiện'],
  },
  sizes: [{
    type: String,
  }],
  colors: [{
    type: String,
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  image: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);