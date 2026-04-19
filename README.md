# Ecole du Cinéma de Toulouse — Application Web

Projet 1 — Application web de gestion de formations cinéma  
Stack : Node.js / Express / EJS / Bootstrap 5 / Sequelize / MySQL / HTTPS

---

## Prérequis

- Node.js v23.3.0
- MySQL (base de données active)
- Un certificat SSL auto-signé (`key.pem` et `cert.pem`) à la racine du projet

---

## Lancement

npm run dev

L'application est accessible sur : **https://localhost:3001**

> Le certificat étant auto-signé, le navigateur affichera un avertissement de sécurité — cliquer sur "Continuer quand même".

---

## Comptes de test

Rôle | Username | Mot de passe |

Admin | *anaismartins* | *mdp1* |
Formateur | *merylstreep* | *mdp4* |
Apprenant | *camilledupont* | *mdp2* |

---

## Structure du projet

```
├── config/                      → Configuration base de données
├── middlewares/                 → Auth JWT, setUser
├── models/                      → Modèles Sequelize
├── routes/                      → Routes API (/api/...) et routes EJS
├── views/                       → Templates EJS (dashboards, formulaires, listes)
├── public/                      → CSS, images
├── app.js                       → Point d'entrée
└── centre_formations.sql        → Export de la base de données
```

---

## Fonctionnalités

- Authentification JWT avec rôles (admin / formateur / apprenant)
- Dashboard Admin : listes des formateurs, apprenants, inscriptions, cours, utilisateurs + possibilité d'ajouter, modifier, supprimer
- Dashboard Formateur : liste des cours, apprenants, saisie de notes
- Dashboard Apprenant : liste des cours, notes, formateurs, et possibilité de laisser un avis
