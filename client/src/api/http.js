const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

async function request(url, options = {}, retry = true) {
    const res = await fetch(baseUrl + url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
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
        return res.ok;
    } catch {
        return false;
    }
}

function clearAuth() {
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export default {
    get: (url) => request(url),
    post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (url) => request(url, { method: 'DELETE' })
};
