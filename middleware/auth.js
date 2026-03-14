const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);

  if (!token) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    return res.redirect('/auth/login?redirect=' + req.originalUrl);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) {
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }
    next();
  } catch (error) {
    res.clearCookie('token');
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
      return res.status(401).json({ success: false, message: 'Token invalid' });
    }
    return res.redirect('/auth/login');
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).render('error', { message: 'Admin access required', user: req.user });
};

const optionalAuth = async (req, res, next) => {
  let token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      req.user = null;
    }
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
