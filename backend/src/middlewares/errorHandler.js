// Centralised error handling: every controller calls next(err) when something goes wrong
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Validation / uniqueness errors returned by Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(' ') });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
}

// Small helper: wraps an async controller so that errors are automatically passed to next()
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
