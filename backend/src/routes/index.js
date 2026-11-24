// API routes: each URL is linked to a controller, with the required authorization middlewares
const express = require('express');
const { asyncHandler: h } = require('../middlewares/errorHandler');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

const auth = require('../controllers/authController');
const destinations = require('../controllers/destinationController');
const tips = require('../controllers/tipController');
const comments = require('../controllers/commentController');
const urgentAlerts = require('../controllers/urgentAlertController');
const videos = require('../controllers/videoController');

const router = express.Router();

// ---------- Authentication (public) ----------
router.post('/auth/register', h(auth.register));
router.post('/auth/verify-email', h(auth.verifyEmail));
router.post('/auth/login', h(auth.login));
router.post('/auth/logout', auth.logout);
router.get('/auth/me', h(auth.me));

// ---------- Destinations ----------
router.get('/destinations', requireAuth, h(destinations.list));
router.get('/destinations/:slug', requireAuth, h(destinations.getBySlug));
router.post('/destinations', requireAdmin, h(destinations.create));
router.put('/destinations/:id', requireAdmin, h(destinations.update));
router.delete('/destinations/:id', requireAdmin, h(destinations.remove));

// ---------- Tips ----------
router.get('/tips', requireAuth, h(tips.list));
router.post('/tips', requireAdmin, h(tips.create));
router.put('/tips/:id', requireAdmin, h(tips.update));
router.delete('/tips/:id', requireAdmin, h(tips.remove));

// ---------- Comments & likes ----------
router.get('/destinations/:destinationId/comments', requireAuth, h(comments.listForDestination));
router.post('/destinations/:destinationId/comments', requireAuth, h(comments.create));
router.put('/comments/:id', requireAuth, h(comments.update));
router.delete('/comments/:id', requireAuth, h(comments.remove));
router.post('/comments/:id/like', requireAuth, h(comments.like));
router.delete('/comments/:id/like', requireAuth, h(comments.unlike));

// ---------- Urgent Alerts ----------

// Students: read active alerts
router.get(
  '/destinations/:destinationId/urgent-alerts',
  requireAuth,
  h(urgentAlerts.listForDestination)
);

// Admin: read all alerts
router.get(
  '/urgent-alerts',
  requireAdmin,
  h(urgentAlerts.listForAdmin)
);

// Admin: create an alert
router.post(
  '/urgent-alerts',
  requireAdmin,
  h(urgentAlerts.create)
);

// Admin: update or deactivate an alert
router.put(
  '/urgent-alerts/:id',
  requireAdmin,
  h(urgentAlerts.update)
);

// ---------- TikTok videos ----------
router.get('/destinations/:destinationId/videos', requireAuth, h(videos.listForDestination));
router.get('/videos', requireAdmin, h(videos.listAll));
router.post('/videos', requireAdmin, h(videos.create));
router.delete('/videos/:id', requireAdmin, h(videos.remove));

module.exports = router;
