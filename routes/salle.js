const express = require('express');
const router = express.Router();
const Salle = require('../models/salle');
const Cours = require('../models/cours');

// Liste des salles
router.get('/', async (req, res) => {
  res.render('salle/liste'); // le fetch côté client appellera /api/salle
});

// Ajouter une salle
router.get('/ajouter', async (req, res) => {
  const cours = await Cours.findAll();
  res.render('salle/ajouter', { cours });
});

// Modifier une salle
router.get('/modifier/:id', async (req, res) => {
  const salle = await Salle.findByPk(req.params.id);
  if (!salle) return res.status(404).send('Salle non trouvée');

  const cours = await Cours.findAll();

  res.render('salle/modifier', { salle, cours });
});


module.exports = router;
