
// app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');

const sequelize = require('./config/db'); // ⚠️ Import de Sequelize depuis config/db.js

// remplacer l'ancien code http par ca le code pour https
const https = require('https');
const fs = require('fs');

// Import des routes API et EJS

const apiApprenantRouter = require('./routes/apiApprenant');
const apprenantRoutes = require('./routes/apprenant');

const apiAvisRouter = require('./routes/apiAvis');
const avisRoutes = require('./routes/avis');

const apiCours_salleRouter = require('./routes/apiCours_salle');
const cours_salleRoutes = require('./routes/cours_salle');

const apiCoursRouter = require('./routes/apiCours');
const coursRoutes = require('./routes/cours');

const apiFormateur_matiereRouter = require('./routes/apiFormateur_matiere');
const formateur_matiereRoutes = require('./routes/formateur_matiere');

const apiFormateurRouter = require('./routes/apiFormateur');
const formateurRoutes = require('./routes/formateur');

const apiFormation_matiereRouter = require('./routes/apiFormation_matiere');
const formation_matiereRoutes = require('./routes/formation_matiere');

const apiFormationRouter = require('./routes/apiFormation');
const formationRoutes = require('./routes/formation');

const apiInscriptionRouter = require('./routes/apiInscription');
const inscriptionRoutes = require('./routes/inscription');

const apiMatiereRouter = require('./routes/apiMatiere');
const matiereRoutes = require('./routes/matiere');

const apiNoteRouter = require('./routes/apiNote');
const noteRoutes = require('./routes/note');

const apiPresenceRouter = require('./routes/apiPresence');
const presenceRoutes = require('./routes/presence');

const apiSalleRouter = require('./routes/apiSalle');
const salleRoutes = require('./routes/salle');

const indexRouter = require('./routes/index');


// const apiContactsRouter = require('./routes/apiContacts');
// const contactsRoutes = require('./routes/contacts');

const apiUserRouter = require('./routes/user');
const apiUsersRouter = require('./routes/apiUser');

const authRouter = require('./routes/auth');       // Pages HTML
const apiAuthRouter = require('./routes/apiAuth'); // API REST


// Middleware pour setUser
const setUser = require('./middelwares/setUser');

const app = express();

// 🌐 Autoriser les requêtes cross-origin
app.use(cors());


// 🔧 Middlewares

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // ✅ DOIT être avant setUser
app.use(setUser);        // Middleware pour avoir `user` disponible dans toutes les vues

// 📂 Configuration du moteur de vues EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 📦 Dossier public + Bootstrap
app.use(express.static('public'));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// 🧭 Routes EJS
app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use(express.static('public'));


// 🧭 Routes API
app.use('/api/apprenant', apiApprenantRouter);
app.use('/api/avis', apiAvisRouter);
app.use('/api/cours_salle', apiCours_salleRouter);
app.use('/api/cours', apiCoursRouter);
app.use('/api/formateur_matiere', apiFormateur_matiereRouter);
app.use('/api/formateur', apiFormateurRouter);
app.use('/api/formation_matiere', apiFormation_matiereRouter);
app.use('/api/formation', apiFormationRouter);
app.use('/api/inscription', apiInscriptionRouter);
app.use('/api/matiere', apiMatiereRouter);
app.use('/api/note', apiNoteRouter);
app.use('/api/presence', apiPresenceRouter);
app.use('/api/salle', apiSalleRouter);
app.use('/api/user', apiUsersRouter);

// app.use('/api/contacts', apiContactsRouter);

// 🧭 Routes frontend (EJS)
app.use('/', authRouter);     // GET /login et /register pour les pages
app.use('/', formateurRoutes);
app.use('/', formationRoutes);
app.use('/', apprenantRoutes);
//app.use('/', inscriptionRoutes);
app.use('/inscription', inscriptionRoutes);
app.use('/', matiereRoutes);
app.use('/avis', avisRoutes);
app.use('/cours_salle', cours_salleRoutes);
app.use('/cours', coursRoutes);
app.use('/formateur_matiere', formateur_matiereRoutes);
app.use('/formation_matiere', formation_matiereRoutes);
app.use('/note', noteRoutes);
app.use('/presence', presenceRoutes);
app.use('/salle', salleRoutes);
// app.use('/contacts', contactsRoutes);

app.use('/api', apiAuthRouter); // POST /api/login, POST /api/register, POST /api/logout


// 🏠 Page d'accueil (définition du title pour EJS)
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Accueil - Ecole du Cinéma de Toulouse',
    user: req.user // pour afficher nom/prénom dans le navbar
  });
});

// ⚠️ Gestion des erreurs 404
app.use((req, res, next) => {
  if (req.accepts('json')) {
    res.status(404).json({ message: 'Route non trouvée' });
  } else {
    res.status(404).render('404', { title: '404 - Page non trouvée' });
  }
});

// ⚠️ Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err);
  if (req.accepts('json')) {
    res.status(err.status || 500).json({ message: err.message || 'Erreur interne du serveur' });
  } else {
    res.status(err.status || 500).render('error', { error: err, title: 'Erreur serveur' });
  }
});

// 🚀 Lancer le serveur après la connexion à MySQL
const PORT = process.env.PORT || 3001;
 /*
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connecté à la base MySQL "centre_formations" via Sequelize');

    // ❗ Si tu veux créer automatiquement les tables (optionnel)
    // await sequelize.sync({ alter: false });

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur de connexion MySQL :', error);
  }
})();
 */

(async () => {
try {
await sequelize.authenticate();
console.log(' Connecté à la base MySQL "centre_formations" via Sequelize');
const options = {
key: fs.readFileSync('key.pem'),
cert: fs.readFileSync('cert.pem')
};
https.createServer(options, app).listen(PORT, () => {
console.log(` Serveur HTTPS démarré sur https://localhost:${PORT}`);
});
} catch (error) {
console.error(' Erreur de connexion MySQL :', error);
}
})();

module.exports = app;
