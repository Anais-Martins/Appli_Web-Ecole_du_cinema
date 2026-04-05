const express = require('express');
const router = express.Router();
const Avis = require('../models/avis');
const Apprenant = require('../models/apprenant');
const Formation = require('../models/formation');

// Liste des avis
router.get('/', async (req, res) => {
  res.render('avis/liste'); // le fetch côté client appellera /api/avis
});

// Ajouter un avis
router.get('/ajouter', async (req, res) => {
  const apprenant = await Apprenant.findAll();
  const formation = await Formation.findAll();
  res.render('avis/ajouter', { apprenant, formation });
});

// Modifier un avis
router.get('/modifier/:id', async (req, res) => {
  const avis = await Avis.findByPk(req.params.id);
  if (!avis) return res.status(404).send('Avis non trouvé');

  const apprenant = await Apprenant.findAll();
  const formation = await Formation.findAll();

  res.render('avis/modifier', { avis, apprenant, formation });
});


module.exports = router;
