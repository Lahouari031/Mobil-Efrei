// Videos controller: students read the TikTok videos of a destination, admins add / delete them
const { Video, Destination } = require('../models');
const { validateVideo, TIKTOK_REGEX } = require('../validators');
const { getTikTokPreview } = require('../services/tiktokPreview');

// The TikTok embed player only needs the numeric id of the video
const withVideoId = (video) => ({ ...video.toJSON(), videoId: video.url.match(TIKTOK_REGEX)?.[2] ?? null });

// GET /api/destinations/:destinationId/videos
// Each video comes with its preview (thumbnail, caption, author), fetched in parallel from TikTok
exports.listForDestination = async (req, res) => {
  const videos = await Video.findAll({
    where: { destinationId: Number(req.params.destinationId) || 0 },
    order: [['createdAt', 'DESC']],
  });
  const previews = await Promise.all(videos.map((v) => getTikTokPreview(v.url)));
  res.json(videos.map((v, i) => ({ ...withVideoId(v), preview: previews[i] })));
};

// GET /api/videos  (admin)
exports.listAll = async (req, res) => {
  const videos = await Video.findAll({
    include: [{ model: Destination, as: 'destination', attributes: ['id', 'city', 'flag'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(videos.map(withVideoId));
};

// POST /api/videos  (admin)
exports.create = async (req, res) => {
  const errors = validateVideo(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });
  const destination = await Destination.findByPk(req.body.destinationId);
  if (!destination) return res.status(400).json({ error: 'This destination does not exist.' });

  const video = await Video.create({
    destinationId: destination.id,
    title: req.body.title?.trim() || null,
    // Keep the clean link only (TikTok adds tracking parameters after "?")
    url: req.body.url.trim().split('?')[0],
  });
  res.status(201).json(withVideoId(video));
};

// DELETE /api/videos/:id  (admin)
exports.remove = async (req, res) => {
  const deleted = await Video.destroy({ where: { id: req.params.id } });
  if (!deleted) return res.status(404).json({ error: 'Video not found.' });
  res.status(204).end();
};
