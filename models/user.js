const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id_user: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  // Informations de base
  username: { type: DataTypes.STRING, allowNull: false },

  // Rôle et mots de passe
  role: { 
    type: DataTypes.ENUM('apprenant', 'formateur', 'admin'), 
    allowNull: false 
  },
  mot_de_passe: { 
    type: DataTypes.STRING, allowNull: false 
  },
  
  /*
  // Infos sécurité / tracking
  lastLogin: { type: DataTypes.DATE, allowNull: true },
  resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
  resetPasswordExpires: { type: DataTypes.DATE, allowNull: true },
    */

}, {
  tableName: 'user',
  timestamps: false,  // crée createdAt et updatedAt
});

module.exports = User;
