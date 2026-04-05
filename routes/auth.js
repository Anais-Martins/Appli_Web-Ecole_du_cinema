

// routes/auth.js
const express = require('express');
const router = express.Router();

// Page login
//router.get('/login', (req, res) => {
//  res.render('login', { title: 'Connexion - Ecole du Cinéma de Toulouse' });
//});

// Page register (création des users)
router.get('/register', (req, res) => {
  res.render('register');
});

// Page contact
router.get('/contact', (req, res) => {
  res.render('contact');
});

// Page connexion
router.get('/connexion', (req, res) => {
  res.render('login');
});

// Dashboards

router.get('/dashboard/admin', (req, res) => {
  res.render('dashboard_admin');
});

router.get('/dashboard/formateur', (req, res) => {
  res.render('dashboard_formateur');
});

router.get('/dashboard/apprenant', (req, res) => {
  res.render('dashboard_apprenant');
});

// Déconnexion
router.get('/deconnexion', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;
