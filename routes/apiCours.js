
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Cours = require('../models/cours');
const Matiere = require('../models/matiere');

// ---------------------
// Liste paginée avec recherche sur nom du cours ou nom de la matiere
// ---------------------
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';

    const offset = (page - 1) * limit;

    // Condition de recherche
    const whereCondition = search
      ? {
          [Op.or]: [
            { nom: { [Op.like]: `%${search}%` } }
          ]
        }
      : {};

    const { count, rows } = await Cours.findAndCountAll({
      where: whereCondition,
      include: [{
        model: Matiere,
        as: 'matiere',
        attributes: ['id_matiere', 'nom'],
        where: search ? {
          [Op.or]: [
            { nom: { [Op.like]: `%${search}%` } }
          ]
        } : undefined
      }],
      limit,
      offset,
      order: [['id_cours', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      cours: rows,
      pagination: {
        page,
        totalPages,
        totalItems: count
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET un cours par ID
router.get('/:id_cours', async (req, res) => {
  try {
    const cours = await Cours.findByPk(req.params.id_cours, {
      include: [{ model: Matiere, as: 'matiere', attributes: ['id_matiere', 'nom'] }]
    });
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });
    res.json(cours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST ajouter un cours
router.post('/', async (req, res) => {
  try {
    const { date, horaire_debut, horaire_fin, id_matiere } = req.body;
    const matiere = await Matiere.findByPk(id_matiere);
    if (!matiere) return res.status(400).json({ message: 'Matiere non trouvé' });
    const cours = await Cours.create({ date, horaire_debut, horaire_fin, id_matiere });
    res.status(201).json(cours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT modifier un cours
router.put('/:id_cours', async (req, res) => {
  try {
    const { date, horaire_debut, horaire_fin, id_matiere } = req.body;
    const cours = await Cours.findByPk(req.params.id_cours);
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });

    if (id_matiere) {
      const matiere = await Matiere.findByPk(id_matiere);
      if (!matiere) return res.status(400).json({ message: 'Matiere non trouvé' });
    }

    await cours.update({ date, horaire_debut, horaire_fin, id_matiere });
    res.json(cours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE supprimer un cours
router.delete('/:id_cours', async (req, res) => {
  try {
    const cours = await Cours.findByPk(req.params.id_cours);
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });

    await cours.destroy();
    res.json({ message: 'Cours supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
