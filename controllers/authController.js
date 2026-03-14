const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
};

exports.showRegister = (req, res) => res.render('auth/register', { user: null, error: null });
exports.showLogin = (req, res) => res.render('auth/login', { user: null, error: null, redirect: req.query.redirect || '/' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) return res.render('auth/register', { user: null, error: 'Passwords do not match' });
    const exists = await User.findOne({ email });
    if (exists) return res.render('auth/register', { user: null, error: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.redirect('/');
  } catch (err) {
    res.render('auth/register', { user: null, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, redirect } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.render('auth/login', { user: null, error: 'Invalid email or password', redirect: redirect || '/' });
    }
    if (!user.isActive) return res.render('auth/login', { user: null, error: 'Account suspended', redirect: '/' });
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.redirect(redirect || '/');
  } catch (err) {
    res.render('auth/login', { user: null, error: err.message, redirect: '/' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};
