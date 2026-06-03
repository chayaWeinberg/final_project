const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{9,15}$/;

function validateLogin({ email, password }) {
    if (!email || !password) throw new Error('Missing email or password');
    if (!EMAIL_REGEX.test(email)) throw new Error('Invalid email format');
    if (password.length < 8) throw new Error('Password must be at least 8 characters');
}

function validateRegister({ email, password, name, phone }) {
    if (!email || !password || !name) throw new Error('Missing required fields');
    if (!EMAIL_REGEX.test(email)) throw new Error('Invalid email format');
    if (name.trim().length < 2 || name.trim().length > 50) throw new Error('Name must be between 2 and 50 characters');
    if (password.length < 8) throw new Error('Password must be at least 8 characters');
    if (!/[a-zA-Z]/.test(password)) throw new Error('Password must contain at least one letter');
    if (!/[0-9]/.test(password)) throw new Error('Password must contain at least one number');
    if (phone && !PHONE_REGEX.test(phone)) throw new Error('Invalid phone number');
}

module.exports = { validateLogin, validateRegister };
