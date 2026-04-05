
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const auth = require('../middelwares/auth');
const Formateur = require('../models/formateur');
const FormateurMatiere = require('../models/formateur_matiere');
const FormationMatiere = require('../models/formation_matiere');
const Inscription = require('../models/inscription');
const Apprenant = require('../models/apprenant');
const Avis = require('../models/avis');
const Cours = require('../models/cours');
const Note = require('../models/note');
const Matiere = require('../models/matiere');
const Formation = require('../models/formation');

// =====================================================
// ROUTES CRUD FORMATEUR (existantes)
// =====================================================

// ➕ Ajouter un formateur
router.post('/', async (req, res) => {
  try {
    const { nom, prenom, email, telephone, info_complementaires } = req.body;
    const formateur = await Formateur.create({ prenom, nom, email, telephone, info_complementaires });
    res.status(201).json(formateur);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// 📋 Liste paginée avec recherche
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const whereCondition = search
      ? {
          [Op.or]: [
            { nom: { [Op.like]: `%${search}%` } },
            { prenom: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        }
      : {};

    const { count, rows } = await Formateur.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['id_formateur', 'ASC']]
    });

    res.json({
      formateur: rows,
      pagination: { page, totalPages: Math.ceil(count / limit), totalItems: count }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// =====================================================
// ROUTES DASHBOARD FORMATEUR
// =====================================================

/**
 * GET /api/formateur/:id/cours
 * Retourne tous les cours des matières enseignées par ce formateur.
 * Chemin : formateur_matiere → id_matiere → cours (avec matiere incluse)
 */
router.get('/:id/cours', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    // Récupérer les matières du formateur
    const formateurMatieres = await FormateurMatiere.findAll({
      where: { id_formateur: id }
    });

    if (!formateurMatieres.length) return res.json([]);

    const idMatieres = formateurMatieres.map(fm => fm.id_matiere);

    // Récupérer les cours de ces matières
    const cours = await Cours.findAll({
      where: { id_matiere: { [Op.in]: idMatieres } },
      include: [{ model: Matiere, as: 'matiere' }],
      order: [['date', 'DESC']]
    });

    res.json(cours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/formateur/:id/apprenants
 * Retourne les apprenants qui suivent les matières du formateur, avec leur avis sur la formation.
 * Chemin : formateur_matiere → formation_matiere → inscription → apprenant + avis
 */
router.get('/:id/apprenants', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    // Matières du formateur
    const formateurMatieres = await FormateurMatiere.findAll({
      where: { id_formateur: id }
    });

    if (!formateurMatieres.length) return res.json([]);

    const idMatieres = formateurMatieres.map(fm => fm.id_matiere);

    // Formations qui contiennent ces matières
    const formationMatieres = await FormationMatiere.findAll({
      where: { id_matiere: { [Op.in]: idMatieres } },
      include: [{ model: Formation, as: 'formation' }]
    });

    if (!formationMatieres.length) return res.json([]);

    const idFormations = [...new Set(formationMatieres.map(fm => fm.id_formation))];

    // Inscriptions dans ces formations
    const inscriptions = await Inscription.findAll({
      where: { id_formation: { [Op.in]: idFormations } },
      include: [
        { model: Apprenant, as: 'apprenant' },
        { model: Formation, as: 'formation' }
      ]
    });

    if (!inscriptions.length) return res.json([]);

    // Récupérer tous les avis des apprenants concernés
    const idApprenants = [...new Set(inscriptions.map(i => i.id_apprenant))];
    const avisListe = await Avis.findAll({
      where: {
        id_apprenant: { [Op.in]: idApprenants },
        id_formation: { [Op.in]: idFormations }
      }
    });

    // Construire la liste finale (une ligne par inscription)
    const result = inscriptions.map(insc => {
      const apprenant = insc.apprenant;
      const formation = insc.formation;
      const avis = avisListe.find(a =>
        a.id_apprenant === insc.id_apprenant && a.id_formation === insc.id_formation
      ) || null;

      return {
        id_apprenant: apprenant.id_apprenant,
        prenom: apprenant.prenom,
        nom: apprenant.nom,
        email: apprenant.email,
        formation: formation ? { id_formation: formation.id_formation, nom: formation.nom } : null,
        avis: avis ? { id_avis: avis.id_avis, contenu: avis.contenu } : null
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/formateur/:id/notes
 * Retourne toutes les notes des apprenants du formateur, sur ses matières.
 */
router.get('/:id/notes', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    // Matières du formateur
    const formateurMatieres = await FormateurMatiere.findAll({
      where: { id_formateur: id }
    });

    if (!formateurMatieres.length) return res.json([]);

    const idMatieres = formateurMatieres.map(fm => fm.id_matiere);

    const notes = await Note.findAll({
      where: { id_matiere: { [Op.in]: idMatieres } },
      include: [
        { model: Apprenant, as: 'apprenant' },
        { model: Matiere, as: 'matiere' }
      ],
      order: [['date', 'DESC']]
    });

    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/formateur/:id/notes
 * Ajoute une note pour un apprenant.
 */
router.post('/:id/notes', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const { id_apprenant, id_matiere, note, date, type_eval } = req.body;

    if (!id_apprenant || !id_matiere || note === undefined || !date || !type_eval) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Vérifier que la matière appartient bien à ce formateur
    const fm = await FormateurMatiere.findOne({
      where: { id_formateur: id, id_matiere }
    });
    if (!fm) return res.status(403).json({ message: 'Cette matière ne vous appartient pas.' });

    const nouvelleNote = await Note.create({ id_apprenant, id_matiere, note, date, type_eval });
    res.status(201).json(nouvelleNote);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/formateur/:id/notes/:id_note
 * Modifie une note existante.
 */
router.put('/:id/notes/:id_note', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const id_note = parseInt(req.params.id_note, 10);
    if (isNaN(id) || isNaN(id_note)) return res.status(400).json({ message: 'ID invalide' });

    const { id_apprenant, id_matiere, note, date, type_eval } = req.body;

    // Vérifier que la matière appartient bien à ce formateur
    const fm = await FormateurMatiere.findOne({
      where: { id_formateur: id, id_matiere }
    });
    if (!fm) return res.status(403).json({ message: 'Cette matière ne vous appartient pas.' });

    const noteExistante = await Note.findByPk(id_note);
    if (!noteExistante) return res.status(404).json({ message: 'Note non trouvée.' });

    await noteExistante.update({ id_apprenant, id_matiere, note, date, type_eval });
    res.json({ success: true, message: 'Note mise à jour.', note: noteExistante });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/formateur/:id/notes/:id_note
 * Supprime une note.
 */
router.delete('/:id/notes/:id_note', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const id_note = parseInt(req.params.id_note, 10);
    if (isNaN(id) || isNaN(id_note)) return res.status(400).json({ message: 'ID invalide' });

    const noteExistante = await Note.findByPk(id_note);
    if (!noteExistante) return res.status(404).json({ message: 'Note non trouvée.' });

    // Vérifier que la matière appartient bien à ce formateur
    const fm = await FormateurMatiere.findOne({
      where: { id_formateur: id, id_matiere: noteExistante.id_matiere }
    });
    if (!fm) return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer cette note.' });

    await noteExistante.destroy();
    res.json({ success: true, message: 'Note supprimée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// =====================================================
// ROUTES CRUD FORMATEUR SUITE (existantes)
// =====================================================

// 🔍 Obtenir un formateur par ID
router.get('/:id_formateur', async (req, res) => {
  try {
    const id = parseInt(req.params.id_formateur, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const formateur = await Formateur.findByPk(id);
    if (!formateur) return res.status(404).json({ message: 'Formateur non trouvé' });

    res.json(formateur);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Modifier un formateur
router.put('/:id_formateur', async (req, res) => {
  try {
    const id = parseInt(req.params.id_formateur, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const { prenom, nom, email, telephone, info_complementaires } = req.body;

    const formateur = await Formateur.findByPk(id);
    if (!formateur) return res.status(404).json({ message: 'Formateur non trouvé' });

    await formateur.update({ prenom, nom, email, telephone, info_complementaires });
    res.json({ success: true, message: 'Formateur mis à jour', formateur });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ❌ Supprimer un formateur
router.delete('/:id_formateur', async (req, res) => {
  try {
    const id = parseInt(req.params.id_formateur, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

    const formateur = await Formateur.findByPk(id);
    if (!formateur) return res.status(404).json({ message: 'Formateur non trouvé' });

    await formateur.destroy();
    res.json({ success: true, message: 'Formateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
