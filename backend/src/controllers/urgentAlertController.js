const { UrgentAlert, Destination } = require('../models');

// Vérifie qu'un identifiant est valide
const validId = (id) =>
  Number.isSafeInteger(Number(id)) && Number(id) > 0;


// 1. Récupérer les alertes actives d'une destination
exports.listForDestination = async (req, res) => {
  const destinationId = req.params.destinationId;

  if (!validId(destinationId)) {
    return res.status(400).json({ error: 'Invalid destination.' });
  }

  const alerts = await UrgentAlert.findAll({
    where: {
      destinationId: Number(destinationId),
      active: true
    },
    order: [['createdAt', 'DESC']]
  });

  res.json(alerts);
};


// 2. Récupérer toutes les alertes pour l'admin
exports.listForAdmin = async (req, res) => {
  const alerts = await UrgentAlert.findAll({
    include: [{ model: Destination, as: 'destination', attributes: ['id', 'city', 'flag'] }],
    order: [['createdAt', 'DESC']]
  });

  res.json(alerts);
};


// 3. Créer une nouvelle alerte
exports.create = async (req, res) => {
  const { destinationId, alertDate } = req.body;

  const title =
    typeof req.body.title === 'string'
      ? req.body.title.trim()
      : '';

  const details =
    typeof req.body.details === 'string'
      ? req.body.details.trim()
      : '';

  // Vérifier que la date est valide
  const parsedDate = new Date(`${alertDate}T00:00:00Z`);

  const validDate =
    typeof alertDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(alertDate) &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === alertDate;

  // Vérifier les informations
  if (
    !validId(destinationId) ||
    !title ||
    title.length > 150 ||
    !details ||
    details.length > 5000 ||
    !validDate
  ) {
    return res.status(400).json({
      error: 'Invalid destination, title, details or date.'
    });
  }

  const destination = await Destination.findByPk(destinationId);

  if (!destination) {
    return res.status(404).json({
      error: 'Destination not found.'
    });
  }

  // Previous alerts are kept: the admin activates / deactivates them from the admin page
  const alert = await UrgentAlert.create({
    destinationId: Number(destinationId),
    title,
    details,
    alertDate,
    active: true,
  });

  res.status(201).json(alert);
};


// 4. Modifier ou désactiver une alerte
exports.update = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid alert.' });
  }

  const alert = await UrgentAlert.findByPk(req.params.id);

  if (!alert) {
    return res.status(404).json({
      error: 'Alert not found.'
    });
  }

  const changes = {};

  if (Object.hasOwn(req.body, 'title')) {
    if (typeof req.body.title !== 'string' ||
        !req.body.title.trim() ||
        req.body.title.trim().length > 150) {
      return res.status(400).json({ error: 'Invalid title.' });
    }
    changes.title = req.body.title.trim();
  }

  if (Object.hasOwn(req.body, 'details')) {
    if (typeof req.body.details !== 'string' ||
        !req.body.details.trim() ||
        req.body.details.trim().length > 5000) {
      return res.status(400).json({ error: 'Invalid details.' });
    }
    changes.details = req.body.details.trim();
  }

  if (Object.hasOwn(req.body, 'active')) {
    if (typeof req.body.active !== 'boolean') {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    changes.active = req.body.active;
  }

  if (!Object.keys(changes).length) {
    return res.status(400).json({ error: 'Nothing to update.' });
  }

  await alert.update(changes);
  res.json(alert);
};