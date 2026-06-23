const jwt = require('jsonwebtoken');

const authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid Authorization header' });
      }

      const token = header.split(' ')[1];
      const secret = process.env.JWT_SECRET ;

      const decoded = jwt.verify(token, secret);
      req.user = decoded; 

      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid/expired token' });
    }
  };
};

module.exports = { authMiddleware };

