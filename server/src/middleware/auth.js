const crypto = require('crypto');
const store = require('../store');

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

function requireAdmin(req, res, next) {
  const secret = process.env.ADMIN_TOKEN;
  if (!secret) return res.status(503).json({ error: 'Admin is disabled. Set ADMIN_TOKEN in server/.env.' });
  if (!store.isDbReady()) return res.status(503).json({ error: 'Admin needs MongoDB. Set MONGODB_URI and make sure it is running.' });
  const given = req.get('x-admin-token') || '';
  if (!given || !safeEqual(given, secret)) return res.status(401).json({ error: 'Wrong admin token.' });
  next();
}

module.exports = { requireAdmin };
