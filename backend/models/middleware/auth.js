const jwt = require('jsonwebtoken');
const User = require('../User');
const { isFallbackMode, findUserById } = require('../dbFallback');
 
const protect = async (req, res, next) => {
  let token;
 
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (isFallbackMode()) {
        req.user = findUserById(decoded.id);
        if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, token failed' });
        }
        return next();
      }

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
 
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
 
module.exports = { protect };