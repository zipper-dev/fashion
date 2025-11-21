const crypto = require('crypto');
const https = require('https');
const Order = require('../models/Order');

// ===== MOMO PAYMENT - SỬA LỖI resultCode: 20 =====
const createMoMoPayment = async (req, res) => {
  try {
    const { orderId, amount, orderInfo, orderItems, shippingAddress } = req.body;

    console.log('📝 Nhận request tạo thanh toán MoMo:', { orderId, amount });

    // Lấy thông tin từ .env
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const redirectUrl = process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment-result';
    const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payment/momo/callback';
    const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

    // Kiểm tra config
    if (!partnerCode || !accessKey || !secretKey) {
      console.error('❌ Thiếu config MoMo trong .env');
      return res.status(500).json({
        success: false,
        message: 'Chưa cấu hình MoMo. Vui lòng kiểm tra file .env',
      });
    }

    console.log('🔑 MoMo Config:', {
      partnerCode,
      accessKey: accessKey.substring(0, 10) + '...',
      endpoint,
      redirectUrl,
      ipnUrl,
    });

    // Tạo requestId và orderId
    const requestId = orderId + '_' + new Date().getTime();
    const momoOrderId = orderId;

    // ⚠️ QUAN TRỌNG: requestType phải đúng
    // Có 3 loại:
    // - captureWallet: Thanh toán ví MoMo
    // - payWithATM: Thanh toán ATM/Thẻ
    // - payWithMethod: Chọn phương thức (khuyến nghị)
    const requestType = 'captureWallet';
    const extraData = '';

    // 1️⃣ TẠO RAW SIGNATURE - ĐÚNG THỨ TỰ THEO TÀI LIỆU MOMO
    const rawSignature =
      'accessKey=' + accessKey +
      '&amount=' + amount +
      '&extraData=' + extraData +
      '&ipnUrl=' + ipnUrl +
      '&orderId=' + momoOrderId +
      '&orderInfo=' + orderInfo +
      '&partnerCode=' + partnerCode +
      '&redirectUrl=' + redirectUrl +
      '&requestId=' + requestId +
      '&requestType=' + requestType;

    console.log('🔐 Raw Signature:', rawSignature);

    // 2️⃣ TẠO SIGNATURE
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    console.log('✅ Signature:', signature);

    // 3️⃣ TẠO REQUEST BODY - ĐẦY ĐỦ FIELDS
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'FOR HER FASHION', // 🔴 Đổi tên shop của bạn
      storeId: 'FORHER01', // 🔴 Mã cửa hàng
      requestId: requestId,
      amount: amount.toString(), // ⚠️ Phải là string
      orderId: momoOrderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: 'vi',
      extraData: extraData,
      requestType: requestType,
      signature: signature,
    });

    console.log('📤 Request Body:', requestBody);

    // 4️⃣ PARSE ENDPOINT
    const urlParts = new URL(endpoint);

    const options = {
      hostname: urlParts.hostname,
      port: 443,
      path: urlParts.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    console.log('🌐 Gửi request tới:', `https://${options.hostname}${options.path}`);

    // 5️⃣ GỬI REQUEST TỚI MOMO
    const momoReq = https.request(options, (momoRes) => {
      let data = '';

      momoRes.on('data', (chunk) => {
        data += chunk;
      });

      momoRes.on('end', async () => {
        console.log('📥 MoMo Response (raw):', data);

        try {
          const response = JSON.parse(data);
          console.log('📥 MoMo Response (parsed):', response);

          // 6️⃣ XỬ LÝ RESPONSE
          if (response.resultCode === 0) {
            // ✅ THÀNH CÔNG
            console.log('✅ Tạo thanh toán MoMo thành công!');
            console.log('💳 Payment URL:', response.payUrl);
            console.log('📱 Deep link:', response.deeplink);
            console.log('🔲 QR Code:', response.qrCodeUrl);

            // Tạo đơn hàng trong database
            try {
              const order = new Order({
                user: req.body.userId || '000000000000000000000000',
                orderItems: orderItems || [],
                shippingAddress: shippingAddress || {},
                paymentMethod: 'MoMo',
                totalPrice: amount,
                isPaid: false,
                orderStatus: 'Pending',
                paymentResult: {
                  transactionId: momoOrderId,
                  status: 'Pending',
                  updateTime: new Date().toISOString(),
                },
              });

              await order.save();
              console.log('💾 Đã lưu đơn hàng:', order._id);
            } catch (dbError) {
              console.error('⚠️ Lỗi lưu database (không ảnh hưởng thanh toán):', dbError.message);
            }

            // Trả về cho Frontend
            res.json({
              success: true,
              message: 'Tạo thanh toán MoMo thành công',
              payUrl: response.payUrl,
              deeplink: response.deeplink || response.deepLink, // MoMo có thể trả về deepLink hoặc deeplink
              qrCodeUrl: response.qrCodeUrl,
              orderId: momoOrderId,
              requestId: requestId,
              amount: amount,
            });

          } else {
            // ❌ LỖI TỪ MOMO
            console.error('❌ MoMo trả về lỗi:');
            console.error('Result Code:', response.resultCode);
            console.error('Message:', response.message);
            console.error('LocalMessage:', response.localMessage);

            // Giải thích lỗi phổ biến
            let errorMessage = response.message || 'Có lỗi từ MoMo';
            
            switch(response.resultCode) {
              case 9000:
                errorMessage = 'Giao dịch đang được xử lý';
                break;
              case 10:
                errorMessage = 'Hệ thống đang bảo trì';
                break;
              case 11:
                errorMessage = 'Số tiền không hợp lệ';
                break;
              case 12:
                errorMessage = 'Thông tin thanh toán không hợp lệ';
                break;
              case 13:
                errorMessage = 'Mã OTP không đúng';
                break;
              case 20:
                errorMessage = 'Request sai format. Kiểm tra lại config MoMo trong .env';
                break;
              case 21:
                errorMessage = 'Số tiền vượt quá hạn mức';
                break;
              case 40:
                errorMessage = 'Tài khoản không đủ số dư';
                break;
              case 41:
                errorMessage = 'Đơn hàng đã tồn tại';
                break;
              case 42:
                errorMessage = 'Đơn hàng không tồn tại';
                break;
              case 43:
                errorMessage = 'Đơn hàng đã được thanh toán';
                break;
              case 1000:
                errorMessage = 'Giao dịch đã được khởi tạo, đang chờ người dùng xác nhận';
                break;
              case 1001:
                errorMessage = 'Giao dịch đã thất bại do người dùng từ chối';
                break;
              case 1002:
                errorMessage = 'Giao dịch thất bại do hệ thống timeout';
                break;
              case 1003:
                errorMessage = 'Giao dịch bị hủy';
                break;
              case 1004:
                errorMessage = 'Giao dịch thất bại do số dư không đủ';
                break;
              case 1005:
                errorMessage = 'Giao dịch thất bại do URL không hợp lệ';
                break;
              case 1006:
                errorMessage = 'Giao dịch thất bại do không tìm thấy người dùng';
                break;
              case 1007:
                errorMessage = 'Giao dịch thất bại do không xác thực được người dùng';
                break;
              case 2001:
                errorMessage = 'Giao dịch thất bại do sai thông tin thanh toán';
                break;
              case 3001:
                errorMessage = 'Partner không tồn tại';
                break;
              case 3002:
                errorMessage = 'Partner chưa được kích hoạt';
                break;
              case 3003:
                errorMessage = 'Access key không hợp lệ';
                break;
              case 3004:
                errorMessage = 'Signature không hợp lệ';
                break;
              case 4001:
                errorMessage = 'Số tiền không hợp lệ';
                break;
              case 4100:
                errorMessage = 'Giao dịch thất bại do hệ thống lỗi';
                break;
            }

            res.status(400).json({
              success: false,
              message: errorMessage,
              resultCode: response.resultCode,
              details: response,
            });
          }
        } catch (parseError) {
          console.error('❌ Lỗi parse JSON từ MoMo:', parseError);
          res.status(500).json({
            success: false,
            message: 'Không thể xử lý phản hồi từ MoMo',
            error: parseError.message,
          });
        }
      });
    });

    momoReq.on('error', (error) => {
      console.error('❌ Lỗi kết nối MoMo:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể kết nối tới MoMo: ' + error.message,
      });
    });

    momoReq.write(requestBody);
    momoReq.end();

  } catch (error) {
    console.error('❌ Lỗi tổng quát:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// ===== MOMO CALLBACK =====
const momoCallback = async (req, res) => {
  try {
    console.log('📞 Nhận callback từ MoMo:', req.body);

    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    // Xác thực signature
    const secretKey = process.env.MOMO_SECRET_KEY;
    const accessKey = process.env.MOMO_ACCESS_KEY;

    const rawSignature =
      'accessKey=' + accessKey +
      '&amount=' + amount +
      '&extraData=' + extraData +
      '&message=' + message +
      '&orderId=' + orderId +
      '&orderInfo=' + orderInfo +
      '&orderType=' + orderType +
      '&partnerCode=' + partnerCode +
      '&payType=' + payType +
      '&requestId=' + requestId +
      '&responseTime=' + responseTime +
      '&resultCode=' + resultCode +
      '&transId=' + transId;

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Signature không hợp lệ!');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Cập nhật đơn hàng
    if (resultCode === 0) {
      const order = await Order.findOne({
        'paymentResult.transactionId': orderId,
      });

      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.orderStatus = 'Processing';
        order.paymentResult = {
          transactionId: transId,
          status: 'Completed',
          updateTime: new Date(responseTime).toISOString(),
        };

        await order.save();
        console.log('✅ Đã cập nhật đơn hàng:', orderId);
      }
    }

    res.status(200).json({ message: 'Callback received' });
  } catch (error) {
    console.error('❌ Lỗi callback:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== CHECK PAYMENT STATUS =====
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      'paymentResult.transactionId': orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    res.json({
      success: true,
      isPaid: order.isPaid,
      orderStatus: order.orderStatus,
      paymentResult: order.paymentResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== SEPAY/BANK TRANSFER =====
const createSepayPayment = async (req, res) => {
  try {
    const { orderId, amount, orderInfo } = req.body;

    const bankInfo = {
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0377040708',
      accountName: process.env.BANK_ACCOUNT_NAME || 'LE QUOC BAO',
      bankName: process.env.BANK_NAME || 'VCB',
      bankFullName: process.env.BANK_FULL_NAME || 'Vietcombank',
      amount: amount,
      content: `DH${orderId}`,
      qrCodeUrl: `https://img.vietqr.io/image/${process.env.BANK_NAME || 'VCB'}-${process.env.BANK_ACCOUNT_NUMBER || '0377040708'}-compact2.png?amount=${amount}&addInfo=DH${orderId}&accountName=${encodeURIComponent(process.env.BANK_ACCOUNT_NAME || 'LE QUOC BAO')}`,
    };

    res.json({
      success: true,
      message: 'Thông tin chuyển khoản ngân hàng',
      bankInfo,
      instruction: `
Bước 1: Mở ứng dụng ngân hàng
Bước 2: Quét mã QR hoặc nhập thông tin:
  - Ngân hàng: ${bankInfo.bankFullName}
  - Số tài khoản: ${bankInfo.accountNumber}
  - Tên: ${bankInfo.accountName}
  - Số tiền: ${amount.toLocaleString('vi-VN')} VNĐ
  - Nội dung: DH${orderId}
Bước 3: Xác nhận chuyển khoản
      `.trim(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const sepayWebhook = async (req, res) => {
  try {
    console.log('📞 Nhận webhook từ SePay:', req.body);
    res.json({ message: 'Webhook received' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMoMoPayment,
  momoCallback,
  checkPaymentStatus,
  createSepayPayment,
  sepayWebhook,
};