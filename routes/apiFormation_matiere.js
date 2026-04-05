// routes/apiFormateur_matiere.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Formation_matiere = require('../models/formation_matiere');
const Formation = require('../models/formation');
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

    // Recherche sur le nom du formation ou de la matiere
    const whereCondition = search
      ? {
          [Op.or]: [
            { '$Formation.nom$': { [Op.like]: `%${search}%` } },
            { '$Formation.description$': { [Op.like]: `%${search}%` } },
            { '$Matiere.nom$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Formation_matiere.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Formation,
          as: 'formation',
          attributes: ['id_formation', 'nom', 'description'],
        },
        {
          model: Matiere,
          as: 'matiere',
          attributes: ['id_matiere', 'nom'],
        },
      ],
      limit,
      offset,
      order: [['id_formationmatiere', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      formation_matiere: rows,
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
// GET: Formation_matiere par ID
// ---------------------
router.get('/:id', async (req, res) => {
  try {
    const formation_matiere = await Formation_matiere.findByPk(req.params.id, {
      include: [
        { model: Formation, as: 'formation', attributes: ['id_formation', 'nom', 'description'] },
        { model: Matiere, as: 'matiere', attributes: ['id_matiere', 'nom'] },
      ],
    });
    if (!formation_matiere) return res.status(404).json({ message: 'Formation_matiere non trouvé' });
    res.json(formation_matiere);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// POST: Ajouter un Formation_matiere
// ---------------------
router.post('/', async (req, res) => {
  try {
    const { id_formation, id_matiere, id_formationmatiere } = req.body;

    // Vérification existence formation et matière
    const formation = await Formation.findByPk(id_formation);
    if (!formation) return res.status(400).json({ message: 'Formation non trouvé' });

    const matiere = await Matiere.findByPk(id_matiere);
    if (!matiere) return res.status(400).json({ message: 'Matiere non trouvée' });

    const nouveauFormation_matiere = await Formation_matiere.create({ id_formation, id_matiere, id_formationmatiere });
    res.status(201).json(nouveauFormation_matiere);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// PUT: Modifier un Formation_matiere
// ---------------------
router.put('/:id', async (req, res) => {
  try {
    const { id_formation, id_matiere, id_formationmatiere } = req.body;

    const existingFormation_matiere = await Formation_matiere.findByPk(req.params.id);
    if (!existingFormation_matiere) return res.status(404).json({ message: 'Formation_matiere non trouvée' });

    if (id_formation) {
      const formation = await Formation.findByPk(id_formation);
      if (!formation) return res.status(400).json({ message: 'Formation non trouvé' });
    }

    if (id_matiere) {
      const matiere = await Matiere.findByPk(id_matiere);
      if (!matiere) return res.status(400).json({ message: 'Matiere non trouvée' });
    }

    await existingFormation_matiere.update({ id_formation, id_matiere, id_formationmatiere });
    res.json(existingFormation_matiere);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// DELETE: Supprimer un Formation_matiere
// ---------------------
router.delete('/:id', async (req, res) => {
  try {
    const formation_matiere = await Formation_matiere.findByPk(req.params.id);
    if (!formation_matiere) return res.status(404).json({ message: 'Formation_matiere non trouvée' });

    await formation_matiere.destroy();
    res.json({ message: 'Formation_matiere supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
