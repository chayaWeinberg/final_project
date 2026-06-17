import http from './http';

const BASE = '/api/menu';

export const getAllItems = () => http.get(BASE);
export const getItemById = (id) => http.get(`${BASE}/${id}`);
export const getItemsByCategory = (category) => http.get(`${BASE}/category/${category}`);
export const getHitItems = () => http.get(`${BASE}/hits`);
export const searchItems = (query) => http.get(`${BASE}/search?query=${encodeURIComponent(query)}`);

export const addItem = (item) => http.post(BASE, item);
export const updateItem = (id, item) => http.put(`${BASE}/${id}`, item);
export const deleteItem = (id) => http.delete(`${BASE}/${id}`);

/**
 * Upload a menu item image as base64
 * @param {File} file - browser File object
 * @returns {Promise<{filename: string}>}
 */
export function uploadMenuImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const result = await http.post('/api/admin/menu/upload-image', {
                    imageData: reader.result,
                    filename: file.name,
                });
                resolve(result);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}
