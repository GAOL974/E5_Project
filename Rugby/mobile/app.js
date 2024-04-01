let pageEvents, pageStadiums, pageTeams;

document.addEventListener('DOMContentLoaded', async function () {
  try {
    pageEvents = await loadEvents();
    pageStadiums = await loadStadiums();
    pageTeams = await loadTeams();
  } catch (error) {
    console.error('Une erreur s\'est produite lors du chargement des données :', error);
  }
  displayEvents(pageEvents);
});

async function loadEvents() {
  const apiEvents = 'http://127.0.0.1:8000/api/events/';

  try {
    let dataEvent = await fetch(apiEvents);
    let jsonEvent = await dataEvent.json();
    console.log('Données des événements :', jsonEvent); // Ajout de cette ligne
    return jsonEvent.events;
  } catch (error) {
    console.error('Erreur lors du chargement des événements :', error);
    throw error; // Rejet de la promesse en cas d'erreur
  }
}


async function loadStadiums() {
  const apiStadiums = 'http://127.0.0.1:8000/api/stadiums/';

  let dataStade = await fetch(apiStadiums);
  let jsonStade = await dataStade.json();
  return jsonStade.stadiums; 
}

async function loadTeams() {
  const apiTeams = 'http://127.0.0.1:8000/api/teams/';

  let dataTeam = await fetch(apiTeams);
  let jsonTeam = await dataTeam.json();
  return jsonTeam.teams;
}

function displayEvents(events) {
  const eventsList = document.getElementById('eventsList');
  eventsList.innerHTML = '';

  events.forEach(event => {
    // Recherche des données associées dans les listes pageStadiums et pageTeams
    const stadium = pageStadiums.find(stadium => stadium.ID === event.ID_stade);
    const teamLocal = pageTeams.find(team => team.ID === event.Team_local);
    const teamVisitor = pageTeams.find(team => team.ID === event.Team_visiteur);

    const teamLocalInfo = pageTeams.find(team => team.ID === event.Team_local);
    const teamVisitorInfo = pageTeams.find(team => team.ID === event.Team_visiteur);

    // Formatage de la date
    const eventDate = new Date(event.Date_match);
    const formattedDate = `${eventDate.getDate()}/${eventDate.getMonth() + 1}/${eventDate.getFullYear()} ${eventDate.getHours()}:${eventDate.getMinutes()}`;

    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <div class="event" data-event-id="${event.ID}">
          <h2>Stade: ${stadium ? stadium.Name : '?'} - Tokyo</h2>
          <h2>Date : ${formattedDate}</h2>
          
          <div class="match">
            <div>
              <h3>${teamLocalInfo ? teamLocalInfo.Pays : '?'}</h3>
              <p>${teamLocal ? teamLocal.Team : '?'}</p>
            </div>
            <div>
              <h3>${teamVisitorInfo ? teamVisitorInfo.Pays : '?'}</h3>
              <p>${teamVisitor ? teamVisitor.Team : '?'}</p>
            </div>
          </div>
          <div class="color"  style="background: linear-gradient(45deg, #${teamLocalInfo ? teamLocalInfo.Couleur_principale : 'white'} 25%, #${teamLocalInfo ? teamLocalInfo.Couleur_secondaire : 'white'} 50%,#${teamVisitorInfo ? teamVisitorInfo.Couleur_principale : 'white'} 75%, #${teamVisitorInfo ? teamVisitorInfo.Couleur_secondaire : 'white'} 100%)">
          </div>
        </div>
      `;
    eventsList.appendChild(listItem);

    listItem.addEventListener('click', function() {
      const eventId = this.getAttribute('data-event-id');
      const eventColor = this.querySelector('.color').style.background;
      showEventData(eventId, eventColor);
    });
  });
}

function showEventData(eventId, eventColor) {
  const event = pageEvents.find(event => event.ID.toString() === eventId);
  if (!event) {
    console.error('Événement non trouvé');
    return;
  }

  const qrData = JSON.stringify({
    ID: event.ID,
    ID_stade: event.ID_stade,
    Team_local: event.Team_local,
    Team_visiteur: event.Team_visiteur,
    Date_match: event.Date_match
  });

  // Supprimez le contenu précédent du conteneur QR code
  document.getElementById("qrcode").innerHTML = '';

  // Création du QR Code
  const qrcode = new QRCode(document.getElementById("qrcode"), {
    text: qrData,
    width: 128,
    height: 128
  });

  // Vous pouvez également styliser le QR Code en fonction de la couleur de l'événement
  document.getElementById("qrcode").style.background = eventColor;
}
