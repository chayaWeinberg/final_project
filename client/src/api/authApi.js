import http from './http';
import { clearAuth } from '../utils/authStorage';

export async function register(userData) {
    const data = await http.post('/api/auth/register', userData);
    return data;
}

export async function login(email, password) {
    const data = await http.post('/api/auth/login', { email, password });
    return data;
}

export async function logout() {
    await http.post('/api/auth/logout', {});
    clearAuth();
}
