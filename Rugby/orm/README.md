# Projet "ORM"

Ce projet, quasiment identique au projet **SQL**, a pour but de présenter l'ORM de Django qui sert à avoir une abstraction de l'usage d'une base de données.

## 📚 Notions

* Interface d'administration
* Modèles

## ⚠️ Prérequis

* Avoir un serveur MySQL/MariaDB en cours d'exécution
* Configurer le fichier `mainapp/settings/base.py` de ce projet avec les informations de connexion à MySQL/MariaDB (port, utilisateur, mot de passe)

Si ce n'est pas déjà fait, créez la migration correspondant aux modèles de l'application `mainapp` comme ceci :

    python manage.py makemigrations mainapp

Ensuite, appliquez toutes les migrations disponibles sur votre base de données :

    python manage.py migrate

Vous pouvez désormais importer les données initiales à partir du fichier `initial_data.json` :

    python manage.py loaddata initial_data.json

## ⏩ Démarrage du projet

    python manage.py runserver

_Il vous faudra peut-être remplacer `python` par `python3` selon votre environnement (macOS...)_

Si besoin, la commande `sqlmigrate` sert à voir le code SQL correspondant à une migration. Par exemple, pour voir le SQL généré par la migration 0001 :

    python manage.py sqlmigrate mainapp 0001

## 🔗 URLs à essayer

* http://localhost:8000/
* http://localhost:8000/stadiums
* http://localhost:8000/teams
* http://localhost:8000/newsletter
* http://localhost:8000/update
* http://localhost:8000/admin
