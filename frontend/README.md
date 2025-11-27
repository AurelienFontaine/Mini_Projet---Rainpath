# Rainpath Frontend (React + TypeScript, Vite)

Application React TypeScript (Vite) qui consomme l'API NestJS du backend.

## Prérequis
- Node.js >= 18
- npm >= 9

## Installation
```bash
cd frontend
npm install
```

## Démarrage en développement
```bash
npm run dev
```
L'application écoute sur `http://localhost:5174` (port fixe).

## Configuration de l'API
- Le client utilise `VITE_API_URL` (variable Vite) pour appeler l'API.
- Si non défini, il utilisera `http://localhost:3000` par défaut.

Pour définir explicitement l'URL API, vous pouvez exporter la variable d'environnement au lancement:
```bash
VITE_API_URL=http://localhost:3000 npm run dev
```

## Pages
- `/cases` (liste + recherche)
- `/cases/:id` (vue hiérarchique + suppression)
- `/create` (formulaire avec “Valider/Modifier”, création via POST /cases)

## Scripts
- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run preview` — prévisualisation du build

## Dépannage
- Le front s’ouvre parfois via un proxy IDE: utilisez directement `http://localhost:5174`.
- API indisponible: démarrez le backend (`make` à la racine ou `npm run start:dev` dans `backend/`).


