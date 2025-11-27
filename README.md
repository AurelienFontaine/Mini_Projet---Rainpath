## Rainpath

Application de démonstration pour modéliser et afficher la hiérarchie d’une biopsie en anatomopathologie.
Hiérarchie: Dossier → Prélèvements → Blocs → Lames (avec coloration).

Stack:
- Backend: NestJS + Prisma + SQLite
- Frontend: React + TypeScript (Vite)
- Makefile: automatisation (install, migrations, démarrage, liens, studio, nettoyage)

### Arborescence
```
Rainpath/
  backend/            # API NestJS + Prisma (SQLite)
    prisma/           # schéma + migrations
    src/
    README.md
  frontend/           # App React (Vite)
    src/
    README.md
  Makefile            # automatisation
  README.md           # ce guide
```

## Prérequis
- Node.js >= 18
- npm >= 9
- Optionnel: `curl` pour tester l’API

## Démarrage rapide (recommandé)

```bash
make
```

Cela installe les dépendances, applique/génère les migrations Prisma, démarre backend et frontend en arrière‑plan, puis affiche les liens.

Liens par défaut:
- API backend: http://localhost:3000
- Frontend:    http://localhost:5174 (port fixe)

Commandes Make utiles:
- `make lien`    → réimprime les URLs utiles
- `make data`    → ouvre Prisma Studio
- `make clean`   → stoppe les serveurs et libère les ports (3000/5174)
- `make destroy` → clean + supprime la base locale (backend/dev.db)
- `make re`      → clean puis make

## Endpoints (résumé)
- `GET /cases`        → liste des dossiers
- `GET /cases/:id`    → détail hiérarchique
- `POST /cases`       → création d’un dossier complet
- `DELETE /cases/:id` → suppression du dossier

Exemple de payload POST (création) : voir `backend/README.md`.

---

## Frontend
Pages principales:
- `Dossiers` (liste + recherche)
- `Créer un dossier` (formulaire imbriqué avec “Valider / Modifier”)
- `Dossier` (vue hiérarchique + suppression)

---

## Dépannage
- Port déjà utilisé (EADDRINUSE): `make clean` puis `make`.
- Front 5174 remappé par l’IDE: ouvre manuellement `http://localhost:5174`.
- Erreurs Prisma/migrations en dev: `make destroy` puis `make`.

---

## Docs détaillées
- Backend: `backend/README.md`
- Frontend: `frontend/README.md`


