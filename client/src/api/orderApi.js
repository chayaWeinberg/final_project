import http from './http';

const BASE = '/api/orders';

export const createOrder = (orderData) => http.post(BASE, orderData);
export const getOrderById = (id) => http.get(`${BASE}/${id}`);
export const getMyOrders = () => http.get(`${BASE}/my-orders`);
export const getAllOrders = () => http.get(BASE);
export const updateOrderStatus = (id, status) => http.put(`${BASE}/${id}/status`, { status });
