// routes/apiPresence.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Presence = require('../models/presence');
const Apprenant = require('../models/apprenant');
const Cours = require('../models/cours');

// ---------------------
// Liste paginée avec recherche
// ---------------------
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    // Recherche sur le nom de l'apprenant ou du cours
    const whereCondition = search
      ? {
          [Op.or]: [
            { '$Apprenant.nom$': { [Op.like]: `%${search}%` } },
            { '$Apprenant.prenom$': { [Op.like]: `%${search}%` } },
            { '$Cours.date$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Presence.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Apprenant,
          as: 'apprenant',
          attributes: ['id_apprenant', 'nom', 'prenom'],
        },
        {
          model: Cours,
          as: 'cours',
          attributes: ['id_cours', 'date'],
        },
      ],
      limit,
      offset,
      order: [['id_presence', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      presence: rows,
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
// GET: Une présence par ID
// ---------------------
router.get('/:id', async (req, res) => {
  try {
    const presence = await Presence.findByPk(req.params.id, {
      include: [
        { model: Apprenant, as: 'apprenant', attributes: ['id_apprenant', 'nom', 'prenom'] },
        { model: Cours, as: 'cours', attributes: ['id_cours', 'date'] },
      ],
    });
    if (!presence) return res.status(404).json({ message: 'Présence non trouvée' });
    res.json(presence);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// POST: Ajouter une présence
// ---------------------
router.post('/', async (req, res) => {
  try {
    const { id_apprenant, id_cours, presence } = req.body;

    // Vérification existence apprenant et cours
    const apprenant = await Apprenant.findByPk(id_apprenant);
    if (!apprenant) return res.status(400).json({ message: 'Apprenant non trouvé' });

    const cours = await Cours.findByPk(id_cours);
    if (!cours) return res.status(400).json({ message: 'Cours non trouvé' });

    const nouvellePresence = await Presence.create({ id_apprenant, id_cours, presence });
    res.status(201).json(nouvellePresence);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// PUT: Modifier une présence
// ---------------------
router.put('/:id', async (req, res) => {
  try {
    const { id_apprenant, id_cours, presence } = req.body;

    const existingPresence = await Presence.findByPk(req.params.id);
    if (!existingPresence) return res.status(404).json({ message: 'Présence non trouvée' });

    if (id_apprenant) {
      const apprenant = await Apprenant.findByPk(id_apprenant);
      if (!apprenant) return res.status(400).json({ message: 'Apprenant non trouvé' });
    }

    if (id_cours) {
      const cours = await Cours.findByPk(id_cours);
      if (!cours) return res.status(400).json({ message: 'Cours non trouvée' });
    }

    await existingPresence.update({ id_apprenant, id_cours, presence });
    res.json(existingPresence);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// DELETE: Supprimer une présence
// ---------------------
router.delete('/:id', async (req, res) => {
  try {
    const presence = await Presence.findByPk(req.params.id);
    if (!presence) return res.status(404).json({ message: 'Présence non trouvée' });

    await presence.destroy();
    res.json({ message: 'Présence supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
