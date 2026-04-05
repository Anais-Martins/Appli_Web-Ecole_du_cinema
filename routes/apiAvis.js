// routes/apiAvis.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Avis = require('../models/avis');
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

    const { count, rows } = await Avis.findAndCountAll({
      where: whereCondition,
      include: [
        Apprenant, Formation
        /*
        {
          model: Apprenant,
          as: 'apprenant',
          attributes: ['id_apprenant', 'nom', 'prenom'],
        },
        {
          model: Formation,
          as: 'formation',
          attributes: ['id_formation', 'nom'],
        },*/
      ],
      limit,
      offset,
      order: [['id_avis', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      avis: rows,
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
// GET: Un avis par ID
// ---------------------
router.get('/:id', async (req, res) => {
  try {
    const avis = await Avis.findByPk(req.params.id, {
      include: [ Apprenant, Formation
        /*
        { model: Apprenant, as: 'apprenant', attributes: ['id_apprenant', 'nom', 'prenom'] },
        { model: Formation, as: 'formation', attributes: ['id_formation', 'nom'] },*/
      ],
    });
    if (!avis) return res.status(404).json({ message: 'Avis non trouvé' });
    res.json(avis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// POST: Ajouter un avis
// ---------------------
router.post('/', async (req, res) => {
  try {
    const { id_apprenant, id_formation, contenu } = req.body;

    // Vérification existence apprenant et formation
    const apprenant = await Apprenant.findByPk(id_apprenant);
    if (!apprenant) return res.status(400).json({ message: 'Apprenant non trouvé' });

    const formation = await Formation.findByPk(id_formation);
    if (!formation) return res.status(400).json({ message: 'Formation non trouvée' });

    const nouvelAvis = await Avis.create({ id_apprenant, id_formation, contenu });
    res.status(201).json(nouvelAvis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// PUT: Modifier un avis
// ---------------------
router.put('/:id', async (req, res) => {
  try {
    const { id_apprenant, id_formation, contenu } = req.body;

    const existingAvis = await Avis.findByPk(req.params.id);
    if (!existingAvis) return res.status(404).json({ message: 'Avis non trouvé' });

    if (id_apprenant) {
      const apprenant = await Apprenant.findByPk(id_apprenant);
      if (!apprenant) return res.status(400).json({ message: 'Apprenant non trouvé' });
    }

    if (id_formation) {
      const formation = await Formation.findByPk(id_formation);
      if (!formation) return res.status(400).json({ message: 'Formation non trouvée' });
    }

    await existingAvis.update({ id_apprenant, id_formation, contenu });
    res.json(existingAvis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// DELETE: Supprimer un avis
// ---------------------
router.delete('/:id', async (req, res) => {
  try {
    const avis = await Avis.findByPk(req.params.id);
    if (!avis) return res.status(404).json({ message: 'Avis non trouvé' });

    await avis.destroy();
    res.json({ message: 'Avis supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
