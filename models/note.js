
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const matiere = require('./matiere');
const apprenant = require('./apprenant');

const note = sequelize.define('Note', {
  id_note: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  note: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type_eval: {
    type: DataTypes.ENUM,
    values: ['eval_simple', 'DM', 'oral', 'partiel'],
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
  id_apprenant: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'apprenant',
      key: 'id_apprenant',
    },
  },
}, {
  tableName: 'note',
  timestamps: false,
});

// 🔗 Relation avec matiere (1 matiere → plusieurs notes // 1 apprenant → plusieurs notes )
note.belongsTo(matiere, { foreignKey: 'id_matiere', as: 'matiere' });
note.belongsTo(apprenant, { foreignKey: 'id_apprenant', as: 'apprenant' });

module.exports = note;
