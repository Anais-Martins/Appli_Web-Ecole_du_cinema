// routes/apiSalle.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Salle = require('../models/salle');
// const Cours = require('../models/cours');

// ---------------------
// Liste paginée avec recherche
// ---------------------
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    // Recherche sur le nom du cours
    const whereCondition = search
      ? {
          [Op.or]: [
            { '$Cours.nom$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Salle.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['id_salle', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      salle: rows,
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
// GET: Une salle par ID
// ---------------------
router.get('/:id', async (req, res) => {
  try {
    const salle = await Salle.findByPk(req.params.id);
    if (!salle) return res.status(404).json({ message: 'Salle non trouvée' });
    res.json(salle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// POST: Ajouter une salle
// ---------------------
router.post('/', async (req, res) => {
  try {
    const { id_salle, numero } = req.body;

    const nouvelleSalle = await Salle.create({ id_salle, numero });
    res.status(201).json(nouvelleSalle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// PUT: Modifier une salle
// ---------------------
router.put('/:id', async (req, res) => {
  try {
    const { id_cours, numero } = req.body;

    const existingSalle = await Salle.findByPk(req.params.id);
    if (!existingSalle) return res.status(404).json({ message: 'Salle non trouvée' });

    if (id_cours) {
      const cours = await Cours.findByPk(id_cours);
      if (!cours) return res.status(400).json({ message: 'Cours non trouvée' });
    }

    await existingSalle.update({ id_cours, numero });
    res.json(existingSalle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// DELETE: Supprimer une salle
// ---------------------
router.delete('/:id', async (req, res) => {
  try {
    const salle = await Salle.findByPk(req.params.id);
    if (!salle) return res.status(404).json({ message: 'Salle non trouvée' });

    await salle.destroy();
    res.json({ message: 'Salle supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
