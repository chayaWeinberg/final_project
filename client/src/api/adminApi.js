import http from './http';

export const getStats           = ()         => http.get('/api/admin/stats');
export const getEmployees       = ()         => http.get('/api/admin/employees');
export const createEmployee     = (data)     => http.post('/api/admin/employees', data);
export const deactivateEmployee = (id)       => http.delete(`/api/admin/employees/${id}`);
export const reactivateEmployee = (id)       => http.put(`/api/admin/employees/${id}/reactivate`, {});
