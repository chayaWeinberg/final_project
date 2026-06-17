const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{9,15}$/;

function validateLogin({ email, password }) {
    if (!email || !password) {
        const error = new Error('Missing email or password');
        error.status = 400;
        throw error;
    }
    
    if (!EMAIL_REGEX.test(email)) {
        const error = new Error('Invalid email format');
        error.status = 400;
        throw error;
    }
    
    if (password.length < 8) {
        const error = new Error('Password must be at least 8 characters');
        error.status = 400;
        throw error;
    }
}

function validateRegister({ email, password, name, phone, city, street, buildingNumber }) {
    if (!email || !password || !name) {
        const error = new Error('Missing required fields: email, password, name');
        error.status = 400;
        throw error;
    }
    
    if (!EMAIL_REGEX.test(email)) {
        const error = new Error('Invalid email format');
        error.status = 400;
        throw error;
    }
    
    if (name.trim().length < 2 || name.trim().length > 50) {
        const error = new Error('Name must be between 2 and 50 characters');
        error.status = 400;
        throw error;
    }
    
    if (password.length < 8) {
        const error = new Error('Password must be at least 8 characters');
        error.status = 400;
        throw error;
    }
    
    if (phone && !PHONE_REGEX.test(phone)) {
        const error = new Error('Invalid phone number format');
        error.status = 400;
        throw error;
    }
    
    // Address validation
    if (!city || city.trim().length < 2) {
        const error = new Error('City is required');
        error.status = 400;
        throw error;
    }
    
    if (!street || street.trim().length < 2) {
        const error = new Error('Street is required');
        error.status = 400;
        throw error;
    }
    
    if (!buildingNumber || isNaN(buildingNumber) || buildingNumber < 1) {
        const error = new Error('Valid building number is required');
        error.status = 400;
        throw error;
    }
}

// Additional security validation
function sanitizeString(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>"'&]/g, '');
}

module.exports = { 
    validateLogin, 
    validateRegister, 
    sanitizeString
};
