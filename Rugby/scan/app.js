document.addEventListener('DOMContentLoaded', (event) => {
    const imageInput = document.getElementById('imageInput');
    const startButton = document.getElementById('start');
    const selectedImage = document.getElementById('selectedImage');
    const resultDiv = document.getElementById('result');

    // Fonction pour démarrer le scanner
    async function startScanner() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = selectedImage.width;
        canvas.height = selectedImage.height;
        context.drawImage(selectedImage, 0, 0, selectedImage.width, selectedImage.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            const ticketId = code.data;

            // Faire une requête AJAX pour récupérer les informations du ticket
            try {
                const ticketInfo = await fetch(`http://127.0.0.1:8000/api/ticket/${ticketId}/`);
                const ticketData = await ticketInfo.json();

                // Afficher les informations du ticket dans resultDiv
                resultDiv.innerHTML = `
                    <p>ID: ${ticketData.id}</p>
                    <p>Evènement: ${ticketData.Evènement}</p>
                    <p>Categorie: ${ticketData.Categorie}</p>
                    <p>Place: ${ticketData.Place}</p>
                    <p>Prix: ${ticketData.Prix} ${ticketData.Monnaie}</p>
                `;
            } catch (error) {
                console.error('Erreur lors de la récupération des informations du ticket:', error);
                resultDiv.innerText = 'Erreur lors de la récupération des informations du ticket.';
            }
        } else {
            console.error('Aucun code QR trouvé dans l\'image.');
            resultDiv.innerText = 'Aucun code QR trouvé dans l\'image.';
        }
    }

    startButton.addEventListener('click', () => {
        const selectedFile = imageInput.files[0];

        if (selectedFile) {
            // Charger l'image sélectionnée dans l'élément img
            const reader = new FileReader();
            reader.onload = function (e) {
                selectedImage.src = e.target.result;
                startScanner();
            };
            reader.readAsDataURL(selectedFile);
        } else {
            alert('Veuillez sélectionner une image avant de démarrer le scanner.');
        }
    });
});
