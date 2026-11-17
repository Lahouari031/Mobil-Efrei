// Comments and likes controller
// A signed-in user can: read, post, edit/delete THEIR comments, like other comments.
// The admin can delete any comment (moderation).
const { Comment, Like, User, Destination, sequelize } = require('../models');
const { validateComment } = require('../validators');

// SQL sub-query counting the likes of each comment.
// It contains no user input, so there is no injection risk.
const LIKE_COUNT = sequelize.literal('(SELECT COUNT(*) FROM likes AS l WHERE l.comment_id = `Comment`.`id`)');

// GET /api/destinations/:destinationId/comments  (Read)
// The most liked comments come first, then the most recent ones
exports.listForDestination = async (req, res) => {
  const comments = await Comment.findAll({
    where: { destinationId: req.params.destinationId },
    attributes: { include: [[LIKE_COUNT, 'likeCount']] },
    include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
    order: [[sequelize.literal('likeCount'), 'DESC'], ['createdAt', 'DESC']],
  });

  // One single query to know which comments the current user has liked
  const ids = comments.map((c) => c.id);
  const myLikes = ids.length
    ? await Like.findAll({ where: { userId: req.session.userId, commentId: ids }, attributes: ['commentId'] })
    : [];
  const likedSet = new Set(myLikes.map((l) => l.commentId));

  res.json(
    comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      author: c.author,
      likeCount: Number(c.get('likeCount')),
      likedByMe: likedSet.has(c.id),
      isMine: c.userId === req.session.userId,
    }))
  );
};

// POST /api/destinations/:destinationId/comments  (Create)
exports.create = async (req, res) => {
  const errors = validateComment(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const destination = await Destination.findByPk(req.params.destinationId);
  if (!destination) return res.status(404).json({ error: 'Destination not found.' });

  const comment = await Comment.create({
    content: req.body.content.trim(),
    destinationId: destination.id,
    userId: req.session.userId, // the author comes from the session, never from the body
  });
  res.status(201).json(comment);
};

// PUT /api/comments/:id  (Update - author only)
exports.update = async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found.' });
  if (comment.userId !== req.session.userId) {
    return res.status(403).json({ error: 'You can only edit your own comments.' });
  }
  const errors = validateComment(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  await comment.update({ content: req.body.content.trim() });
  res.json(comment);
};

// DELETE /api/comments/:id  (Delete - author or admin)
exports.remove = async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found.' });
  if (comment.userId !== req.session.userId && req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Action not allowed.' });
  }
  await comment.destroy();
  res.status(204).end();
};

// POST /api/comments/:id/like  (Create a like)
exports.like = async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found.' });
  // findOrCreate: if the like already exists, it is not duplicated
  await Like.findOrCreate({ where: { userId: req.session.userId, commentId: comment.id } });
  const likeCount = await Like.count({ where: { commentId: comment.id } });
  res.json({ likeCount, likedByMe: true });
};

// DELETE /api/comments/:id/like  (Delete a like)
exports.unlike = async (req, res) => {
  await Like.destroy({ where: { userId: req.session.userId, commentId: req.params.id } });
  const likeCount = await Like.count({ where: { commentId: req.params.id } });
  res.json({ likeCount, likedByMe: false });
};
