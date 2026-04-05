// routes/apiFormateur_matiere.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Formateur_matiere = require('../models/formateur_matiere');
const Formateur = require('../models/formateur');
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

    // Filtre direct par id_formateur (utilisé par le dashboard formateur)
    const idFormateurFilter = req.query.id_formateur
      ? { id_formateur: parseInt(req.query.id_formateur, 10) }
      : {};

    // Recherche textuelle sur le nom du formateur ou de la matière
    const searchCondition = search
      ? {
          [Op.or]: [
            { '$Formateur.prenom$': { [Op.like]: `%${search}%` } },
            { '$Formateur.nom$': { [Op.like]: `%${search}%` } },
            { '$Formateur.email$': { [Op.like]: `%${search}%` } },
            { '$Formateur.telephone$': { [Op.like]: `%${search}%` } },
            { '$Formateur.info_complementaires$': { [Op.like]: `%${search}%` } },
            { '$Matiere.nom$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const whereCondition = { ...idFormateurFilter, ...searchCondition };

    const { count, rows } = await Formateur_matiere.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Formateur,
          as: 'formateur',
          attributes: ['id_formateur', 'prenom', 'nom', 'email', 'telephone', 'info_complementaires'],
        },
        {
          model: Matiere,
          as: 'matiere',
          attributes: ['id_matiere', 'nom'],
        },
      ],
      limit,
      offset,
      order: [['id_formateurmatiere', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      formateur_matiere: rows,
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
// GET: Formateur_matiere par ID
// ---------------------
router.get('/:id', async (req, res) => {
  try {
    const formateur_matiere = await Formateur_matiere.findByPk(req.params.id, {
      include: [
        { model: Formateur, as: 'formateur', attributes: ['id_formateur', 'prenom', 'nom', 'email', 'telephone', 'info_complementaires'] },
        { model: Matiere, as: 'matiere', attributes: ['id_matiere', 'nom'] },
      ],
    });
    if (!formateur_matiere) return res.status(404).json({ message: 'Formateur_matiere non trouvé' });
    res.json(formateur_matiere);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// POST: Ajouter un Formateur_matiere
// ---------------------
router.post('/', async (req, res) => {
  try {
    const { id_formateur, id_matiere, id_formateurmatiere } = req.body;

    // Vérification existence formateur et matière
    const formateur = await Formateur.findByPk(id_formateur);
    if (!formateur) return res.status(400).json({ message: 'Formateur non trouvé' });

    const matiere = await Matiere.findByPk(id_matiere);
    if (!matiere) return res.status(400).json({ message: 'Matiere non trouvée' });

    const nouveauFormateur_matiere = await Formateur_matiere.create({ id_formateur, id_matiere, id_formateurmatiere });
    res.status(201).json(nouveauFormateur_matiere);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// PUT: Modifier un Formateur_matiere
// ---------------------
router.put('/:id', async (req, res) => {
  try {
    const { id_formateur, id_matiere, id_formateur_matiere } = req.body;

    const existingFormateur_matiere = await Formateur_matiere.findByPk(req.params.id);
    if (!existingFormateur_matiere) return res.status(404).json({ message: 'Formateur_matiere non trouvée' });

    if (id_formateur) {
      const formateur = await Formateur.findByPk(id_formateur);
      if (!formateur) return res.status(400).json({ message: 'Formateur non trouvé' });
    }

    if (id_matiere) {
      const matiere = await Matiere.findByPk(id_matiere);
      if (!matiere) return res.status(400).json({ message: 'Matiere non trouvée' });
    }

    await existingFormateur_matiere.update({ id_formateur, id_matiere, id_formateur_matiere });
    res.json(existingFormateur_matiere);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// DELETE: Supprimer un Formateur_matiere
// ---------------------
router.delete('/:id', async (req, res) => {
  try {
    const formateur_matiere = await Formateur_matiere.findByPk(req.params.id);
    if (!formateur_matiere) return res.status(404).json({ message: 'Formateur_matiere non trouvée' });

    await formateur_matiere.destroy();
    res.json({ message: 'Formateur_matiere supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
