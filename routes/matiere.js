const express = require('express');
const router = express.Router();
const Matiere = require('../models/matiere');

// Liste des matières
router.get('/', async (req, res) => {
  res.render('matiere/liste'); // le fetch côté client appellera /api/matiere
});

// Ajouter une matiere
router.get('/ajouter', async (req, res) => {
  const matiere = await Matiere.findAll();
  res.render('matiere/ajouter', { matiere });
});

// Modifier une matiere
router.get('/modifier/:id', async (req, res) => {
  const formation = await Formation.findByPk(req.params.id);  ///////////////// NE PEUT PAS ETRE CHANGE///////////////////////////////////
  if (!matiere) return res.status(404).send('Matière non trouvée');

  const matiere = await Matiere.findAll();

  res.render('matiere/modifier', { matiere, matiere });
});


module.exports = router;
