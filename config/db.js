const { Sequelize } = require('sequelize');

// Connexion à MySQL
const sequelize = new Sequelize('centre_formations', 'root', '', {
  host: '127.0.0.1',      // Utiliser 127.0.0.1 sur Windows
  port: 3306,             // Port par défaut de MySQL
  dialect: 'mysql',
  logging: false,         // Mettre à true pour voir les requêtes SQL
  dialectOptions: {
    connectTimeout: 60000 // Timeout plus long pour éviter ETIMEDOUT
  }
});

// Test de connexion
sequelize.authenticate()
  .then(() => console.log('✅ Connexion à MySQL réussie !'))
  .catch(err => console.error('❌ Impossible de se connecter à MySQL :', err));

module.exports = sequelize;

