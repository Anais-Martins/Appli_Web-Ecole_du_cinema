
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const formateur = require('./formateur');
const matiere = require('./matiere');

const formateur_matiere = sequelize.define('Formateur_matiere', {
  id_formateurmatiere: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_formateur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'formateur',
      key: 'id_formateur',
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
  tableName: 'formateur_matiere',
  timestamps: false,
});

// 🔗 Relation avec formateur et matiere (1 formateur → plusieurs matieres possibles // et inversement possible)
// formateur.belongsToMany(matiere, { through : 'formateur_matiere', foreignKey: 'id_formateur' });
// matiere.belongsToMany(formateur, { through : 'formateur_matiere', foreignKey: 'id_matiere' });

formateur_matiere.belongsTo(formateur, { foreignKey: 'id_formateur', as: 'formateur' });
formateur_matiere.belongsTo(matiere, { foreignKey: 'id_matiere', as: 'matiere' });

module.exports = formateur_matiere;
