// routes/apiNotes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Note = require('../models/note');
const Apprenant = require('../models/apprenant');
const Matiere = require('../models/matiere');

// ---------------------
// Liste paginée avec recherche
// ---------------------
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    // Recherche sur le nom de l'apprenant ou de la matière
    const whereCondition = search
      ? {
          [Op.or]: [
            { '$Apprenant.nom$': { [Op.like]: `%${search}%` } },
            { '$Apprenant.prenom$': { [Op.like]: `%${search}%` } },
            { '$Matiere.nom$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Note.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Apprenant,
          as: 'apprenant',
          attributes: ['id_apprenant', 'nom', 'prenom'],
        },
        {
          model: Matiere,
          as: 'matiere',
          attributes: ['id_matiere', 'nom'],
        },
      ],
      limit,
      offset,
      order: [['id_note', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      note: rows,
      pagination: {
        page,
        totalPages,
        totalItems: count,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// GET: Une note par ID
// ---------------------
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id, {
      include: [
        { model: Apprenant, as: 'apprenant', attributes: ['id_apprenant', 'nom', 'prenom'] },
        { model: Matiere, as: 'matiere', attributes: ['id_matiere', 'nom'] },
      ],
    });
    if (!note) return res.status(404).json({ message: 'Note non trouvée' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// POST: Ajouter une note
// ---------------------
router.post('/', async (req, res) => {
  try {
    const { id_apprenant, id_matiere, note, date, type_eval} = req.body;

    // Vérification existence apprenant et matière
    const apprenant = await Apprenant.findByPk(id_apprenant);
    if (!apprenant) return res.status(400).json({ message: 'Apprenant non trouvé' });

    const matiere = await Matiere.findByPk(id_matiere);
    if (!matiere) return res.status(400).json({ message: 'Matière non trouvée' });

    const nouvelleNote = await Note.create({ id_apprenant, id_matiere, note, date, type_eval });
    res.status(201).json(nouvelleNote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// PUT: Modifier une note
// ---------------------
router.put('/:id', async (req, res) => {
  try {
    const { id_apprenant, id_matiere, note, date, type_eval } = req.body;

    const existingNote = await Note.findByPk(req.params.id);
    if (!existingNote) return res.status(404).json({ message: 'Note non trouvée' });

    if (id_apprenant) {
      const apprenant = await Apprenant.findByPk(id_apprenant);
      if (!apprenant) return res.status(400).json({ message: 'Apprenant non trouvé' });
    }

    if (id_matiere) {
      const matiere = await Matiere.findByPk(id_matiere);
      if (!matiere) return res.status(400).json({ message: 'Matière non trouvée' });
    }

    await existingNote.update({ id_apprenant, id_matiere, note, date, type_eval });
    res.json(existingNote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// DELETE: Supprimer une note
// ---------------------
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note non trouvée' });

    await note.destroy();
    res.json({ message: 'Note supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
