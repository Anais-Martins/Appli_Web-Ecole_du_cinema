
// routes/apiContacts.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const Contact = require('../models/contact');

// === Dossier uploads ===
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// === Multer configuration ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ===================== API ROUTES =====================

// GET /api/contacts?page=1&limit=5&search=
router.get('/', async (req, res) => {
  try {
    let { page = 1, limit = 5, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const where = search
      ? { nom: { [Op.like]: `%${search}%` } }
      : {};

    const { count, rows } = await Contact.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'ASC']]
    });

    res.json({
      contacts: rows,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/contacts/:id
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact non trouvé' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/contacts
router.post('/', upload.fields([{ name: 'photo' }, { name: 'fichier' }]), async (req, res) => {
  try {
    const { nom, email, telephone } = req.body;
    if (!nom) return res.status(400).json({ message: 'Le nom est obligatoire' });

    const photo = req.files?.photo ? req.files.photo[0].filename : null;
    const fichier = req.files?.fichier ? req.files.fichier[0].filename : null;

    const contact = await Contact.create({ nom, email, telephone, photo, fichier });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/contacts/:id
router.put('/:id', upload.fields([{ name: 'photo' }, { name: 'fichier' }]), async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact non trouvé' });

    const { nom, email, telephone } = req.body;
    const photo = req.files?.photo ? req.files.photo[0].filename : contact.photo;
    const fichier = req.files?.fichier ? req.files.fichier[0].filename : contact.fichier;

    await contact.update({ nom, email, telephone, photo, fichier });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact non trouvé' });

    // Optionnel : supprimer les fichiers existants
    if (contact.photo) fs.unlink(path.join(uploadDir, contact.photo), () => {});
    if (contact.fichier) fs.unlink(path.join(uploadDir, contact.fichier), () => {});

    await contact.destroy();
    res.json({ message: 'Contact supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
