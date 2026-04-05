const express = require('express');
const router = express.Router();
const Note = require('../models/note');
const Apprenant = require('../models/apprenant');
const Matiere = require('../models/matiere');

// Liste des notes
router.get('/', async (req, res) => {
  res.render('note/liste'); // le fetch côté client appellera /api/notes
});

// Ajouter une note
router.get('/ajouter', async (req, res) => {
  const apprenant = await Apprenant.findAll();
  const matiere = await Matiere.findAll();
  res.render('note/ajouter', { apprenant, matiere });
});

// Modifier une note
router.get('/modifier/:id', async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  if (!note) return res.status(404).send('Note non trouvée');

  const apprenant = await Apprenant.findAll();
  const matiere = await Matiere.findAll();

  res.render('note/modifier', { note, apprenant, matiere });
});


module.exports = router;
