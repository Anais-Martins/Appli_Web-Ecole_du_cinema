const bcrypt = require('bcrypt');
const User = require('./models/user');
const sequelize = require('./config/db');

(async () => {
  await sequelize.authenticate();
  
  const hash = await bcrypt.hash('mdp1', 10);
  
  await User.create({
    username: 'anaismartins',
    mot_de_passe: hash,
    role: 'admin'
  });
  
  console.log('✅ Utilisateur créé avec succès');
  process.exit();
})();