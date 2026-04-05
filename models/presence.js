
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const cours = require('./cours');
const apprenant = require('./apprenant');

const presence = sequelize.define('Presence', {
  id_presence: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  presence: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  id_cours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cours',
      key: 'id_cours',
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
  tableName: 'presence',
  timestamps: false,
});

// 🔗 Relation avec cours et apprenant (1 apprenant → peut être présent à plusieurs cours // 1 cours peut être dispensé à plusieurs apprenants)
//cours.belongsToMany(apprenant, { through : 'presence', foreignKey: 'id_cours' });
//apprenant.belongsToMany(cours, { through : 'presence', foreignKey: 'id_apprenant' });

presence.belongsTo(cours, { foreignKey: 'id_cours', as: 'cours' });
presence.belongsTo(apprenant, { foreignKey: 'id_apprenant', as: 'apprenant' });

module.exports = presence;
