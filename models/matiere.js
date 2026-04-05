// models/matiere.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // 👈 bien le fichier de config

const matiere = sequelize.define('Matiere', {
  id_matiere: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'matiere', // correspond au nom de la table MySQL existante
  timestamps: false, // désactiver createdAt / updatedAt si ta table n’en a pas
});

module.exports = matiere;
