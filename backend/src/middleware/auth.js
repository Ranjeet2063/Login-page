const jwt = require('jsonwebtoken');

function auth(requiredRole) {
  return (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

module.exports = auth;
