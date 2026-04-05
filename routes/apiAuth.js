// routes/apiAuth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Apprenant = require('../models/apprenant');
const Formateur = require('../models/formateur');
const auth = require('../middelwares/auth');

// --- INSCRIPTION API ---
router.post('/register', async (req, res) => {
  try {
    const { username, role, mot_de_passe } = req.body;

    if (!username || !mot_de_passe) {
      return res.status(400).json({ success: false, message: 'Tous les champs obligatoires doivent être remplis.' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) return res.status(400).json({ success: false, message: "Ce nom d'utilisateur est déjà pris." });

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const newUser = await User.create({
      username,
      role: role || 'apprenant',
      mot_de_passe: hashedPassword,
    });

    res.status(201).json({ success: true, message: 'Utilisateur créé avec succès.', idUser: newUser.id_user });
  } catch (error) {
    console.error('💥 Erreur inscription API :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'inscription.' });
  }
});

// --- LOGIN API ---
router.post('/login', async (req, res) => {
  try {
    const { username, mot_de_passe } = req.body;

    if (!username || !mot_de_passe) {
      return res.status(400).json({ success: false, message: 'Veuillez entrer vos identifiants.' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });

    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) return res.status(401).json({ success: false, message: 'Mot de passe incorrect.' });

    // Chercher l'id_apprenant si le user est un apprenant
    let id_apprenant = null;
    if (user.role === 'apprenant') {
      const apprenants = await Apprenant.findAll();
      const match_apprenant = apprenants.find(a =>
        (a.prenom + a.nom).toLowerCase().replace(/\s/g, '') === username.toLowerCase().replace(/\s/g, '')
      );
      if (match_apprenant) id_apprenant = match_apprenant.id_apprenant;
    }

    // Chercher l'id_formateur si le user est un formateur
    let id_formateur = null;
    if (user.role === 'formateur') {
      const formateurs = await Formateur.findAll();
      const match_formateur = formateurs.find(f =>
        (f.prenom + f.nom).toLowerCase().replace(/\s/g, '') === username.toLowerCase().replace(/\s/g, '')
      );
      if (match_formateur) id_formateur = match_formateur.id_formateur;
    }

    const token = jwt.sign(
      { 
        id_user: user.id_user, 
        username: user.username, 
        role: user.role,
        id_apprenant,
        id_formateur
      },
      process.env.JWT_SECRET || 'SECRET_KEY',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, { httpOnly: true });

    res.json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id_user: user.id_user,
        username: user.username,
        role: user.role,
        id_apprenant,
        id_formateur
      }
    });

  } catch (error) {
    console.error('💥 Erreur login API :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la connexion.' });
  }
});

// --- LOGOUT API ---
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
