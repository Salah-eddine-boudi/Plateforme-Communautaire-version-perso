# 🏘️ Plateforme Communautaire Junia

Application web full-stack permettant aux membres d'une communauté d'acheter/vendre des ressources, planifier des événements et communiquer en temps réel.

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + TypeScript + Vite |
| UI | Material UI (MUI v7) |
| Backend | NestJS (Node.js) |
| Base de données | PostgreSQL + TypeORM |
| Temps réel | Socket.io (WebSocket) |
| Auth | JWT + Passport.js |
| Conteneurisation | Docker |
| Data | Python (requests) |

---

## Fonctionnalités

### 🛒 Marketplace (CRUD complet)
- Affichage de 50 produits réels importés via API externe (DummyJSON)
- Recherche en temps réel par titre ou catégorie
- Filtres dynamiques par catégorie + tri par prix (croissant/décroissant)
- Créer / Modifier / Supprimer / Voir une annonce
- Images produits haute qualité
- Dialogs de confirmation pour les actions destructives

### 📅 Calendrier Communautaire
- Calendrier **drag & drop** (déplacer et redimensionner les événements)
- **Cliquer sur un créneau vide** pour créer un événement avec dates pré-remplies
- 4 types d'événements avec couleurs distinctes :
  - 💻 En ligne (bleu)
  - 🌳 Présentiel (vert)
  - 🛠️ Atelier (orange)
  - 🎉 Social (violet)
- **Filtres** par type d'événement
- **Statistiques** : événements aujourd'hui / ce mois / total
- Champ **Lieu** (salle, lien Teams, Discord…)
- Icônes et lieu affichés directement sur les événements dans le calendrier
- Vue détail avec dates formatées en français
- Vues : Mois / Semaine / Jour / Agenda
- Légende des couleurs + hint utilisateur
- Validation du formulaire (titre, début, fin obligatoires)

### 💬 Messagerie Temps Réel
- Chat WebSocket via Socket.io
- Widget flottant accessible depuis toutes les pages
- Historique des messages conservé
- Affichage différencié mes messages / autres

### 🔐 Authentification
- Inscription (prénom, nom, email, mot de passe)
- Connexion avec génération de token JWT
- Session persistante via localStorage
- Protection des actions (publier = connexion requise)

---

## Lancer le projet

### Prérequis
- Node.js ≥ 18
- Docker Desktop
- Python ≥ 3.8 + pip

### 1. Base de données (Docker)
```bash
# Premier lancement
docker run --name projet15_db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=projet15_community \
  -p 5432:5432 -d postgres

# Lancements suivants
docker start projet15_db
```

### 2. Backend (port 3000)
```bash
cd backend
npm install
npm run start:dev
```

### 3. Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```

### 4. Importer les données (optionnel)
```bash
cd data-scripts
pip install -r requirements.txt
python import_data.py
```

Ouvrir : `http://localhost:5173`

---

## Structure du projet

```
├── backend/
│   └── src/
│       ├── auth/           ← JWT + Passport
│       ├── users/          ← Gestion utilisateurs
│       ├── marketplace/    ← Annonces CRUD
│       ├── events/         ← Événements calendrier
│       └── chat/           ← Gateway Socket.io
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx         ← Marketplace
│       │   ├── CalendarPage.tsx ← Agenda
│       │   ├── Login.tsx
│       │   └── Register.tsx
│       ├── components/
│       │   ├── Navbar.tsx
│       │   └── ChatWidget.tsx   ← Chat flottant
│       └── context/
│           └── AuthContext.tsx  ← Auth global
│
└── data-scripts/
    ├── import_data.py      ← Import 50 produits DummyJSON
    └── clean_data.py       ← Nettoyage données
```

---

## API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/login` | Connexion |
| POST | `/users` | Inscription |
| GET | `/marketplace` | Liste des annonces |
| POST | `/marketplace` | Créer une annonce |
| PATCH | `/marketplace/:id` | Modifier une annonce |
| DELETE | `/marketplace/:id` | Supprimer une annonce |
| GET | `/events` | Liste des événements |
| POST | `/events` | Créer un événement |
| PATCH | `/events/:id` | Modifier un événement |
| DELETE | `/events/:id` | Supprimer un événement |
| WS | `/` | WebSocket chat |

---

## Branches Git

| Branche | Contenu |
|---------|---------|
| `main` | Version stable |
| `feature/calendrier` | Calendrier + améliorations marketplace |
