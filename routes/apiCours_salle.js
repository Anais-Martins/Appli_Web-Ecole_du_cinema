// routes/apiCours_salle.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Cours_salle = require('../models/cours_salle');
const Cours = require('../models/cours');
const Salle = require('../models/salle');

// ---------------------
// Liste paginée avec recherche
// ---------------------
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    // Recherche sur le nom de le cours ou de la salle
    const whereCondition = search
      ? {
          [Op.or]: [
            { '$Cours.date$': { [Op.like]: `%${search}%` } },
            { '$Cours.horaire_debut$': { [Op.like]: `%${search}%` } },
            { '$Cours.horaire_fin$': { [Op.like]: `%${search}%` } },
            { '$Salle.numero$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Cours_salle.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Cours,
          as: 'cours',
          attributes: ['id_cours', 'date', 'horaire_debut', 'horaire_fin'],
        },
        {
          model: Salle,
          as: 'salle',
          attributes: ['id_salle', 'numero'],
        },
      ],
      limit,
      offset,
      order: [['id_courssalle', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      cours_salle: rows,
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
// GET: Cours_salle par ID
// ---------------------
router.get('/:id', async (req, res) => {
  try {
    const cours_salle = await Cours_salle.findByPk(req.params.id, {
      include: [
        { model: Cours, as: 'cours', attributes: ['id_cours', 'date', 'horaire_debut', 'horaire_fin'] },
        { model: Salle, as: 'salle', attributes: ['id_salle', 'numero'] },
      ],
    });
    if (!cours_salle) return res.status(404).json({ message: 'Cours_salle non trouvé' });
    res.json(cours_salle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// POST: Ajouter un Cours_salle
// ---------------------
router.post('/', async (req, res) => {
  try {
    const { id_cours, id_salle, id_courssalle } = req.body;

    // Vérification existence cours et salle
    const cours = await Cours.findByPk(id_cours);
    if (!cours) return res.status(400).json({ message: 'Cours non trouvé' });

    const salle = await Salle.findByPk(id_salle);
    if (!salle) return res.status(400).json({ message: 'Salle non trouvée' });

    const nouveauCours_salle = await Cours_salle.create({ id_cours, id_salle, id_courssalle });
    res.status(201).json(nouveauCours_salle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// PUT: Modifier un Cours_salle
// ---------------------
router.put('/:id', async (req, res) => {
  try {
    const { id_cours, id_salle, id_courssalle } = req.body;

    const existingCours_salle = await Cours_salle.findByPk(req.params.id);
    if (!existingCours_salle) return res.status(404).json({ message: 'Cours_salle non trouvée' });

    if (id_cours) {
      const cours = await Cours.findByPk(id_cours);
      if (!cours) return res.status(400).json({ message: 'Cours non trouvé' });
    }

    if (id_salle) {
      const salle = await Salle.findByPk(id_salle);
      if (!salle) return res.status(400).json({ message: 'Salle non trouvée' });
    }

    await existingCours_salle.update({ id_cours, id_salle, id_courssalle });
    res.json(existingCours_salle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// DELETE: Supprimer un Cours_salle
// ---------------------
router.delete('/:id', async (req, res) => {
  try {
    const cours_salle = await Cours_salle.findByPk(req.params.id);
    if (!cours_salle) return res.status(404).json({ message: 'Cours_salle non trouvée' });

    await cours_salle.destroy();
    res.json({ message: 'Cours_salle supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
