
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const formation = require('./formation');
const matiere = require('./matiere');

const formation_matiere = sequelize.define('Formation_matiere', {
  id_formationmatiere: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_formation: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'formation',
      key: 'id_formation',
    },
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
  tableName: 'formation_matiere',
  timestamps: false,
});

// 🔗 Relation avec formation et apprenant (1 apprenant → un avis sur plusieurs formations possibles)
// formation.belongsToMany(matiere, { through : 'formation_matiere', foreignKey: 'id_formation' });
// matiere.belongsToMany(formation, { through : 'formation_matiere', foreignKey: 'id_matiere' });

formation_matiere.belongsTo(formation, { foreignKey: 'id_formation', as: 'formation' });
formation_matiere.belongsTo(matiere, { foreignKey: 'id_matiere', as: 'matiere' });

module.exports = formation_matiere;
