const express = require('express');
const router = express.Router();
const Inscription = require('../models/inscription');
const Apprenant = require('../models/apprenant');
const Formation = require('../models/formation');

// Liste des inscriptions
router.get('/', async (req, res) => {
  res.render('inscription/liste'); // le fetch côté client appellera /api/inscription
});

// Ajouter une inscription
router.get('/ajouter', async (req, res) => {
  const apprenant = await Apprenant.findAll();
  const formation = await Formation.findAll();
  res.render('inscription/ajouter', { apprenant, formation });
});

// Modifier une inscription
router.get('/modifier/:id', async (req, res) => {
  const inscription = await Inscription.findByPk(req.params.id);
  if (!inscription) return res.status(404).send('Inscription non trouvée');

  const apprenant = await Apprenant.findAll();
  const formation = await Formation.findAll();

  res.render('inscription/modifier', { inscription, apprenant, formation });
});


module.exports = router;
