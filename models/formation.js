// models/formation.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // 👈 bien le fichier de config

const formation = sequelize.define('Formation', {
  id_formation: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'formation', // correspond au nom de la table MySQL existante
  timestamps: false, // désactiver createdAt / updatedAt si ta table n’en a pas
});

module.exports = formation;
