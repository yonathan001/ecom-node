const auth = require('../lib/auth');

const betterAuthMiddleware = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const adminAuthMiddleware = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { betterAuthMiddleware, adminAuthMiddleware };
