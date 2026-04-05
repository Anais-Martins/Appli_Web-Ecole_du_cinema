
const express = require('express');
const router = express.Router();
const Formateur = require('../models/formateur');

// Page d'accueil → redirige vers la liste
router.get('/', (req, res) => {
    res.redirect('/formateur');
});

// Liste des formateurs
router.get('/formateur', async (req, res) => {
    try {
        const formateur = await Formateur.findAll();
        res.render('formateur/liste', { formateur }); // views/formateur/liste.ejs
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

// Ajouter un formateur
router.get('/formateur/ajouter', (req, res) => {
    res.render('formateur/ajouter');
});

// Modifier un formateur (préremplir le formulaire)
router.get('/formateur/modifier/:id', async (req, res) => {
    try {
        const formateur = await Formateur.findByPk(req.params.id);
        if (!formateur) return res.status(404).send('Formateur non trouvé');
        res.render('formateur/modifier', { formateur }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
