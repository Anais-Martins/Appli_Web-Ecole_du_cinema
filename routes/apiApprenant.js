
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Apprenant = require('../models/apprenant'); // modèle Sequelize
const auth = require('../middelwares/auth');

// ---------------------
// ➕ Ajouter un apprenant
// ---------------------
// router.post('/', auth(['admin', 'apprenant']), async (req, res) => {       ///// code pour authentification
router.post('/', async (req, res) => {
  try {
    const { nom, prenom, email, telephone, info_complementaires } = req.body;

    const apprenant = await Apprenant.create({
      prenom,
      nom,
      email,
      telephone,
      info_complementaires,
    });

    res.status(201).json(apprenant);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// ---------------------
// Liste paginée avec recherche
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';

    const offset = (page - 1) * limit;

    // Créer condition de recherche
    const whereCondition = search
      ? {
          [Op.or]: [
            { nom: { [Op.like]: `%${search}%` } },
            { prenom: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        }
      : {};

    // Récupérer les apprenants
    const { count, rows } = await Apprenant.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['id_apprenant', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      apprenants: rows,
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

// ---------------------
// 🔍 Obtenir un apprenant par ID
// ---------------------
router.get('/:id_apprenant', async (req, res) => {
  try {
    const id = parseInt(req.params.id_apprenant, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const apprenant = await Apprenant.findByPk(id);
    if (!apprenant) return res.status(404).json({ message: 'Apprenant non trouvé' });

    res.json(apprenant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// ✏️ Modifier un apprenant
// ---------------------
router.put('/:id_apprenant', async (req, res) => {
  try {
    const id = parseInt(req.params.id_apprenant, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const { prenom, nom, email, telephone, info_complementaires } = req.body;

    const apprenant = await Apprenant.findByPk(id);
    if (!apprenant) return res.status(404).json({ message: 'Apprenant non trouvé' });

    await apprenant.update({
      prenom,
      nom,
      email,
      telephone,
      info_complementaires,
    });

    res.json({ success: true, message: 'Apprenant mis à jour', apprenant });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ---------------------
// ❌ Supprimer un apprenant
// ---------------------
router.delete('/:id_apprenant', async (req, res) => {
  try {
    const id = parseInt(req.params.id_apprenant, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const apprenant = await Apprenant.findByPk(id);
    if (!apprenant) return res.status(404).json({ message: 'Apprenant non trouvé' });

    await apprenant.destroy();
    res.json({ success: true, message: 'Apprenant supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Formations d'un apprenant
router.get('/:id_apprenant/formations', async (req, res) => {
  try {
    const id = parseInt(req.params.id_apprenant, 10);
    const Inscription = require('../models/inscription');
    const Formation = require('../models/formation');

    const inscriptions = await Inscription.findAll({
      where: { id_apprenant: id },
      include: [{ model: Formation, as: 'formation' }]
    });

    const formations = inscriptions.map(i => i.formation);
    res.json(formations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// Cours d'un apprenant (via inscription → formation → formation_matiere → cours)
// ---------------------
router.get('/:id_apprenant/cours', async (req, res) => {
  try {
    const id = parseInt(req.params.id_apprenant, 10);
    const Cours = require('../models/cours');
    const Matiere = require('../models/matiere');
    const Inscription = require('../models/inscription');
    const Formation = require('../models/formation');
    const Formation_matiere = require('../models/formation_matiere');

    // Récupérer les formations de l'apprenant
    const inscriptions = await Inscription.findAll({ where: { id_apprenant: id } });
    const idFormations = inscriptions.map(i => i.id_formation);

    // Récupérer les matières de ces formations
    const formationMatieres = await Formation_matiere.findAll({
      where: { id_formation: idFormations }
    });
    const idMatieres = formationMatieres.map(fm => fm.id_matiere);

    // Récupérer les cours de ces matières
    const cours = await Cours.findAll({
      where: { id_matiere: idMatieres },
      include: [{ model: Matiere, as: 'matiere', attributes: ['nom'] }],
      order: [['date', 'ASC']]
    });

    res.json(cours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// Présences d'un apprenant
// ---------------------
router.get('/:id_apprenant/presences', async (req, res) => {
  try {
    const id = parseInt(req.params.id_apprenant, 10);
    const Presence = require('../models/presence');

    const presences = await Presence.findAll({ where: { id_apprenant: id } });
    res.json(presences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// Notes d'un apprenant
// ---------------------
router.get('/:id_apprenant/notes', async (req, res) => {
  try {
    const id = parseInt(req.params.id_apprenant, 10);
    const Note = require('../models/note');
    const Matiere = require('../models/matiere');

    const notes = await Note.findAll({
      where: { id_apprenant: id },
      include: [{ model: Matiere, as: 'matiere', attributes: ['nom'] }],
      order: [['date', 'ASC']]
    });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// Formateurs d'un apprenant
// ---------------------
router.get('/:id_apprenant/formateurs', async (req, res) => {
  try {
    const id = parseInt(req.params.id_apprenant, 10);
    const Inscription = require('../models/inscription');
    const Formation_matiere = require('../models/formation_matiere');
    const Formateur_matiere = require('../models/formateur_matiere');
    const Formateur = require('../models/formateur');
    const Matiere = require('../models/matiere');

    // Formations de l'apprenant
    const inscriptions = await Inscription.findAll({ where: { id_apprenant: id } });
    const idFormations = inscriptions.map(i => i.id_formation);

    // Matières de ces formations
    const formationMatieres = await Formation_matiere.findAll({
      where: { id_formation: idFormations },
      include: [{ model: Matiere, as: 'matiere', attributes: ['id_matiere', 'nom'] }]
    });
    const idMatieres = [...new Set(formationMatieres.map(fm => fm.id_matiere))];

    // Formateurs de ces matières
    const formateurMatieres = await Formateur_matiere.findAll({
      where: { id_matiere: idMatieres },
      include: [
        { model: Formateur, as: 'formateur', attributes: ['prenom', 'nom', 'email'] },
        { model: Matiere, as: 'matiere', attributes: ['nom'] }
      ]
    });

    // Formater la réponse
    const result = formateurMatieres.map(fm => ({
      prenom: fm.formateur.prenom,
      nom: fm.formateur.nom,
      email: fm.formateur.email,
      matiere: fm.matiere.nom
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------
// Avis d'un apprenant (max 1)
// ---------------------
router.get('/:id_apprenant/avis', async (req, res) => {
  try {
    const id = parseInt(req.params.id_apprenant, 10);
    const Avis = require('../models/avis');
    const Formation = require('../models/formation');

    const avis = await Avis.findOne({
      where: { id_apprenant: id },
      include: [{ model: Formation, attributes: ['nom'] }]
    });

    res.json(avis || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
