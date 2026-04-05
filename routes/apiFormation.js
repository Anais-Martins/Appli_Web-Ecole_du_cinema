/*
// routes/apiFormation.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
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

    // Recherche sur le nom de la matière
    const whereCondition = search
      ? {
          [Op.or]: [
            { '$Formation.nom$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Formation.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Formation,
          as: 'formation',
          attributes: ['id_formation', 'nom'],
        },
      ],
      limit,
      offset,
      order: [['id_formation', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      formation: rows,
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
// GET: Une formation par ID
// ---------------------
router.get('/:id', async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id, {
      include: [
        { model: Formation, as: 'formation', attributes: ['id_formation', 'nom'] },
      ],
    });
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });
    res.json(formation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// POST: Ajouter une formation
// ---------------------
router.post('/', async (req, res) => {
  try {
    const { id_matiere, formation } = req.body;

    // Vérification existence matière
    
    const matiere = await Matiere.findByPk(id_matiere);
    if (!matiere) return res.status(400).json({ message: 'Matière non trouvée' });

    const nouvelleFormation = await Formation.create({ id_matiere, formation });
    res.status(201).json(nouvelleFormation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// PUT: Modifier une formation
// ---------------------
router.put('/:id', async (req, res) => {
  try {
    const { id_matiere, formation } = req.body;

    const existingFormation = await Formation.findByPk(req.params.id);
    if (!existingFormation) return res.status(404).json({ message: 'Formation non trouvée' });

    if (id_matiere) {
      const matiere = await Matiere.findByPk(id_matiere);
      if (!matiere) return res.status(400).json({ message: 'Matière non trouvée' });
    }

    await existingFormation.update({ id_matiere, formation });
    res.json(existingFormation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// DELETE: Supprimer une formation
// ---------------------
router.delete('/:id', async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id);
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });

    await formation.destroy();
    res.json({ message: 'Formation supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
*/

// routes/apiFormation.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Formation = require('../models/formation');
const Matiere = require('../models/matiere');
const Inscription = require('../models/inscription');
const Avis = require('../models/avis');

// ---------------------
// GET: Liste de toutes les formations
// ---------------------
router.get('/', async (req, res) => {
  try {
    const formations = await Formation.findAll({
      order: [['id_formation', 'ASC']]
    });
    res.json(formations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// GET: Une formation par ID (JUSTE nom et description)
// ---------------------
router.get('/:id', async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id);
    
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    
    res.json(formation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// POST: Créer une nouvelle formation
// ---------------------
router.post('/', async (req, res) => {
  try {
    const { nom, description } = req.body;
    
    // Validation
    if (!nom) {
      return res.status(400).json({ message: 'Le nom est obligatoire' });
    }
    
    const nouvelleFormation = await Formation.create({ 
      nom, 
      description 
    });
    
    res.status(201).json(nouvelleFormation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// PUT: Modifier une formation
// ---------------------
router.put('/:id', async (req, res) => {
  try {
    const { nom, description } = req.body;
    
    const formation = await Formation.findByPk(req.params.id);
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    
    await formation.update({ nom, description });
    res.json(formation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// DELETE: Supprimer une formation
// ---------------------
router.delete('/:id', async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id);
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    
    await formation.destroy();
    res.json({ message: 'Formation supprimée avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
