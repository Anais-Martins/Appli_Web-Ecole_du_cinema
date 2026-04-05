const express = require('express');
const router = express.Router();
const Presence = require('../models/presence');
const Apprenant = require('../models/apprenant');
const Cours = require('../models/cours');

// Liste des présences
router.get('/', async (req, res) => {
  res.render('presence/liste'); // le fetch côté client appellera /api/presence
});

// Ajouter une présence
router.get('/ajouter', async (req, res) => {
  const apprenant = await Apprenant.findAll();
  const cours = await Cours.findAll();
  res.render('presence/ajouter', { apprenant, cours });
});

// Modifier une présence
router.get('/modifier/:id', async (req, res) => {
  const presence = await Presence.findByPk(req.params.id);
  if (!presence) return res.status(404).send('Présence non trouvée');

  const apprenant = await Apprenant.findAll();
  const cours = await Cours.findAll();

  res.render('presence/modifier', { presence, apprenant, cours });
});


module.exports = router;
