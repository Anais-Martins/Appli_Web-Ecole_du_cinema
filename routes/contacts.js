
// routes/contacts.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');

// Liste contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.findAll({ order: [['id', 'ASC']] });
    res.render('contacts/liste', { contacts });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Ajouter contact
router.get('/ajouter', (req, res) => {
  res.render('contacts/ajouter');
});

// Modifier contact
router.get('/modifier/:id', async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.redirect('/contacts');
    res.render('contacts/modifier', { contact });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
