// routes/apiNotes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
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

    // Recherche sur le nom de la matière
    const whereCondition = search
      ? {
          [Op.or]: [
            { '$Matiere.nom$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Matiere.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['id_matiere', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      matiere: rows,
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
// GET: Une matiere par ID
// ---------------------
router.get('/:id', async (req, res) => {
  try {
    const matiere = await Matiere.findByPk(req.params.id);
    if (!matiere) return res.status(404).json({ message: 'Matière non trouvée' });
    res.json(matiere);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// POST: Ajouter une matière
// ---------------------
router.post('/', async (req, res) => {
  try {
    const { id_matiere, nom } = req.body;

    const nouvelleMatiere = await Matiere.create({ id_matiere, nom });
    res.status(201).json(nouvelleMatiere);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// PUT: Modifier une matiere
// ---------------------
router.put('/:id', async (req, res) => {
  try {
    const { id_matiere, nom } = req.body;

    const existingMatiere = await Matiere.findByPk(req.params.id);
    if (!existingMatiere) return res.status(404).json({ message: 'Matière non trouvée' });

    if (id_matiere) {
      const matiere = await Matiere.findByPk(id_matiere);
      if (!matiere) return res.status(400).json({ message: 'Matière non trouvée' });
    }

    await existingMatiere.update({ id_matiere, nom });
    res.json(existingMatiere);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// DELETE: Supprimer une matière
// ---------------------
router.delete('/:id', async (req, res) => {
  try {
    const matiere = await Matiere.findByPk(req.params.id);
    if (!matiere) return res.status(404).json({ message: 'Matière non trouvée' });

    await matiere.destroy();
    res.json({ message: 'Matière supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
