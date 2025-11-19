import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../utils/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => { // đã sửa đoạn này  Đưa fetchProduct vào useEffect
  const fetchProduct = async () => {
    try {
      const response = await getProductById(id);
      setProduct(response.data);
      setSelectedSize(response.data.sizes[0] || '');
      setSelectedColor(response.data.colors[0] || '');
      setLoading(false);
    } catch (err) {
      alert('Không thể tải sản phẩm');
      setLoading(false);
    }
  };

  fetchProduct();
}, [id]);

  const handleAddToCart = () => {
    const cartItem = {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      qty: quantity,
    };

    // Lưu vào localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));

    alert('Đã thêm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    const orderItem = {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      qty: quantity,
    };
    
    localStorage.setItem('quickBuy', JSON.stringify([orderItem]));
    navigate('/checkout');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '50px' }}>Không tìm thấy sản phẩm</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => navigate('/')}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          cursor: 'pointer',
          border: '1px solid #ddd',
          borderRadius: '5px',
          backgroundColor: '#fff',
        }}
      >
        ← Quay lại
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Image */}
        <div>
          <img 
            src={product.image || 'https://via.placeholder.com/500'} 
            alt={product.name}
            style={{ width: '100%', borderRadius: '10px' }}
          />
        </div>

        {/* Info */}
        <div>
          <h1 style={{ marginBottom: '10px' }}>{product.name}</h1>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            {product.category}
          </p>
          <h2 style={{ color: '#e53935', marginBottom: '20px' }}>
            {product.price.toLocaleString('vi-VN')}₫
          </h2>
          
          <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
            {product.description}
          </p>

          {/* Size */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Kích thước:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    padding: '10px 20px',
                    border: selectedSize === size ? '2px solid #e53935' : '1px solid #ddd',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    backgroundColor: selectedSize === size ? '#ffe5e5' : '#fff',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Màu sắc:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    padding: '10px 20px',
                    border: selectedColor === color ? '2px solid #e53935' : '1px solid #ddd',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    backgroundColor: selectedColor === color ? '#ffe5e5' : '#fff',
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Số lượng:
            </label>
            <input 
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              style={{
                padding: '10px',
                width: '100px',
                border: '1px solid #ddd',
                borderRadius: '5px',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                padding: '15px',
                border: '1px solid #e53935',
                borderRadius: '5px',
                backgroundColor: '#fff',
                color: '#e53935',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Thêm vào giỏ
            </button>
            <button
              onClick={handleBuyNow}
              style={{
                flex: 1,
                padding: '15px',
                border: 'none',
                borderRadius: '5px',
                backgroundColor: '#e53935',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;