const authService = require('../services/authService');
const { validateLogin, validateRegister } = require('../utils/validators');

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production'
};

// Input sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    if (input === null || input === undefined) return input;
    return input.trim().replace(/<script[^>]*>.*?<\/script>/gi, '');
}

function sanitizeBody(body) {
    const sanitized = {};
    Object.keys(body).forEach(key => {
        if (typeof body[key] === 'string') {
            sanitized[key] = sanitizeInput(body[key]);
        } else {
            sanitized[key] = body[key];
        }
    });
    return sanitized;
}

async function register(req, res, next) {
    try {
        console.log('Register request received:', req.body);

        const sanitizedBody = sanitizeBody(req.body);
        console.log('Sanitized body:', sanitizedBody);

        validateRegister(sanitizedBody);
        console.log('Validation passed');

        const { accessToken, refreshToken, user } = await authService.register(sanitizedBody);
        console.log('User registered successfully:', user.id);

        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
        res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, httpOnly: false });

        console.log(`User registered: ${user.id} at ${new Date().toISOString()}`);

        return res.status(201).json({ user });
    } catch (err) {
        console.error('Registration error details:', {
            message: err.message,
            stack: err.stack,
            body: req.body
        });
        next(err);
    }
}

async function login(req, res, next) {
    try {
        console.log('Login request received:', req.body);

        const sanitizedBody = sanitizeBody(req.body);
        console.log('Login sanitized body:', sanitizedBody);

        validateLogin(sanitizedBody);
        console.log('Login validation passed');

        const { accessToken, refreshToken, user } = await authService.login(sanitizedBody);
        console.log('User logged in successfully:', user.id);

        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
        res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, httpOnly: false });

        console.log(`User logged in: ${user.id} at ${new Date().toISOString()}`);

        return res.json({ user });
    } catch (err) {
        console.error('Login error details:', {
            message: err.message,
            stack: err.stack,
            body: req.body
        });
        next(err);
    }
}

async function refresh(req, res, next) {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        const { accessToken } = await authService.refresh(token);
        res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, httpOnly: false });

        return res.json({});
    } catch (err) {
        console.error('Token refresh error:', err.message);
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        const token = req.cookies?.refreshToken;

        if (token) {
            await authService.logout(token);
        }

        res.clearCookie('refreshToken', COOKIE_OPTIONS);
        res.clearCookie('accessToken', { ...COOKIE_OPTIONS, httpOnly: false });

        return res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err.message);
        next(err);
    }
}

module.exports = { register, login, refresh, logout };
