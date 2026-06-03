const baseUrl = 'http://localhost:3000';

function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url, options = {}, retry = true) {

    const res = await fetch(baseUrl + url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...options.headers
        }
    });

    if (res.status === 401 && retry) {
        const refreshed = await tryRefresh();
        if (refreshed) return request(url, options, false);
        clearAuth();
        window.location.href = '/login';
        return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const error = new Error(data.message || 'Request failed');
        error.status = res.status;
        throw error;
    }

    return data;
}

async function tryRefresh() {
    try {
        const res = await fetch(baseUrl + '/api/auth/refresh', {
            method: 'POST',
            credentials: 'include'
        });
        if (!res.ok) return false;
        const data = await res.json();
        localStorage.setItem('token', data.token);
        return true;
    } catch {
        return false;
    }
}

function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

export default {
    get: (url) => request(url),
    post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (url) => request(url, { method: 'DELETE' })
};
