
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const cours = require('./cours');
const salle = require('./salle');

const cours_salle = sequelize.define('Cours_salle', {
  id_courssalle: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_cours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cours',
      key: 'id_cours',
    },
  },
  id_salle: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'salle',
      key: 'id_salle',
    },
  },
}, {
  tableName: 'cours_salle',
  timestamps: false,
});

// 🔗 Relation avec salle et cours (1 cours → peut avoir lieu dans plusieurs salles // 1 salle peut être dispensé à plusieurs cours)
// cours.belongsToMany(salle, { through : 'cours_salle', foreignKey: 'id_salle' });
// salle.belongsToMany(cours, { through : 'cours_salle', foreignKey: 'id_cours' });
cours_salle.belongsTo(cours, { foreignKey: 'id_cours', as: 'cours' });
cours_salle.belongsTo(salle, { foreignKey: 'id_salle', as: 'salle' });


module.exports = cours_salle;
