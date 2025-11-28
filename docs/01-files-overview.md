## 01 — Files overview (quoi, pourquoi, comment)

Ce document résume les fichiers clés du projet, leur rôle, et les choix techniques.

### Racine
- `README.md`
  - Pourquoi: point d’entrée pour lancer et tester le projet rapidement.
  - Comment: décrit le make, les liens, un résumé des endpoints et renvoie vers les docs détaillées.
- `Makefile`
  - Pourquoi: automatiser l’installation, la DB Prisma, le démarrage et le nettoyage.
  - Comment:
    - `make`: installe, migre, démarre back (3000) + front (5174), affiche les liens.
    - `clean`: stoppe et libère les ports.
    - `destroy`: reset de la DB (Prisma) + suppression du fichier `dev.db`.
    - `reset`: `prisma migrate reset -f`.
    - Variables: `FRONTEND_PORT` (5174 par défaut), `VITE_API_URL` (http://localhost:3000).
- `.gitignore`
  - Pourquoi: garder un repo propre; pas de secrets/artefacts dans Git.
  - Comment: ignore `node_modules`, `dist`, `backend/dev.db`, fichiers logs/PID, `.env` backend.
- `subject.txt`
  - Pourquoi: source d’exigences (hiérarchie métier, contraintes techniques, bonus DB).

### Backend (`backend/`)
- `backend/README.md`
  - Pourquoi: documentation spécifique back (endpoints, Prisma).
- `package.json`
  - Pourquoi: scripts et dépendances (NestJS, Prisma, class-validator).
  - Comment: `start:dev` (ts-node-dev), `build`/`start` pour prod.
- `prisma/schema.prisma`
  - Pourquoi: définir la base de données (SQLite dev).
  - Comment:
    - `Case { id @id }` + timestamps.
    - `Prelevement { pk @id cuid; id; caseId; @@unique([caseId,id]) }`
    - `Bloc { pk; id; prelevementPk; @@unique([prelevementPk,id]) }`
    - `Lame { pk; id; blocPk; coloration; @@unique([blocPk,id]) }`
    - Relations en cascade.
- `src/main.ts`
  - Pourquoi: bootstrap NestJS.
  - Comment: `NestFactory.create(AppModule)`, `ValidationPipe`, CORS, écoute sur 3000.
- `src/app.module.ts`
  - Pourquoi: module racine (`@Module`), monte `CasesModule` et `AppController`.
- `src/app.controller.ts`
  - Pourquoi: `GET /` pour un statut lisible (évite 404 à la racine).
- `src/prisma/prisma.service.ts`
  - Pourquoi: intégrer `PrismaClient` à Nest (DI), injecter `DATABASE_URL`, gérer le lifecycle.
- `src/cases/cases.module.ts`
  - Pourquoi: regrouper `CasesController` et `CasesService` + `PrismaService`.
- `src/cases/cases.controller.ts`
  - Pourquoi: endpoints REST.
  - Comment:
    - `GET /cases` (liste), `GET /cases/:id` (détail),
    - `POST /cases` (création imbriquée),
    - `DELETE /cases/:id` (suppression).
- `src/cases/cases.service.ts`
  - Pourquoi: logique métier + accès DB via Prisma.
  - Comment: `findMany`/`findUnique` avec `include`, `create` en nested create, 404/400 explicites.
- `src/cases/dto/create-case.dto.ts`
  - Pourquoi: validation d’entrée (DTO).
  - Comment: `@IsNotEmpty()`/`@IsString()` sur tous les `id` et `coloration`, `ValidateNested` pour les niveaux.
- `src/cases/entities/case.entity.ts`
  - Pourquoi: interfaces TypeScript de la hiérarchie (typing clair).

### Frontend (`frontend/`)
- `frontend/README.md`
  - Pourquoi: doc front (ports, scripts, pages).
- `package.json`, `tsconfig.json`, `vite.config.ts`
  - Pourquoi: outillage React TS (Vite), port fixe 5174 en dev.
- `index.html`
  - Pourquoi: shell Vite (`<div id="root">` + script module).
- `src/main.tsx`
  - Pourquoi: bootstrap React + router.
  - Comment: routes `/`/`cases` (liste), `/create`, `/cases/:id`.
- `src/App.tsx`
  - Pourquoi: layout + navbar (onglets actifs).
- `src/theme.css`
  - Pourquoi: thème global (bleu/white), boutons, cartes, alerts, séparateurs hiérarchiques.
- `src/types.ts`
  - Pourquoi: types fortement typés (alignés backend).
- `src/api/client.ts`
  - Pourquoi: client HTTP centralisé, timeouts, messages d’erreur lisibles.
  - Comment: base URL vers `localhost:3000`, fonctions `getCases`, `getCaseById`, `createCase`, `deleteCase`.
- `src/pages/CaseList.tsx`
  - Pourquoi: liste + recherche et empty state design.
- `src/pages/CaseCreate.tsx`
  - Pourquoi: formulaire imbriqué avec validations progressives (Lame/Bloc/Prélèvement) et règles de verrouillage.
  - Comment: entrées clavier (Enter) pour accélérer l’ajout, bouton “Créer” activé si ≥1 prélèvement validé.
- `src/pages/CaseDetailGraph.tsx`
  - Pourquoi: vue hiérarchique et suppression du dossier.


