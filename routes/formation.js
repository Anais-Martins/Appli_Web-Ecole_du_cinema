const express = require('express');
const router = express.Router();
const Formation = require('../models/formation');
const Matiere = require('../models/matiere');

// Liste des formations
router.get('/', async (req, res) => {
  res.render('formation/liste'); // le fetch côté client appellera /api/formation
});

// Ajouter une formation
router.get('/ajouter', async (req, res) => {
  const matiere = await Matiere.findAll();
  res.render('formation/ajouter', { matiere });
});

// Modifier une formation
router.get('/modifier/:id', async (req, res) => {
  const formation = await Formation.findByPk(req.params.id);
  if (!formation) return res.status(404).send('Formation non trouvée');

  const matiere = await Matiere.findAll();

  res.render('formation/modifier', { formation, matiere });
});

// Page formations (navbar)
router.get('/formations', (req, res) => {
  res.render('formations');
});

module.exports = router;
