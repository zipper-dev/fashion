import React, { useState, useEffect } from 'react';
import { getProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải sản phẩm');
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
      }}>
        <h1 style={{ color: '#333', margin: 0 }}>
          🛍️ Fashion Store
        </h1>
        <button
          onClick={() => window.location.href = '/orders'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          📦 Đơn hàng của tôi
        </button>
      </div>
      
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chưa có sản phẩm nào. Hãy thêm sản phẩm từ backend!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;