
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const matiere = require('./matiere');

const cours = sequelize.define('Cours', {
  id_cours: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  horaire_debut: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  horaire_fin: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  id_matiere: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'matiere',
      key: 'id_matiere',
    },
  },
}, {
  tableName: 'cours',
  timestamps: false,
});

// 🔗 Relation avec matiere (1 matiere → plusieurs cours)
cours.belongsTo(matiere, { foreignKey: 'id_matiere', as: 'matiere' });

module.exports = cours;
