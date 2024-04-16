// Récupérer le pseudo depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const pseudo = urlParams.get('pseudo');

// Mettre à jour le contenu de la balise h1 avec le pseudo de l'utilisateur
document.getElementById('pseudo').textContent = pseudo;