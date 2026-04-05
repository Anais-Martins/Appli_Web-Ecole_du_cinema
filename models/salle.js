// models/salle.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // 👈 bien le fichier de config

const salle = sequelize.define('Salle', {
  id_salle: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'salle', // correspond au nom de la table MySQL existante
  timestamps: false, // désactiver createdAt / updatedAt si ta table n’en a pas
});

module.exports = salle;
