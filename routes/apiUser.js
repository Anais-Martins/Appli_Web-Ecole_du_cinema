const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/user');
const auth = require('../middelwares/auth');
const bcrypt = require('bcrypt');

// 🔒 Routes API réservées aux admins
router.use(auth(['admin']));

// GET - récupérer tous les utilisateurs avec pagination et recherche
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const whereCondition = search
      ? {
          [Op.or]: [
            { username: { [Op.like]: `%${search}%` } },
            { role: { [Op.like]: `%${search}%` } }
          ]
        }
      : {};

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      attributes: ['id_user', 'username', 'role'],
      limit,
      offset,
      order: [['id_user', 'ASC']]
    });

    res.json({
      success: true,
      users: rows,
      pagination: {
        page,
        totalPages: Math.ceil(count / limit),
        totalItems: count
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET - récupérer un utilisateur par ID
router.get('/:id_user', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id_user, {
      attributes: ['id_user', 'username', 'role']
    });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST - créer un utilisateur
router.post('/', async (req, res) => {
  try {
    const { username, role, mot_de_passe } = req.body;

    if (!username || !mot_de_passe || !role) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires.' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(400).json({ success: false, message: "Ce nom d'utilisateur est déjà pris." });

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const newUser = await User.create({ username, role, mot_de_passe: hashedPassword });

    res.status(201).json({ success: true, message: 'Utilisateur créé', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// PUT - modifier un utilisateur
router.put('/:id_user', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id_user);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    const { username, role, mot_de_passe } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (role) updateData.role = role;
    if (mot_de_passe) updateData.mot_de_passe = await bcrypt.hash(mot_de_passe, 10);

    await user.update(updateData);
    res.json({ success: true, message: 'Utilisateur mis à jour', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// DELETE - supprimer un utilisateur
router.delete('/:id_user', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id_user);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });

    await user.destroy();
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
