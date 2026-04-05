
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const formation = require('./formation');
const apprenant = require('./apprenant');

const avis = sequelize.define('Avis', {
  id_avis: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  contenu: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_formation: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'formation',
      key: 'id_formation',
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
  tableName: 'avis',
  timestamps: false,
});

// 🔗 Relation avec formation et apprenant (1 apprenant → un avis sur plusieurs formations possibles)

apprenant.hasMany(avis, { foreignKey: 'id_apprenant' });
avis.belongsTo(apprenant, { foreignKey: 'id_apprenant' });
 
formation.hasMany(avis, { foreignKey: 'id_formation' });
avis.belongsTo(formation, { foreignKey: 'id_formation' })

module.exports = avis;
