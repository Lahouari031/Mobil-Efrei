// Destinations controller (full CRUD; create / update / delete are admin-only)
const { Destination, Tip } = require('../models');
const { validateDestination } = require('../validators');

// Keeps only the allowed fields (prevents a client from changing the id or other columns)
const pick = (body) => ({
  slug: body.slug?.trim(),
  country: body.country?.trim(),
  city: body.city?.trim(),
  university: body.university?.trim() || null,
  flag: body.flag?.trim() || null,
  summary: body.summary?.trim(),
  language: body.language?.trim() || null,
  currency: body.currency?.trim() || null,
  monthlyBudget: body.monthlyBudget === '' || body.monthlyBudget == null ? null : Number(body.monthlyBudget),
  imageUrl: body.imageUrl?.trim() || null,
});

// GET /api/destinations  (Read - list)
exports.list = async (req, res) => {
  const destinations = await Destination.findAll({ order: [['country', 'ASC']] });
  res.json(destinations);
};

// GET /api/destinations/:slug  (Read - details with tips)
exports.getBySlug = async (req, res) => {
  const destination = await Destination.findOne({
    where: { slug: req.params.slug },
    include: [{ model: Tip, as: 'tips' }],
    order: [[{ model: Tip, as: 'tips' }, 'category', 'ASC'], [{ model: Tip, as: 'tips' }, 'id', 'ASC']],
  });
  if (!destination) return res.status(404).json({ error: 'Destination not found.' });
  res.json(destination);
};

// POST /api/destinations  (Create - admin)
exports.create = async (req, res) => {
  const errors = validateDestination(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });
  const destination = await Destination.create(pick(req.body));
  res.status(201).json(destination);
};

// PUT /api/destinations/:id  (Update - admin)
exports.update = async (req, res) => {
  const destination = await Destination.findByPk(req.params.id);
  if (!destination) return res.status(404).json({ error: 'Destination not found.' });
  const errors = validateDestination(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });
  await destination.update(pick(req.body));
  res.json(destination);
};

// DELETE /api/destinations/:id  (Delete - admin)
exports.remove = async (req, res) => {
  const deleted = await Destination.destroy({ where: { id: req.params.id } });
  if (!deleted) return res.status(404).json({ error: 'Destination not found.' });
  res.status(204).end();
};
