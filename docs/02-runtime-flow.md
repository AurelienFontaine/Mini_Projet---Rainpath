## 02 — Runtime flow (qui fait quoi, quand)

Ce document explique ce qui se passe quand on lance le projet et lors de l’usage (création, listing, détail, suppression).

### Démarrage (`make`)
1) `setup`
   - `npm install` dans `backend/` et `frontend/`.
   - Provision `backend/.env` si absent (`DATABASE_URL="file:./dev.db"`).
2) `migrate`
   - `npx prisma generate` (génère le client).
   - `npx prisma migrate dev -n init` (applique les migrations SQLite).
3) `start`
   - Backend: `npm run start:dev` (Nest écoute sur `:3000`).
   - Frontend: `npm run dev -- --port 5174` (Vite écoute sur `:5174`).
4) `lien`
   - Affiche: API `http://localhost:3000`, Front `http://localhost:5174`.

### Backend — Bootstrap
- `src/main.ts`: `NestFactory.create(AppModule)` → configure `ValidationPipe` (whitelist/transform) + CORS (`origin: true`).
- `AppModule`: monte `CasesModule` + `AppController`.
- `AppController`: `GET /` renvoie un status + un rappel des endpoints.
- `PrismaService`: instancie `PrismaClient` avec `DATABASE_URL` (SQLite local).

### Frontend — Bootstrap
- `index.html` charge `src/main.tsx` (module ES).
- `main.tsx` crée le router:
  - `/` et `/cases` → `CaseList`
  - `/create` → `CaseCreate`
  - `/cases/:id` → `CaseDetailGraph`
- `App.tsx` → navbar et conteneur.
- `theme.css` → styles globaux.

---

## Parcours utilisateur

### 1) “Dossiers” (liste)
- Vue: `CaseList.tsx`.
- Appels:
  - `GET /cases` via `getCases()` (client API; timeout ~1.5s).
  - Réponse: tableau de dossiers avec hiérarchie complète (prélèvements/blocs/lames).
- Rendu:
  - Recherche côté client (filtre par ID).
  - Cartes avec chips “compteurs”.
  - Empty state si aucun dossier.

### 2) “Créer un dossier”
- Vue: `CaseCreate.tsx`.
- Logique formulaire:
  - “Nom du dossier”: saisie puis “Valider le nom” (verrouille le champ; sinon la structure est désactivée).
  - Ajout/édition/suppression d’éléments:
    - Lame: `id` + `coloration` requis. Bouton “Valider la lame”.
    - Bloc: `id` requis, ≥1 lame validée, toutes les lames du bloc validées → “Valider le bloc”.
    - Prélèvement: `id` requis, tous ses blocs validés (et leurs lames) → “Valider le prélèvement”.
  - Raccourcis “Enter”:
    - Nom du dossier → valider le nom.
    - ID de prélèvement → ajouter un bloc.
    - ID de bloc → ajouter une lame.
    - ID/Coloration de lame complètes → ajouter une autre lame.
  - Bouton “Créer”:
    - Activé si ≥1 prélèvement validé.
    - Payload JSON construit selon la hiérarchie locale.
- Appel API:
  - `POST /cases` via `createCase()` (timeout ~3s).
  - Backend:
    - DTOs valident les champs.
    - `CasesService.create()`:
      - ID dossier généré si vide (uuid).
      - Vérifie l’unicité du dossier.
      - `prisma.case.create` avec `create` imbriqués (prélèvements → blocs → lames).
    - Réponse: dossier créé.
  - Front:
    - Redirection `/cases/:id` (détail) si succès.
    - Message d’erreur lisible si “Case with id ‘X’ already exists”.

### 3) “Dossier” (détail)
- Vue: `CaseDetailGraph.tsx`.
- Appel:
  - `GET /cases/:id` via `getCaseById()`.
- Rendu:
  - Affichage hiérarchique lisible (prélèvements/blocs/lames + coloration).
- Suppression:
  - Bouton “Supprimer le dossier” → `confirm()` → `DELETE /cases/:id`.
  - Backend: 404 si absent, sinon suppression (cascade).
  - Front: redirection vers `/cases`.

---

## Gestion des erreurs et contraintes
- Validation DTO (backend):
  - Tous les `id` non vides et `coloration` non vide (pour les lames).
  - “Whitelist” coupe les champs non attendus.
- Unicité “métier” (Prisma):
  - `(caseId, id)` pour prélèvements.
  - `(prelevementPk, id)` pour blocs.
  - `(blocPk, id)` pour lames.
  - Permet de réutiliser les mêmes `id` entre dossiers différents.
- Messages côté front:
  - 400 “already exists” → message français clair.
  - Timeouts: fetch avec délais raisonnables.

---

## Ports / Environnement
- API: `http://localhost:3000`.
- Front: `http://localhost:5174`.
- Problèmes courants:
  - `EADDRINUSE:3000` → `make clean`.
  - `.env` manquant → `make` crée `backend/.env`.
  - DB à remettre à zéro → `make reset` ou `make destroy`.

---

## Extension future (édition de dossier)
- Backend: `PUT /cases/:id` (remplacement complet en transaction: deleteMany + recreate).
- Front: route `/edit/:id`, préremplir `CaseCreate` en mode édition, “Enregistrer” → PUT.


