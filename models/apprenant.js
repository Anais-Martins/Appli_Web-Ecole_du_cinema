// models/apprenant.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // 👈 bien le fichier de config

const apprenant = sequelize.define('Apprenant', {
  id_apprenant: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  info_complementaires: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
}, {
  tableName: 'apprenant', // correspond au nom de la table MySQL existante
  timestamps: false, // désactiver createdAt / updatedAt si ta table n’en a pas
});

module.exports = apprenant;
