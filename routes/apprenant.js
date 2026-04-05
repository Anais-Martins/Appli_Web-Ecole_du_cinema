const express = require('express');
const router = express.Router();
const Apprenant = require('../models/apprenant'); // ton modèle Sequelize

// Page d'accueil → redirige vers la liste
router.get('/', (req, res) => {
    res.redirect('/apprenant');
});

// Liste des apprenants
router.get('/apprenant', async (req, res) => {
    try {
        const apprenant = await Apprenant.findAll();
        res.render('apprenant/liste', { apprenant }); // views/apprenant/liste.ejs
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

// Ajouter un apprenant
router.get('/apprenant/ajouter', (req, res) => {
    res.render('apprenant/ajouter');
});

// Modifier un apprenant (préremplir le formulaire)
router.get('/apprenant/modifier/:id', async (req, res) => {
    try {
        const apprenant = await Apprenant.findByPk(req.params.id);
        if (!apprenant) return res.status(404).send('Apprenant non trouvé');
        res.render('apprenant/modifier', { apprenant }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
