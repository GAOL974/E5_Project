from django.urls import path
# Import des URLs de l'interface d'administration
from django.contrib import admin
# Import des vues qui sont déclarées dans leur propre module (dossier)
from .views import HomeView, StadiumsView, TeamsView, NewsletterView, UpdateView, MoreView
from .views import get_stadiums, get_events, get_teams, get_ticket, get_all_data

urlpatterns = (
    path("", HomeView.as_view(), name="home"),
    path("stadiums", StadiumsView.as_view(), name="stadiums"),
    path("teams", TeamsView.as_view(), name="teams"),
    path("newsletter", NewsletterView.as_view(), name="newsletter"),
    path("more", MoreView.as_view(), name="more"),
    path("update", UpdateView.as_view(), name="update"),
    # Dans un cadre de projet réel, il serait préférable d'utiliser une URL moins prévisible que "admin"
    path("admin", admin.site.urls),

    path('api/stadiums/', get_stadiums, name='stadiums_api'),
    path('api/events/', get_events, name='events_api'),
    path('api/teams/', get_teams, name='teams_api'),
    path('api/all/', get_all_data, name='all_api'),
    path('api/ticket/<ticket_id>/', get_ticket, name='get_ticket'),
)
