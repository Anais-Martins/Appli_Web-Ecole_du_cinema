
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const formation = require('./formation');
const apprenant = require('./apprenant');

const inscription = sequelize.define('Inscription', {
  id_inscription: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATE,
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
  tableName: 'inscription',
  timestamps: false,
});

// 🔗 Relation entre formation et apprenant (1 apprenant → plusieurs inscriptions possibles // 1 formation → plusieurs apprenants )
//inscription.belongsToMany(apprenant, { through : 'apprenant', foreignKey: 'id_apprenant' });
//inscription.belongsToMany(formation, { through : 'formation', foreignKey: 'id_formation' });

inscription.belongsTo(formation, { foreignKey: 'id_formation', as: 'formation' });
inscription.belongsTo(apprenant, { foreignKey: 'id_apprenant', as: 'apprenant' });


module.exports = inscription;
