const path = require('node:path');
const fs = require('node:fs');

const documentsFolder = path.join(
  __dirname,
  '../private-documents'
);

const pdfPath = path.join(
  documentsFolder,
  'efrei-guide.pdf'
);

const pptxPath = path.join(
  documentsFolder,
  'efrei-guide.pptx'
);

// Vérifier si l'étudiant a déjà débloqué le fichier
exports.status = (req, res) => {
  res.json({
    unlocked: req.session.efreiDocumentUnlocked === true
  });
};

// Vérifier le code saisi
exports.unlock = (req, res) => {
  const expectedCode = process.env.EFREI_DOCUMENT_CODE;
  const code = req.body?.code;

  if (!expectedCode) {
    return res.status(500).json({
      error: 'Document access is not configured.'
    });
  }

  if (req.session.documentAttempts >= 5) {
    return res.status(429).json({
      error: 'Too many attempts. Please sign in again later.'
    });
  }

  if (
    typeof code !== 'string' ||
    code !== expectedCode
  ) {
    req.session.documentAttempts =
      (req.session.documentAttempts || 0) + 1;

    return res.status(403).json({
      error: 'Incorrect access code.'
    });
  }

  req.session.efreiDocumentUnlocked = true;
  req.session.documentAttempts = 0;

  res.json({
    unlocked: true
  });
};

// Vérifier que le document est débloqué
function checkAccess(req, res) {
  if (req.session.efreiDocumentUnlocked !== true) {
    res.status(403).json({
      error: 'Document is locked.'
    });
    return false;
  }

  return true;
}

// Lire les diapositives au format PDF
exports.preview = (req, res) => {
  if (!checkAccess(req, res)) return;

  if (!fs.existsSync(pdfPath)) {
    return res.status(404).json({
      error: 'PDF document not found.'
    });
  }

  res.set('Cache-Control', 'private, no-store');
  res.type('pdf');
  res.sendFile(pdfPath);
};

// Télécharger le véritable PowerPoint
exports.download = (req, res) => {
  if (!checkAccess(req, res)) return;

  if (!fs.existsSync(pptxPath)) {
    return res.status(404).json({
      error: 'PowerPoint document not found.'
    });
  }

  res.set('Cache-Control', 'private, no-store');
  res.download(pptxPath, 'EFREI-Student-Guide.pptx');
};