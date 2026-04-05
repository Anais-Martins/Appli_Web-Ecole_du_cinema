const express = require('express');
const router = express.Router();
const Cours = require('../models/cours');
const Formateur = require('../models/formateur');

// Page d'accueil → redirige vers la liste
router.get('/', (req, res) => {
    res.redirect('/cours/liste');
});


// Liste des cours
router.get('/liste', async (req, res) => {
    try {
        const cours = await Cours.findAll({
            order: [['id_cours', 'ASC']]
        });
        res.render('cours/liste', { cours });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

// Ajouter un cours
router.get('/ajouter', async (req, res) => {
    try {
        const Matiere = require('../models/matiere');
        const matiere = await Matiere.findAll();
        res.render('cours/ajouter', { matiere });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

// Modifier un cours
router.get('/modifier/:id', async (req, res) => {
    try {
        const Matiere = require('../models/matiere');
        const cours = await Cours.findByPk(req.params.id);
        if (!cours) return res.status(404).send('Cours non trouvé');
        const matiere = await Matiere.findAll();
        res.render('cours/modifier', { cours, matiere });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;