import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Gọi API lấy danh sách đơn hàng
      const response = await fetch('http://localhost:5000/api/orders/all');
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách đơn hàng');
      }

      const data = await response.json();
      console.log('Orders response:', data);
      
      // Kiểm tra data có phải array không
      if (!Array.isArray(data)) {
        console.error('Data không phải array:', data);
        throw new Error('Dữ liệu không hợp lệ');
      }
      
      // Sắp xếp đơn hàng mới nhất trước
      const sortedOrders = data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setOrders(sortedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Lỗi fetchOrders:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#ff9800',
      'Processing': '#2196f3',
      'Shipping': '#9c27b0',
      'Delivered': '#4caf50',
      'Cancelled': '#f44336',
    };
    return colors[status] || '#757575';
  };

  const getStatusText = (status) => {
    const texts = {
      'Pending': 'Chờ xử lý',
      'Processing': 'Đang xử lý',
      'Shipping': 'Đang giao',
      'Delivered': 'Đã giao',
      'Cancelled': 'Đã hủy',
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '50px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <h2>Đang tải đơn hàng...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '50px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ color: '#f44336', marginBottom: '15px' }}>Có lỗi xảy ra</h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>{error}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 30px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '50px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>📦</div>
        <h2 style={{ marginBottom: '15px' }}>Chưa có đơn hàng nào</h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
          Hãy mua sắm ngay để tạo đơn hàng đầu tiên!
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 30px',
            backgroundColor: '#e53935',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Mua sắm ngay
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
      }}>
        <h1 style={{ margin: 0 }}>📦 Đơn hàng của tôi</h1>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#fff',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          ← Về trang chủ
        </button>
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map((order) => (
          <div
            key={order._id}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {/* Order Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '15px',
              borderBottom: '1px solid #eee',
              marginBottom: '15px',
            }}>
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  Mã đơn hàng: <strong>{order.paymentResult?.transactionId || order._id}</strong>
                </p>
                <p style={{ fontSize: '12px', color: '#999' }}>
                  Đặt lúc: {formatDate(order.createdAt)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    backgroundColor: getStatusColor(order.orderStatus) + '20',
                    color: getStatusColor(order.orderStatus),
                    borderRadius: '15px',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '5px',
                  }}
                >
                  {getStatusText(order.orderStatus)}
                </span>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  {order.isPaid ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: '15px' }}>
              {order.orderItems && order.orderItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '15px',
                    padding: '10px 0',
                    borderBottom: index < order.orderItems.length - 1 ? '1px solid #f5f5f5' : 'none',
                  }}
                >
                  <img
                    src={item.image || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
                      {item.name}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#666', margin: '3px 0' }}>
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && ' | '}
                      {item.color && `Màu: ${item.color}`}
                    </p>
                    <p style={{ fontSize: '14px', color: '#666', margin: '3px 0' }}>
                      Số lượng: {item.qty}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#e53935' }}>
                      {(item.price * item.qty).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '15px',
              borderTop: '1px solid #eee',
            }}>
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  Giao đến: <strong>{order.shippingAddress?.fullName}</strong>
                </p>
                <p style={{ fontSize: '12px', color: '#999' }}>
                  {order.shippingAddress?.address}, {order.shippingAddress?.city}
                </p>
                <p style={{ fontSize: '12px', color: '#999' }}>
                  SĐT: {order.shippingAddress?.phone}
                </p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  Thanh toán: {order.paymentMethod}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  Tổng tiền:
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#e53935' }}>
                  {order.totalPrice?.toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>

            {/* Actions */}
            {!order.isPaid && order.orderStatus === 'Pending' && (
              <div style={{ marginTop: '15px', textAlign: 'right' }}>
                <button
                  onClick={() => {
                    // Tạo lại đơn hàng để thanh toán
                    localStorage.setItem('quickBuy', JSON.stringify(order.orderItems));
                    navigate('/checkout');
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#e53935',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginRight: '10px',
                  }}
                >
                  Thanh toán ngay
                </button>
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#fff',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Hủy đơn
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '10px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Tổng số đơn hàng: <strong>{orders.length}</strong> | 
          Đã thanh toán: <strong>{orders.filter(o => o.isPaid).length}</strong> | 
          Chờ xử lý: <strong>{orders.filter(o => !o.isPaid).length}</strong>
        </p>
      </div>
    </div>
  );
};

export default OrdersPage;