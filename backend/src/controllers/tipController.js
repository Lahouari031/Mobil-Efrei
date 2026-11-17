// Tips controller: full CRUD, write operations are admin-only
const { Tip, Destination } = require('../models');
const { validateTip } = require('../validators');

const pick = (body) => ({
  destinationId: Number(body.destinationId),
  category: body.category,
  title: body.title.trim(),
  content: body.content.trim(),
  link: body.link?.trim() || null,
});

// GET /api/tips?destinationId=1  (Read)
exports.list = async (req, res) => {
  const where = {};
  if (req.query.destinationId) where.destinationId = Number(req.query.destinationId);
  const tips = await Tip.findAll({
    where,
    include: [{ model: Destination, as: 'destination', attributes: ['id', 'city', 'flag'] }],
    order: [['destinationId', 'ASC'], ['category', 'ASC'], ['id', 'ASC']],
  });
  res.json(tips);
};

// POST /api/tips  (Create)
exports.create = async (req, res) => {
  const errors = validateTip(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });
  const destination = await Destination.findByPk(req.body.destinationId);
  if (!destination) return res.status(400).json({ error: 'This destination does not exist.' });
  const tip = await Tip.create(pick(req.body));
  res.status(201).json(tip);
};

// PUT /api/tips/:id  (Update)
exports.update = async (req, res) => {
  const tip = await Tip.findByPk(req.params.id);
  if (!tip) return res.status(404).json({ error: 'Tip not found.' });
  const errors = validateTip(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });
  await tip.update(pick(req.body));
  res.json(tip);
};

// DELETE /api/tips/:id  (Delete)
exports.remove = async (req, res) => {
  const deleted = await Tip.destroy({ where: { id: req.params.id } });
  if (!deleted) return res.status(404).json({ error: 'Tip not found.' });
  res.status(204).end();
};
