import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; //cap nhat domain nay

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);

// Orders API
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getOrderById = (id) => api.get(`/orders/${id}`);

// Payment API
export const createMoMoPayment = (paymentData) => 
  api.post('/payment/momo/create', paymentData);
export const createSepayPayment = (paymentData) => 
  api.post('/payment/sepay/create', paymentData);

export default api;