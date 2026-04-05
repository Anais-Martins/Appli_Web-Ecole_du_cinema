const express = require('express');
const router = express.Router();
const Formation_matiere = require('../models/formation_matiere');
const Formation = require('../models/formation');
const Matiere = require('../models/matiere');

// Liste des formation_matiere
router.get('/', async (req, res) => {
  res.render('formation_matiere/liste'); // le fetch côté client appellera /api/formation_matiere
});

// Ajouter un formation_matiere
router.get('/ajouter', async (req, res) => {
  const formation = await Formation.findAll();
  const matiere = await Matiere.findAll();
  res.render('formation_matiere/ajouter', { formation, matiere });
});

// Modifier un formation_matiere
router.get('/modifier/:id', async (req, res) => {
  const formation_matiere = await Formation_matiere.findByPk(req.params.id);
  if (!formation_matiere) return res.status(404).send('Formation_matiere non trouvée');

  const formation = await Formation.findAll();
  const matiere = await Matiere.findAll();

  res.render('formation_matiere/modifier', { formation_matiere, formation, matiere });
});


module.exports = router;
