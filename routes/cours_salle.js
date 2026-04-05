const express = require('express');
const router = express.Router();
const Cours_salle = require('../models/cours_salle');
const Cours = require('../models/cours');
const Salle = require('../models/salle');

// Liste des cours_salle
router.get('/', async (req, res) => {
  res.render('cours_salle/liste'); // le fetch côté client appellera /api/cours_salle
});

// Ajouter un cours_salle
router.get('/ajouter', async (req, res) => {
  const cours = await Cours.findAll();
  const salle = await Salle.findAll();
  res.render('cours_salle/ajouter', { cours, salle });
});

// Modifier un cours_salle
router.get('/modifier/:id', async (req, res) => {
  const cours_salle = await Cours_salle.findByPk(req.params.id);
  if (!cours_salle) return res.status(404).send('Cours_salle non trouvée');

  const cours = await Cours.findAll();
  const salle = await Salle.findAll();

  res.render('cours_salle/modifier', { cours_salle, cours, salle });
});


module.exports = router;
