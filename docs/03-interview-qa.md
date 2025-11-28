## 03 — Interview Q&A (structure, choix, améliorations)

### Architecture & choix techniques
- Pourquoi NestJS côté backend ?
  - Structure claire (Modules/Controllers/Services), DI native, pipeline de validation, testabilité.
  - Écosystème Node mature; facile à combiner avec Prisma.
- Pourquoi Prisma + SQLite en dev ?
  - ORM fortement typé, migrations, nested create/relations.
  - SQLite: simplicité locale; en prod → Postgres (changer `DATABASE_URL`).
- Pourquoi des clés techniques `pk` et des `id` “métier” uniques par parent ?
  - `pk` (cuid) facilite les relations et les migrations.
  - Unicité locale respecte le besoin métier: réutiliser “P1/A/1” dans d’autres dossiers.
- Pourquoi des DTO (`class-validator`) ?
  - Contrat d’entrée clair, validation automatique, sécurité (whitelist).
- Pourquoi React + Vite + TS ?
  - Dev rapide, HMR, typing strict, DX simple.

### Fonctionnement global (résumé)
- `make` → installe deps, crée `.env`, génère Prisma Client, applique migrations, lance back (3000) + front (5174).
- Flux utilisateur:
  - Liste (`GET /cases`) → recherche client.
  - Création (`POST /cases`) → validations UI (lame→bloc→prélèvement), ID dossier requis côté UI (généré côté API si omis).
  - Détail (`GET /cases/:id`) → graph hiérarchique.
  - Suppression (`DELETE /cases/:id`) → retour liste.

### Sécurité & prod
- CORS restrictifs en prod; Helmet; logs structurés; rate limiting si exposition publique.
- Secrets via variables d’environnement (pas de `.env` commit).
- Migrations en CI/CD: `prisma migrate deploy`.

### Performances & scalabilité
- Lecture: includes imbriqués (un seul roundtrip DB) — OK pour volume modéré.
- Évolutions:
  - Pagination/filtrage serveur pour `/cases`.
  - Index DB sur colonnes de recherche si nécessaire.

### Tests
- Unit tests service (Nest) pour la logique (unicité, erreurs 404/400).
- Test e2e minimal: POST puis GET, puis DELETE.
- Front: tests de composants clés (validation du formulaire de création).

### Améliorations possibles (roadmap)
- Édition d’un dossier:
  - API: `PUT /cases/:id` (remplacement complet), transaction Prisma (deleteMany + recreate).
  - Front: route `/edit/:id`, préremplir `CaseCreate`, bouton “Enregistrer”.
- UX:
  - Indicateur visuel “validé” (check) par section.
  - Accordéons pour blocs, tooltips d’aide.
- Observabilité:
  - Winston/Pino logs JSON, métriques basiques (p.ex. Prometheus).
- DX:
  - `make status/logs`, `make seed` (jeu de données).
  - Dockerfile + docker-compose (Postgres + app).
- Sécurité:
  - Auth simple (JWT) si besoin d’accès restreint.

### Questions pièges fréquentes (et réponses)
- “Pourquoi ne pas tout mettre dans un seul fichier JSON ?”
  - Concurrence/atomicté/évolutivité limitées; Prisma apporte contraintes, migrations, requêtes typées et robustesse quand le volume grandit.
- “Pourquoi générer l’ID du dossier côté API si l’UI l’exige ?”
  - Robuste pour intégrations/CLI/tests; l’UI impose un nom pour guider l’utilisateur, mais l’API reste souple.
- “Comment gérez-vous les doublons d’IDs ?”
  - Contraintes Prisma par parent (`@@unique`), et validations côté UI + messages clairs côté front.
- “Que se passe‑t‑il si on modifie le modèle ?”
  - Migrations Prisma; en dev `prisma migrate reset -f`, en prod `migrate deploy` + sauvegardes.
- “Comment prouver que c’est NestJS ?”
  - `NestFactory` dans `src/main.ts`, décorateurs `@Module/@Controller/@Injectable`, logs Nest au démarrage.


