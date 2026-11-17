// Authorization middlewares, placed in front of protected routes

// The user must be logged in (a valid session exists)
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be signed in.' });
  }
  next();
}

// The user must be an administrator
function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be signed in.' });
  }
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Administrators only.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
