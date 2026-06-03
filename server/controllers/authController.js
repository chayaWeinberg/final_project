const authService = require('../services/authService');
const { validateLogin, validateRegister } = require('../utils/validators');

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

async function register(req, res, next) {
    try {
        validateRegister(req.body);
        const { accessToken, refreshToken, user } = await authService.register(req.body);
        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
        return res.status(201).json({ token: accessToken, user });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        validateLogin(req.body);
        const { accessToken, refreshToken, user } = await authService.login(req.body);
        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
        return res.json({ token: accessToken, user });
    } catch (err) {
        next(err);
    }
}

async function refresh(req, res, next) {
    try {
        const token = req.cookies?.refreshToken;
        const { accessToken } = await authService.refresh(token);
        return res.json({ token: accessToken });
    } catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        const token = req.cookies?.refreshToken;
        await authService.logout(token);
        res.clearCookie('refreshToken', COOKIE_OPTIONS);
        return res.json({ message: 'Logged out' });
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login, refresh, logout };
