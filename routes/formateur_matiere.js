const express = require('express');
const router = express.Router();
const Formateur_matiere = require('../models/formateur_matiere');
const Formateur = require('../models/formateur');
const Matiere = require('../models/matiere');

// Liste des formateur_matiere
router.get('/', async (req, res) => {
  res.render('formateur_matiere/liste'); // le fetch côté client appellera /api/formateur_matiere
});

// Ajouter un formateur_matiere
router.get('/ajouter', async (req, res) => {
  const formateur = await Formateur.findAll();
  const matiere = await Matiere.findAll();
  res.render('formateur_matiere/ajouter', { formateur, matiere });
});

// Modifier un formateur_matiere
router.get('/modifier/:id', async (req, res) => {
  const formateur_matiere = await Formateur_matiere.findByPk(req.params.id);
  if (!formateur_matiere) return res.status(404).send('Formateur_matiere non trouvée');

  const formateur = await Formateur.findAll();
  const matiere = await Matiere.findAll();

  res.render('formateur_matiere/modifier', { formateur_matiere, formateur, matiere });
});


module.exports = router;
