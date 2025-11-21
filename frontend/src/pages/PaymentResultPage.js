import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking'); // checking, success, failed

  useEffect(() => {
    // Lấy thông tin từ URL params
    const resultCode = searchParams.get('resultCode');
    const message = searchParams.get('message');
    const orderId = searchParams.get('orderId');

    console.log('Payment Result:', { resultCode, message, orderId });

    // resultCode = 0 => Thành công
    // resultCode khác 0 => Thất bại
    if (resultCode === '0') {
      setStatus('success');
      
      // Xóa giỏ hàng
      localStorage.removeItem('cart');
      localStorage.removeItem('quickBuy');
    } else {
      setStatus('failed');
    }
  }, [searchParams]);

  if (status === 'checking') {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '100px auto', 
        textAlign: 'center',
        padding: '20px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <h2>Đang kiểm tra kết quả thanh toán...</h2>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '100px auto', 
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#f0f9ff',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ color: '#16a34a', marginBottom: '15px' }}>
          Thanh toán thành công!
        </h1>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
        </p>
        
        <div style={{ 
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          marginBottom: '30px',
          textAlign: 'left',
        }}>
          <p style={{ marginBottom: '10px' }}>
            <strong>📦 Mã đơn hàng:</strong> {searchParams.get('orderId')}
          </p>
          <p style={{ marginBottom: '10px' }}>
            <strong>💰 Số tiền:</strong> {parseInt(searchParams.get('amount') || 0).toLocaleString('vi-VN')}₫
          </p>
          <p>
            <strong>📱 Bạn sẽ nhận được email/SMS xác nhận trong giây lát.</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
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
              fontWeight: '600',
            }}
          >
            Về trang chủ
          </button>
          <button
            onClick={() => navigate('/orders')}
            style={{
              padding: '12px 30px',
              backgroundColor: '#fff',
              color: '#3b82f6',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    );
  }

  // Failed
  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '100px auto', 
      textAlign: 'center',
      padding: '40px',
      backgroundColor: '#fef2f2',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: '80px', marginBottom: '20px' }}>❌</div>
      <h1 style={{ color: '#dc2626', marginBottom: '15px' }}>
        Thanh toán thất bại
      </h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
        {searchParams.get('message') || 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
      </p>
      
      <div style={{ 
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        marginBottom: '30px',
        textAlign: 'left',
      }}>
        <p style={{ marginBottom: '10px' }}>
          <strong>Lý do:</strong>
        </p>
        <p style={{ color: '#666' }}>
          {searchParams.get('message') || 'Giao dịch bị từ chối hoặc hết thời gian chờ'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/checkout')}
          style={{
            padding: '12px 30px',
            backgroundColor: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Thử lại
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 30px',
            backgroundColor: '#fff',
            color: '#dc2626',
            border: '2px solid #dc2626',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

export default PaymentResultPage;