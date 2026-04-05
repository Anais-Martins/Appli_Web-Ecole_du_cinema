const Note = require('./models/note');  // adapte le chemin selon ton projet

async function testFindAll() {
  try {
    const note = await Note.findAll({ raw: true });
    console.log(note);  // affiche tous les étudiants dans la console
  } catch (error) {
    console.error('Erreur lors de la récupération des notes :', error);
  
  }
}

testFindAll();

