import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        backgroundColor: '#fff',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <img 
        src={product.image || 'https://via.placeholder.com/250'} 
        alt={product.name}
        style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px' }}
      />
      <h3 style={{ margin: '10px 0', fontSize: '18px' }}>{product.name}</h3>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
        {product.description.substring(0, 80)}...
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#e53935' }}>
          {product.price.toLocaleString('vi-VN')}₫
        </span>
        <span style={{ fontSize: '14px', color: '#999' }}>
          {product.category}
        </span>
      </div>
    </div>
  );
};

export default ProductCard;