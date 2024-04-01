from mainapp.models import Stadium, Event, Team, Ticket
from django.http import JsonResponse, HttpResponseNotFound


def get_stadiums(request):
    stadiums = Stadium.objects.all()
    data = {'stadiums': []}
    for stadium in stadiums:
        data['stadiums'].append({
            'ID':stadium.id,
            'Name': stadium.name,
            'Location': stadium.location,
            'Latitude': stadium.latitude,
            'Longitude': stadium.longitude,
        })
    json_data = JsonResponse(data, json_dumps_params={'indent': 2})
    return json_data

def get_events(request):
    events = Event.objects.all()
    data = {'events': []}
    for event in events:
        data['events'].append({
            'ID': event.id,
            'ID_stade': event.stadium_id,
            'Team_local': event.team_home_id,
            'Team_visiteur': event.team_away_id,
            'Date_match': event.start,
        })
    json_data = JsonResponse(data, json_dumps_params={'indent': 2})
    return json_data

def get_teams(request):
    teams = Team.objects.all()
    data = {'teams': []}
    for team in teams:
        data['teams'].append({
            'ID': team.id,
            'Pays': team.country,
            'Pays_court': team.country_alpha2,
            'Team': team.nickname,
            'Couleur_principale': team.color_first,
            'Couleur_secondaire': team.color_second,
        })
    json_data = JsonResponse(data, json_dumps_params={'indent': 2})
    return json_data

def get_ticket(request, ticket_id):
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        
        ticket_data = {
            'id': ticket.id,
            'Evènement': ticket.event_id,
            'Categorie': ticket.category,
            'Place': ticket.seat,
            'Prix': ticket.price,
            'Monnaie': ticket.currency
        }

        return JsonResponse(ticket_data)
    except Ticket.DoesNotExist:
        return HttpResponseNotFound("Ticket not found")
    
def get_all_data(request):
    stadiums_data = get_stadiums(request).content
    events_data = get_events(request).content
    teams_data = get_teams(request).content

    stadiums_dict = get_stadiums(request)
    events_dict = get_events(request)
    teams_dict = get_teams(request)

    all_data = {
        'stadiums': stadiums_dict,
        'events': events_dict,
        'teams': teams_dict,
    }

    json_data = JsonResponse(all_data, json_dumps_params={'indent': 2})
    return json_data
    
