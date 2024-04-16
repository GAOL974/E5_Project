const world = document.querySelector('#gameBoard');
const c = world.getContext('2d');
world.width = world.clientWidth;
world.height = world.clientHeight;

let pseudo = getPseudoFromURL();


function getPseudoFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const pseudoParam = urlParams.get('pseudo');
    return pseudoParam;
}


let frames = 0;
const keys = {
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
    fired: { pressed: false }
};

let shipsDestroyed = 0; // Variable pour compter les vaisseaux détruits
let livesDisplay = document.getElementById('livesDisplay'); // Élément HTML pour afficher les vies
let shipsDestroyedDisplay = document.getElementById('shipsDestroyedDisplay'); // Élément HTML pour afficher le nombre de vaisseaux détruits


const showStartScreen = () => {
    // Efface le canvas
    c.clearRect(0, 0, world.width, world.height);

    // Dessine l'écran d'accueil
    c.fillStyle = 'black';
    c.fillRect(0, 0, world.width, world.height);
    c.font = '30px Arial';
    c.fillStyle = 'white';
    c.textAlign = 'center';
    c.fillText('Appuyez sur une touche pour commencer', world.width / 2, world.height / 2);
    console.log("Pseudo récupéré depuis l'URL :", pseudo);

    const startGameHandler = (event) => {
        startGame();
        window.removeEventListener('keydown', startGameHandler);
    };

    window.addEventListener('keydown', startGameHandler);
};


const showGameOverScreen = () => {

    // Efface le canvas
    c.clearRect(0, 0, world.width, world.height);

    gameOver = true;

    // Dessine l'écran Game Over
    c.fillStyle = 'black';
    c.fillRect(0, 0, world.width, world.height);
    c.font = '30px Arial';
    c.fillStyle = 'white';
    c.textAlign = 'center';
    c.fillText(pseudo, world.width / 2, world.height / 2 - 65);
    c.fillText('GAME OVER', world.width / 2, world.height / 2 - 20);

    // Affiche le nombre de vaisseaux détruits
    c.fillText('Vaisseaux détruits : ' + shipsDestroyed, world.width / 2, world.height / 2 + 30);
    // Commande pour rejouer ou non 
    c.fillText('[R] : Rejouer ---------------- [Y] : Accueil ', world.width / 2, world.height / 2 + 100);

};


showStartScreen();


const startGame = () => {
    // Initialisation du jeu
    init();

    // Lance la boucle de jeu
    animationLoop();
};

class Player {
    constructor() {
        this.velocity = { x: 0, y: 0 };
        this.position = { x: 0, y: 0 }; // Initialisez this.position avec des valeurs par défaut
        this.lives = 3; // Ajoutez une propriété pour suivre le nombre de vies du joueur
        const image = new Image();
        image.src = './img/x-wing.png';
        image.onload = () => {
            this.image = image;
            this.width = 48; // Largeur du vaisseau
            this.height = 48; // Hauteur du vaisseau
            this.position = {
                x: world.width / 2 - this.width / 2, // Position sur l'axe des x
                y: world.height - this.height - 10 // Position sur l'axe des Y
            };
        };
    }

    draw() {
        if (this.image) {
            c.drawImage(this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        }
    }

    shoot() {
        missiles.push(new Missile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y
            }
        }));
    }

    update() {
        if (this.image) {
            if (keys.ArrowLeft.pressed && this.position.x >= 0) {
                this.velocity.x = -5;
            } else if (keys.ArrowRight.pressed && this.position.x <= world.width - this.width) {
                this.velocity.x = 5;
            } else {
                this.velocity.x = 0;
            }
            this.position.x += this.velocity.x;
            this.draw();
        }
    }

    // Méthode pour diminuer le nombre de vies du joueur
    decreaseLives() {
        this.lives--;
    }

    // Méthode pour dessiner le nombre de vies
    drawLives() {
        livesDisplay.textContent = 'Vies : ' + this.lives;
    }
}

class Chasseur {
    constructor({ position }) {
        this.velocity = { x: 0, y: 0 };
        const image = new Image();
        image.src = './img/chasseur-tie.png';
        image.onload = () => {
            this.image = image;
            this.width = 32;
            this.height = 32;
            this.position = {
                x: position.x,
                y: position.y
            };
        };
    }

    draw() {
        if (this.image) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
    }

    update({ velocity }) {
        if (this.image) {
            this.position.x += velocity.x;
            this.position.y += velocity.y;
            if (this.position.y + this.height >= world.height) {
                console.log('You loose');
            }
        }
        this.draw();
    }

    shoot(chasseurMissiles) {
        if (this.position) {
            chasseurMissiles.push(new chasseurMissile({
                position: {
                    x: this.position.x,
                    y: this.position.y
                },
                velocity: {
                    x: 0,
                    y: 3
                }
            }))
        }
    }
}

class Missile {
    constructor({ position }) {
        this.position = position;
        this.velocity = { x: 0, y: -5 };
        this.width = 3;
        this.height = 5;
    }

    draw() {
        c.save();
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        c.fill();
        c.restore();
    }

    update() {
        this.position.y += this.velocity.y;
        this.draw();
    }
}

class Grid {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 1, y: 0 };
        this.invaders = [];
        let rows = Math.floor((world.height / 34) * (1 / 3));
        const columns = Math.floor((world.width / 34) * (2 / 3));
        this.height = rows * 34;
        this.width = columns * 34;
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Chasseur({
                    position: {
                        x: x * 34,
                        y: y * 34
                    }
                }))
            }
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y = 0;
        if (this.position.x + this.width >= world.width || this.position.x == 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 34;
        }
    }
}

class Particule {
    constructor({ position, velocity, radius, color }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.fillStyle = this.color;
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.opacity > 0) {
            this.opacity -= 0.01;
        }
        this.draw();
    }
}

class chasseurMissile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 3;
        this.height = 10;
    }

    draw() {
        c.save();
        c.fillStyle = 'yellow';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

let missiles;
let chasseurMissiles;
let grids;
let player;
let particules;

const init = () => {
    // Réinitialise toutes les variables du jeu
    frames = 0;
    missiles = [];
    chasseurMissiles = [];
    grids = [new Grid()];
    player = new Player();
    particules = [];
    keys.ArrowLeft.pressed = false;
    keys.ArrowRight.pressed = false;
    keys.fired.pressed = false;
    shipsDestroyed = 0; // Réinitialise le compteur de vaisseaux détruits
    gameSpeed = 1; // Réinitialise la vitesse du jeu
};

let gameSpeed = 1;

const animationLoop = () => {
    c.clearRect(0, 0, world.width, world.height);
    player.update();
    player.drawLives();
    requestAnimationFrame(animationLoop);

    // Vérifie si le joueur n'a plus de vies
    if (player.lives <= 0) {
        endGame(); // Appel de la fonction endGame() pour afficher l'écran de fin de jeu
        return; // Arrête la boucle de jeu
    }

    missiles.forEach((missile, index) => {
        if (missile.position && missile.position.y + missile.height <= 0) {
            setTimeout(() => {
                missiles.splice(index, 1);
            }, 0);
        } else {
            missile.update();
        }
    });

    grids.forEach((grid, indexGrid) => {
        grid.update();
        if (frames % 50 === 0 && grid.invaders.length > 0) {
            const randomInvaderIndex = Math.floor(Math.random() * (grid.invaders.length));
            if (grid.invaders[randomInvaderIndex]) {
                grid.invaders[randomInvaderIndex].shoot(chasseurMissiles);
            }
        }
        grid.invaders.forEach((invader, indexI) => {
            if (invader && invader.position) {
                invader.update({ velocity: grid.velocity });
                missiles.forEach((missile, indexM) => {
                    if (missile && missile.position && invader.position) {
                        if (missile.position.y <= invader.position.y + invader.height &&
                            missile.position.y >= invader.position.y &&
                            missile.position.x + missile.width >= invader.position.x &&
                            missile.position.x - missile.width <= invader.position.x + invader.width) {
                            for (let i = 0; i < 12; i++) {
                                particules.push(new Particule({
                                    position: {
                                        x: invader.position.x + invader.width / 2,
                                        y: invader.position.y + invader.height / 2
                                    },
                                    velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
                                    radius: Math.random() * 5 + 1,
                                    color: 'red'
                                }));
                            }
                            setTimeout(() => {
                                grid.invaders.splice(indexI, 1);
                                missiles.splice(indexM, 1);
                                shipsDestroyed++; // Incrémente le compteur de vaisseaux détruits
                                if (grid.invaders.length === 0 && grids.length == 1) {
                                    grids.splice(indexGrid, 1);
                                    grids.push(new Grid());
                                }
                            }, 0);
                        }
                    }
                });
            }
        });
    });

    chasseurMissiles.forEach((chasseurMissile, index) => {
        if (chasseurMissile.position && chasseurMissile.position.y + chasseurMissile.height >= world.height) {
            setTimeout(() => {
                chasseurMissiles.splice(index, 1);
            }, 0);
        } else {
            chasseurMissile.update();
        }
        if (chasseurMissile && chasseurMissile.position && player && player.position) {
            if (chasseurMissile.position.y + chasseurMissile.height >= player.position.y &&
                chasseurMissile.position.y <= player.position.y + player.height &&
                chasseurMissile.position.x >= player.position.x &&
                chasseurMissile.position.x + chasseurMissile.width <= player.position.x + player.width) {
                chasseurMissiles.splice(index, 1);
                for (let i = 0; i < 22; i++) {
                    particules.push(new Particule({
                        position: {
                            x: player.position.x + player.width / 2,
                            y: player.position.y + player.height / 2
                        },
                        velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
                        radius: Math.random() * 5,
                        color: 'white'
                    }));
                }
                lostLife();
            }
        }
    });

    particules.forEach((particule, index) => {
        if (particule.opacity <= 0) {
            particules.splice(index, 1);
        } else {
            particule.update();
        }
    });

    // Affichage du nombre de vaisseaux détruits à l'extérieur du canvas
    shipsDestroyedDisplay.textContent = 'Vaisseaux détruits : ' + shipsDestroyed;
    shipsDestroyedDisplay.classList.add('button');

    frames++;
};



const lostLife = () => {
    player.decreaseLives(); // Diminue le nombre de vies du joueur
    livesDisplay.textContent = 'Vies : ' + player.lives; // Met à jour l'affichage du nombre de vies
    if (player.lives <= 0) {
        endGame();
    }
};

const endGame = () => {
    gameOver = true; // Définissez la variable gameOver sur true pour arrêter le jeu
    showGameOverScreen(); // Affichez l'écran de fin de jeu

    // Envoyer le meilleur score à votre serveur
    fetch('/saveScore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pseudo: pseudo, // Pseudo du joueur
            score: shipsDestroyed // Meilleur score du joueur
        })
    })

        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de l\'enregistrement du score.');
            }
            // Code pour gérer une réponse réussie, si nécessaire
        })
        .catch(error => {
            console.error(error);
            // Code pour gérer l'erreur, si nécessaire
        });
};




addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
    }
});

addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case ' ':
            player.shoot();
            break;
    }
});


// Ajoutez un gestionnaire d'événements pour les touches R et Y
addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'r': // Touche R pour rejouer
            window.location.reload();
            break;
        case 'y': // Touche Y pour revenir à l'accueil
            window.location.href = 'compte.html';
            break;
    }
});



