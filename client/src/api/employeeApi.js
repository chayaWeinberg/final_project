import http from './http';

const BASE = '/api/employee';

export const getMyStats          = ()         => http.get(`${BASE}/stats`);
export const getPendingOrders    = ()         => http.get(`${BASE}/orders/pending`);
export const getMyActiveOrders   = ()         => http.get(`${BASE}/orders/active`);
export const getMyOrderHistory   = ()         => http.get(`${BASE}/orders/history`);
export const takeOrder           = (id)       => http.post(`${BASE}/orders/${id}/take`, {});
export const updateMyOrderStatus = (id, status) => http.put(`${BASE}/orders/${id}/status`, { status });
