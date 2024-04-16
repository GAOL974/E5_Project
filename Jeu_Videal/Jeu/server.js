const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de express-session
app.use(session({
  secret: 'secret très secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // `true` en production avec HTTPS
}));

  // Connexion BDD
  const connection = mysql.createConnection({
       host: 'localhost',
       user: 'root',
       password: 'root',
       database: 'video_game'
   });
connection.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à MySQL');
});


app.use(express.static('public'));



app.post('/inscription', async (req, res) => {
  const { pseudo, password } = req.body;

  try {
    // Vérifier si le pseudo est déjà utilisé
    const isPseudoUsed = await checkPseudoExistence(pseudo);
    if (isPseudoUsed) {
      return res.status(400).send('Ce nom d\'utilisateur est déjà pris.');
    }

    // Le pseudo est disponible, procéder à l'inscription
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await insertPlayer(pseudo, hashedPassword); // Obtenez l'ID inséré

    req.session.userId = userId;
    req.session.username = pseudo; // Stocker le nom d'utilisateur dans la session
    req.session.isLoggedIn = true;
    res.redirect('/connexion.html'); // Assurez-vous que cette route existe et qu'elle est correctement gérée par votre serveur
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).send('/connexion.html');
  }
});

// Fonction pour insérer un nouveau joueur dans la base de données
function insertPlayer(pseudo, hashedPassword) {
  return new Promise((resolve, reject) => {
    const insertQuery = 'INSERT INTO Player (pseudo, password) VALUES (?, ?)';
    connection.query(insertQuery, [pseudo, hashedPassword], (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'insertion :', err);
        return reject(err);
      }
      // Renvoyer l'ID inséré
      resolve(results.insertId);
    });
  });
}

// Fonction pour vérifier si le pseudo est déjà utilisé
function checkPseudoExistence(pseudo) {
  return new Promise((resolve, reject) => {
    const checkQuery = "SELECT * FROM Player WHERE pseudo = ?";
    connection.query(checkQuery, [pseudo], (error, results) => {
      if (error) {
        console.error('Erreur lors de la vérification du pseudo : ', error);
        return reject(error);
      }
      resolve(results.length > 0);
    });
  });
}



app.post('/connexion', (req, res) => {
  const { pseudo, password } = req.body;

  // Vérifier les informations d'identification dans la base de données
  const query = 'SELECT * FROM Player WHERE pseudo = ?';
  connection.query(query, [pseudo], async (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification des informations de connexion :', err);
      res.status(500).send('Erreur lors de la connexion.');
      return;
    }
    
    if (results.length === 0) {
      // Pseudo incorrect
      res.status(401).send('Pseudo ou mot de passe incorrect.');
      return;
    }

    // Comparer les mots de passe hachés
    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Mot de passe incorrect
      res.status(401).send('Pseudo ou mot de passe incorrect.');
      return;
    }
    
    // Informations d'identification correctes, rediriger l'utilisateur
    req.session.userId = user.id;
    req.session.username = user.pseudo;
    req.session.isLoggedIn = true;
    res.redirect('/compte.html?pseudo=' + encodeURIComponent(user.pseudo));
  });
});








// Fonction pour récupérer un joueur par son pseudo depuis la base de données
async function getPlayer(pseudo) {
  return new Promise((resolve, reject) => {
    const selectQuery = 'SELECT * FROM Player WHERE pseudo = ?';
    connection.query(selectQuery, [pseudo], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération du joueur :', err);
        return reject(err);
      }
      if (results.length === 0) {
        resolve(null); // Aucun joueur trouvé
      } else {
        resolve(results[0]); // Renvoyer le premier joueur trouvé
      }
    });
  });
}



// Route pour enregistrer le score
app.post('/saveScore', async (req, res) => {
  const { pseudo, score } = req.body;

  try {
    // Récupérer le joueur depuis la base de données
    const player = await getPlayer(pseudo);

    if (!player) {
      return res.status(404).send('Joueur non trouvé.');
    }

    // Mettre à jour le meilleur score si le nouveau score est meilleur
    if (score > player.bestScore) {
      await updateBestScore(pseudo, score);
    }

    res.status(200).send('Score enregistré avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du score :', error);
    res.status(500).send('Erreur lors de l\'enregistrement du score.');
  }
});













const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});





