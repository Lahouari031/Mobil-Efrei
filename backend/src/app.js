// Express application setup (global middlewares + routes)
const express = require('express');
const session = require('express-session');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Parses the JSON sent by the front end (size limit to prevent abuse)
app.use(express.json({ limit: '100kb' }));

// Session management: the session id is stored in a cookie,
// the data itself (userId, role) stays on the server.
app.use(
  session({
    name: 'mobilefrei.sid',
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false, // no session is created until the user signs in
    cookie: {
      httpOnly: true, // not readable from browser JavaScript (XSS protection)
      sameSite: 'lax', // basic CSRF protection
      secure: isProd, // cookie only sent over HTTPS in production
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Every API route is prefixed with /api
app.use('/api', routes);

// Unknown route
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found.' }));

// Centralised error handling (always last)
app.use(errorHandler);

module.exports = app;
