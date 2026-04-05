// routes/apiInscription.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Inscription = require('../models/inscription');
const Apprenant = require('../models/apprenant');
const Formation = require('../models/formation');

// ---------------------
// Liste paginée avec recherche
// ---------------------
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    // Recherche sur le nom de l'apprenant ou de la formation
    const whereCondition = search
      ? {
          [Op.or]: [
            { '$Apprenant.nom$': { [Op.like]: `%${search}%` } },
            { '$Apprenant.prenom$': { [Op.like]: `%${search}%` } },
            { '$Formation.nom$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Inscription.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Apprenant,
          as: 'apprenant',
          attributes: ['id_apprenant', 'nom', 'prenom'],
        },
        {
          model: Formation,
          as: 'formation',
          attributes: ['id_formation', 'nom'],
        },
      ],
      limit,
      offset,
      order: [['id_inscription', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      inscription: rows,
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
// GET: Une inscription par ID
// ---------------------
router.get('/:id', async (req, res) => {
  try {
    const inscription = await Inscription.findByPk(req.params.id, {
      include: [
        { model: Apprenant, as: 'apprenant', attributes: ['id_apprenant', 'nom', 'prenom'] },
        { model: Formation, as: 'formation', attributes: ['id_formation', 'nom'] },
      ],
    });
    if (!inscription) return res.status(404).json({ message: 'Inscription non trouvée' });
    res.json(inscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// POST: Ajouter une inscription
// ---------------------
router.post('/', async (req, res) => {
  try {
    const { id_apprenant, id_formation, date } = req.body;

    // Vérification existence apprenant et formation
    const apprenant = await Apprenant.findByPk(id_apprenant);
    if (!apprenant) return res.status(400).json({ message: 'Apprenant non trouvé' });

    const formation = await Formation.findByPk(id_formation);
    if (!formation) return res.status(400).json({ message: 'Formation non trouvée' });

    const nouvelleInscription = await Inscription.create({ id_apprenant, id_formation, date });
    res.status(201).json(nouvelleInscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// PUT: Modifier une inscription
// ---------------------
router.put('/:id', async (req, res) => {
  try {
    const { id_apprenant, id_formation, date } = req.body;

    const existingInscription = await Inscription.findByPk(req.params.id);
    if (!existingInscription) return res.status(404).json({ message: 'Inscription non trouvée' });

    if (id_apprenant) {
      const apprenant = await Apprenant.findByPk(id_apprenant);
      if (!apprenant) return res.status(400).json({ message: 'Apprenant non trouvé' });
    }

    if (id_formation) {
      const formation = await Formation.findByPk(id_formation);
      if (!formation) return res.status(400).json({ message: 'Formation non trouvée' });
    }

    await existingInscription.update({ id_apprenant, id_formation, date });
    res.json(existingInscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// DELETE: Supprimer une inscription
// ---------------------
router.delete('/:id', async (req, res) => {
  try {
    const inscription = await Inscription.findByPk(req.params.id);
    if (!inscription) return res.status(404).json({ message: 'Inscription non trouvée' });

    await inscription.destroy();
    res.json({ message: 'Inscription supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
