// backend/config/momoConfig.js

// LƯU Ý: Thay các giá trị DEMO này bằng giá trị thật của bạn sau!
const MOMO_CONFIG = {
    partnerCode: "MOMO4MUD20240115_TEST",
    accessKey: "Ekj9og2VnRfOuIys",
    secretKey: "PseUbm2s8QVJEbexsh8H3Jz2qa9tDqoa",
    // Endpoints
    createPaymentUrl: 'https://test-payment.momo.vn/v2/gateway/api/create',
    posPaymentUrl: 'https://test-payment.momo.vn/v2/gateway/api/pos',
    // URL Callback của bạn (Cần thay bằng domain thật)
    redirectUrl: "https://nonconterminal-unspecked-salena.ngrok-free.dev/payment/momo/return", 
    ipnUrl: "https://nonconterminal-unspecked-salena.ngrok-free.dev/api/payment/momo-ipn", // URL cho server nhận thông báo
};

// Lấy từ RSAExample.js (Dùng nếu bạn cần mã hóa extraData bằng RSA)
const MOMO_RSA_PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----'+
'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAiBIo9EMTElPppPejirL1'+
'cdgCuZUoBzGZF3SyrTp+xdMnIXSOiFYG+zHmI1lFzoEbEd1JwXAUV52gn/oAkUo+'+
'2qwuqZAPdkm714tiyjvxXE/0WYLl8X1K8uCSK47u26CnOLgNB6iW1m9jog00i9XV'+
'/AmKI1U8OioLFSp1BwMf3O+jA9uuRfj1Lv5Q0Q7RMtk4tgV924+D8mY/y3otBp5b'+
'+zX0NrWkRqwgPly6NeXN5LwqRj0LwAEVVwGbpl6V2cztYv94ZHjGzNziFJli2D0V'+
'pb/HRPP6ibXvllgbL4UXU4Izqhxml8gwd74jXaNaEgNJGhjjeUXR1sAm7Mpjqqgy'+
'xpx6B2+GpjWtEwvbJuO8DsmQNsm+bJZhw46uf9AuY5VSYy2cAF1XMXSAPNLqYEE8'+
'oVUki4IWYOEWSNXcQwikJC25rAErbyst/0i8RN4yqgiO/xVA1J1vdmRQTvGMXPGb'+
'DFpVca4MkHHLrkdC3Z3CzgMkbIqnpaDYoIHZywraHWA7Zh5fDt/t7FzX69nbGg8i'+
'4QFLzIm/2RDPePJTY2R24w1iVO5RhEbKEaTBMuibp4UJH+nEQ1p6CNdHvGvWz8S0'+
'izfiZmYIddaPatQTxYRq4rSsE/+2L+9RE9HMqAhQVvehRGWWiGSY1U4lWVeTGq2s'+
'uCNcMZdgDMbbIaSEJJRQTksCAwEAAQ=='+
'-----END PUBLIC KEY-----';

// Lấy từ AES_Test.js (Dùng nếu bạn cần mã hóa/giải mã dữ liệu nội bộ)
const AES_CONFIG = {
    secretKey: 'um76xDBeRmmj5kVMhXiCeFKixZTTlmZb', // Khóa AES của bạn
    iv: Buffer.alloc(16, 0), // Initialization Vector (IV)
};

module.exports = {
    MOMO_CONFIG,
    MOMO_RSA_PUBLIC_KEY,
    AES_CONFIG
};