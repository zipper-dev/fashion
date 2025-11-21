import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMoMoPayment, createSepayPayment } from '../utils/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('MoMo');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    // Lấy sản phẩm từ localStorage
    const quickBuy = JSON.parse(localStorage.getItem('quickBuy') || '[]');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    setOrderItems(quickBuy.length > 0 ? quickBuy : cart);
  }, []);

  const totalPrice = orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (orderItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setLoading(true);

    try {
      // Tạo orderId unique
      const orderId = 'FS' + Date.now(); // FS = Fashion Store
      setCurrentOrderId(orderId);
      
      const orderData = {
        orderId: orderId,
        amount: totalPrice,
        orderInfo: `Thanh toán đơn hàng ${orderId}`,
        orderItems: orderItems,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
        },
      };

      // Gọi API thanh toán
      let response;
      if (paymentMethod === 'MoMo') {
        response = await createMoMoPayment(orderData);
        
        if (response.data.success) {
          // Redirect tới trang thanh toán MoMo
          // Hoặc hiển thị QR Code
          setPaymentInfo({
            ...response.data,
            type: 'momo',
          });
        } else {
          alert('Lỗi: ' + response.data.message);
        }
      } else {
        response = await createSepayPayment(orderData);
        
        if (response.data.success) {
          setPaymentInfo({
            ...response.data,
            type: 'sepay',
          });
          
          // Bắt đầu polling kiểm tra chuyển khoản
          setTimeout(() => {
            startSepayPolling();
          }, 10000); // Đợi 10 giây trước khi bắt đầu check
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Lỗi thanh toán:', error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  // Hàm mở trang thanh toán MoMo
  const handleOpenMoMo = () => {
    if (paymentInfo.payUrl) {
      // Mở trang thanh toán MoMo trong tab mới
      window.open(paymentInfo.payUrl, '_blank');
      
      // Bắt đầu polling kiểm tra thanh toán
      startPaymentPolling();
    } else {
      alert('Không có link thanh toán. Vui lòng thử lại.');
    }
  };

  // Polling kiểm tra thanh toán SePay
  const startSepayPolling = () => {
    let pollCount = 0;
    const maxPolls = 60; // Kiểm tra tối đa 60 lần (5 phút)
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      
      try {
        const response = await fetch(
          `http://localhost:5000/api/payment/momo/status/${currentOrderId}`
        );
        const data = await response.json();
        
        if (data.success && data.isPaid) {
          clearInterval(pollInterval);
          alert('✅ Đã nhận được tiền chuyển khoản! Đơn hàng của bạn đang được xử lý.');
          
          // Xóa giỏ hàng
          localStorage.removeItem('cart');
          localStorage.removeItem('quickBuy');
          
          // Chuyển về trang chủ
          navigate('/');
        } else if (pollCount >= maxPolls) {
          // Hết thời gian polling
          clearInterval(pollInterval);
          console.log('⏰ Hết thời gian kiểm tra tự động');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra thanh toán:', error);
      }
    }, 5000); // Kiểm tra mỗi 5 giây

    // Lưu interval ID để có thể clear khi component unmount
    return pollInterval;
  };

  // Polling kiểm tra trạng thái thanh toán
  const startPaymentPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/payment/momo/status/${currentOrderId}`
        );
        const data = await response.json();
        
        if (data.success && data.isPaid) {
          clearInterval(pollInterval);
          alert('✅ Thanh toán thành công!');
          
          // Xóa giỏ hàng
          localStorage.removeItem('cart');
          localStorage.removeItem('quickBuy');
          
          // Chuyển về trang chủ
          navigate('/');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra thanh toán:', error);
      }
    }, 3000); // Kiểm tra mỗi 3 giây

    // Dừng sau 5 phút
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 5 * 60 * 1000);
  };

  // Hiển thị thông tin thanh toán
  if (paymentInfo) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '10px' }}>
            {paymentInfo.type === 'momo' ? '💳 Thanh toán MoMo' : '🏦 Chuyển khoản ngân hàng'}
          </h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#e53935' }}>
            {totalPrice.toLocaleString('vi-VN')}₫
          </p>
        </div>

        {paymentInfo.type === 'momo' ? (
          // HIỂN THỊ THANH TOÁN MOMO
          <div style={{ textAlign: 'center' }}>
            {paymentInfo.qrCodeUrl && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ marginBottom: '15px', fontSize: '16px' }}>
                  Quét mã QR bằng ứng dụng MoMo
                </p>
                <img 
                  src={paymentInfo.qrCodeUrl} 
                  alt="MoMo QR Code"
                  style={{ 
                    width: '300px', 
                    height: '300px', 
                    margin: '0 auto',
                    border: '2px solid #d82d8b',
                    borderRadius: '10px',
                    padding: '10px',
                  }}
                />
              </div>
            )}

            <div style={{ margin: '30px 0' }}>
              <p style={{ marginBottom: '15px', fontSize: '16px' }}>Hoặc</p>
              <button
                onClick={handleOpenMoMo}
                style={{
                  padding: '15px 40px',
                  backgroundColor: '#d82d8b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              >
                Mở ứng dụng MoMo
              </button>
            </div>

            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              backgroundColor: '#fff3cd', 
              borderRadius: '10px',
              textAlign: 'left',
            }}>
              <p style={{ fontSize: '14px', color: '#856404', marginBottom: '10px' }}>
                <strong>📋 Thông tin đơn hàng:</strong>
              </p>
              <p style={{ fontSize: '14px', color: '#856404' }}>
                Mã đơn: {paymentInfo.orderId}<br />
                Mã giao dịch: {paymentInfo.requestId}
              </p>
              <p style={{ fontSize: '12px', color: '#856404', marginTop: '10px' }}>
                💡 Sau khi thanh toán thành công, hệ thống sẽ tự động cập nhật đơn hàng.
              </p>
            </div>
          </div>
        ) : (
          // HIỂN THỊ CHUYỂN KHOẢN NGÂN HÀNG
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '15px', fontSize: '16px' }}>
              Quét mã QR hoặc chuyển khoản thủ công
            </p>
            
            {paymentInfo.bankInfo && (
              <>
                <img 
                  src={paymentInfo.bankInfo.qrCodeUrl} 
                  alt="Bank QR Code"
                  style={{ 
                    width: '300px', 
                    height: '300px', 
                    margin: '0 auto 20px',
                    border: '2px solid #1976d2',
                    borderRadius: '10px',
                    padding: '10px',
                  }}
                />

                <div style={{ 
                  marginTop: '20px', 
                  padding: '20px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '10px',
                  textAlign: 'left',
                }}>
                  <h4 style={{ marginBottom: '15px' }}>Thông tin chuyển khoản:</h4>
                  <p><strong>🏦 Ngân hàng:</strong> {paymentInfo.bankInfo.bankFullName}</p>
                  <p><strong>📝 Số tài khoản:</strong> {paymentInfo.bankInfo.accountNumber}</p>
                  <p><strong>👤 Tên tài khoản:</strong> {paymentInfo.bankInfo.accountName}</p>
                  <p><strong>💰 Số tiền:</strong> <span style={{ color: '#e53935', fontSize: '18px' }}>
                    {paymentInfo.bankInfo.amount.toLocaleString('vi-VN')}₫
                  </span></p>
                  <p><strong>✉️ Nội dung:</strong> {paymentInfo.bankInfo.content}</p>
                </div>

                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '10px',
                }}>
                  <p style={{ fontSize: '14px', color: '#1565c0' }}>
                    ⚠️ <strong>Lưu ý:</strong> Vui lòng ghi CHÍNH XÁC nội dung chuyển khoản để hệ thống tự động xác nhận.
                  </p>
                  <p style={{ fontSize: '14px', color: '#1565c0', marginTop: '10px' }}>
                    💡 Hệ thống sẽ tự động kiểm tra và xác nhận đơn hàng sau khi nhận được tiền (1-5 phút).
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={() => {
              setPaymentInfo(null);
              navigate('/');
            }}
            style={{
              padding: '12px 30px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Form đặt hàng
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>🛒 Thanh toán</h1>

      {/* Order Items */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Sản phẩm đặt hàng:</h3>
        {orderItems.length === 0 ? (
          <p>Giỏ hàng trống</p>
        ) : (
          orderItems.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '20px', 
              padding: '15px', 
              border: '1px solid #ddd',
              borderRadius: '5px',
              marginBottom: '10px',
              backgroundColor: '#fff',
            }}>
              <img 
                src={item.image} 
                alt={item.name} 
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }} 
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ marginBottom: '5px' }}>{item.name}</h4>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  Size: {item.size} | Màu: {item.color}
                </p>
                <p style={{ fontSize: '14px', color: '#666' }}>Số lượng: {item.qty}</p>
              </div>
              <div>
                <strong style={{ fontSize: '16px' }}>
                  {(item.price * item.qty).toLocaleString('vi-VN')}₫
                </strong>
              </div>
            </div>
          ))
        )}
        <div style={{ 
          textAlign: 'right', 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '5px',
        }}>
          Tổng cộng: <span style={{ color: '#e53935' }}>{totalPrice.toLocaleString('vi-VN')}₫</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmitOrder}>
        <h3>Thông tin giao hàng:</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Họ tên: <span style={{ color: 'red' }}>*</span>
          </label>
          <input 
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Nguyễn Văn A"
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '5px', 
              border: '1px solid #ddd',
              fontSize: '16px',
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Số điện thoại: <span style={{ color: 'red' }}>*</span>
          </label>
          <input 
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="0912345678"
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '5px', 
              border: '1px solid #ddd',
              fontSize: '16px',
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Địa chỉ: <span style={{ color: 'red' }}>*</span>
          </label>
          <input 
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="123 Đường ABC, Phường XYZ"
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '5px', 
              border: '1px solid #ddd',
              fontSize: '16px',
            }}
          />
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Thành phố: <span style={{ color: 'red' }}>*</span>
          </label>
          <input 
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Hồ Chí Minh"
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '5px', 
              border: '1px solid #ddd',
              fontSize: '16px',
            }}
          />
        </div>

        <h3>Phương thức thanh toán:</h3>
        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '15px', 
            padding: '15px',
            border: paymentMethod === 'MoMo' ? '2px solid #d82d8b' : '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: paymentMethod === 'MoMo' ? '#fce4ec' : '#fff',
          }}>
            <input 
              type="radio"
              value="MoMo"
              checked={paymentMethod === 'MoMo'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <span style={{ fontSize: '16px', fontWeight: '500' }}>💳 Ví MoMo</span>
          </label>
          
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            padding: '15px',
            border: paymentMethod === 'SePay' ? '2px solid #1976d2' : '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: paymentMethod === 'SePay' ? '#e3f2fd' : '#fff',
          }}>
            <input 
              type="radio"
              value="SePay"
              checked={paymentMethod === 'SePay'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <span style={{ fontSize: '16px', fontWeight: '500' }}>🏦 Chuyển khoản ngân hàng</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || orderItems.length === 0}
          style={{
            width: '100%',
            padding: '18px',
            backgroundColor: loading ? '#ccc' : '#e53935',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: loading || orderItems.length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          {loading ? 'Đang xử lý...' : `Thanh toán ${totalPrice.toLocaleString('vi-VN')}₫`}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;