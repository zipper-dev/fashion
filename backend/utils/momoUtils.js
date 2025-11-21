// momoService.js
const crypto = require('crypto');
const https = require('https');
const { MOMO_CONFIG } = require('../config/momoConfig');

/**
 * @param {string} orderId - Mã đơn hàng duy nhất.
 * @param {number} amount - Số tiền (VND), ví dụ: 50000.
 * @param {string} orderInfo - Thông tin đơn hàng.
 * @returns {Promise<Object>} Response từ MoMo.
 */
function createMoMoPayment(orderId, amount, orderInfo) {
    const { partnerCode, accessKey, secretKey, ipnUrl, redirectUrl, createPaymentUrl } = MOMO_CONFIG;
    const requestId = orderId;
    const requestType = "captureWallet"; // Hoặc "payWithMethod" nếu bạn dùng CollectionLink.js
    const extraData = ""; // Dữ liệu bổ sung nếu cần

    // 1. Tạo Raw Signature String (Không thay đổi thứ tự và định dạng)
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    // 2. Tạo Signature HMAC SHA256
    const signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    // 3. Tạo Request Body
    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount.toString(), // Chuyển số tiền thành string
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: 'en'
    });

    // 4. Gửi Request HTTPS
    const options = {
        hostname: new URL(createPaymentUrl).hostname,
        port: 443,
        path: new URL(createPaymentUrl).pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const responseJson = JSON.parse(body);
                    resolve(responseJson);
                } catch (e) {
                    reject(new Error(`Error parsing response: ${body}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(requestBody);
        req.end();
    });
}

module.exports = {
    createMoMoPayment,
    verifyIPN
    // ... thêm các hàm khác như check status, QuickPay, v.v.
};