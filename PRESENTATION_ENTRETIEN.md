# Plateforme Communautaire — Dossier de Présentation Entretien

> **Projet réalisé dans le cadre du M1 Développement Logiciel — S1**
> Projet #15 : Plateforme Communautaire

---

## Ce que j'ai construit

Une **application web full-stack** de plateforme communautaire, pensée pour permettre aux membres d'une communauté (ex : étudiants Junia) de :

- Acheter, vendre et échanger des ressources entre eux (**Marketplace**)
- Planifier et gérer des événements collectifs (**Calendrier interactif**)
- Communiquer en temps réel (**Messagerie instantanée**)
- Gérer leur compte et profil (**Authentification sécurisée**)

---

## Stack Technique

| Couche | Technologie | Pourquoi ce choix |
|--------|-------------|-------------------|
| **Frontend** | React 19 + TypeScript + Vite | Composants réutilisables, typage fort, build rapide |
| **UI** | Material UI (MUI v7) | Design system professionnel, gain de temps |
| **Backend** | NestJS (Node.js) | Architecture modulaire, décorateurs, DI intégrée |
| **Base de données** | PostgreSQL + TypeORM | Relationnel robuste, ORM typé |
| **Temps réel** | Socket.io | WebSocket simplifié, idéal pour le chat |
| **Auth** | JWT + Passport.js | Standard industrie, stateless |
| **Conteneurisation** | Docker | Isolation de la BDD, reproductibilité |
| **Data** | Python (requests) | Script d'import de données réelles |

---

## Architecture du Projet

```
projet-15-communaute/
├── backend/                  ← API REST + WebSocket (NestJS)
│   └── src/
│       ├── auth/             ← Authentification JWT
│       ├── users/            ← Gestion des utilisateurs
│       ├── marketplace/      ← Annonces (CRUD complet)
│       ├── events/           ← Événements du calendrier
│       └── chat/             ← Gateway Socket.io
│
├── frontend/                 ← Interface React
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx      ← Marketplace (page principale)
│       │   ├── CalendarPage.tsx ← Agenda drag & drop
│       │   ├── Login.tsx     ← Connexion
│       │   └── Register.tsx  ← Inscription
│       ├── components/
│       │   ├── Navbar.tsx    ← Navigation
│       │   └── ChatWidget.tsx ← Chat flottant temps réel
│       └── context/
│           └── AuthContext.tsx ← État global d'authentification
│
└── data-scripts/             ← Scripts Python d'import de données
    ├── import_data.py        ← Import 50 produits via DummyJSON API
    └── clean_data.py         ← Nettoyage des données
```

---

## Fonctionnalités Développées

### 1. Marketplace (CRUD complet)
- Affichage de **50 produits réels** importés via API externe (DummyJSON)
- **Recherche** en temps réel par titre ou catégorie
- **Filtres** par catégorie (chips dynamiques) + tri par prix
- **Créer** une annonce avec image, description, prix
- **Modifier** une annonce existante
- **Supprimer** avec confirmation
- **Voir** les détails dans une modal
- Images produits haute qualité

### 2. Calendrier Communautaire
- Calendrier **drag & drop** (déplacer les événements à la souris)
- Vues : Mois / Semaine / Jour / Agenda
- Créer, modifier, supprimer des événements
- Types : En ligne / Présentiel (code couleur)
- Localisation française complète

### 3. Messagerie Temps Réel
- Chat **WebSocket** via Socket.io
- Widget flottant accessible depuis toutes les pages
- Historique des messages conservé
- Affichage différencié mes messages / autres messages

### 4. Authentification
- Inscription avec prénom, nom, email, mot de passe
- Connexion avec génération de **token JWT**
- Session persistante via localStorage
- Protection des routes (publier une annonce = connexion requise)

### 5. Import de Données (Python)
- Script Python qui appelle l'**API DummyJSON** (50 produits réels)
- Nettoyage et transformation des données
- Import automatique vers l'API NestJS locale

---

## Points Techniques à Mettre en Avant

### Problèmes résolus pendant le projet

**Problème 1 — Fond noir de la page**
> Le template Vite par défaut injectait `background-color: #242424` (dark mode).
> **Solution :** Correction du `index.css` + ajout de `ThemeProvider` + `CssBaseline` MUI pour forcer le mode clair.

**Problème 2 — `price.toFixed is not a function`**
> L'API retournait `price` en tant que `string` au lieu de `number`.
> **Solution :** Conversion explicite `Number(item.price).toFixed(2)` côté frontend.

**Problème 3 — Connexion BDD refusée au démarrage**
> Le backend démarrait avant Docker/PostgreSQL.
> **Solution :** Lancer Docker (`projet15_db`) avant le backend — NestJS gère les retry automatiquement.

### Choix d'architecture notables
- **Context API React** pour l'état d'authentification global (pas de Redux = moins de complexité)
- **Socket.io au niveau module** dans ChatWidget pour éviter les reconnexions multiples
- **TypeORM avec `synchronize: true`** en dev pour la création automatique des tables
- **Guards JWT NestJS** pour protéger les routes sensibles

---

## Comment Lancer le Projet

```bash
# 1. Démarrer Docker Desktop, puis :
docker start projet15_db

# 2. Backend (port 3000)
cd backend
npm run start:dev

# 3. Frontend (port 5173)
cd frontend
npm run dev

# 4. Importer les données (optionnel)
cd data-scripts
python import_data.py
```

Ouvrir : `http://localhost:5173`

---

## Ce que j'ai appris

- Construire une **architecture full-stack complète** de A à Z
- Intégrer **WebSockets** dans une application NestJS/React
- Gérer **l'authentification JWT** end-to-end
- Utiliser **Docker** pour isoler la base de données
- Consommer des **APIs externes** avec Python pour alimenter une BDD
- Déboguer des problèmes **CSS/runtime React** (StrictMode, types)
- Travailler avec **Git branches** (`feature/calendrier`)

---

## Ce que j'aurais pu ajouter (si plus de temps)

- Upload d'images (Multer / S3)
- Notifications push en temps réel
- Système de messagerie privée
- Déploiement sur un serveur (Railway / Render)
- Tests unitaires et e2e (Jest / Playwright)

---

*Projet disponible sur GitHub : branche `feature/calendrier`*
