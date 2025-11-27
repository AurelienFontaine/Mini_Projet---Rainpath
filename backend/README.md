# Rainpath Backend (NestJS + Prisma)

API NestJS pour gérer des dossiers anatomopathologiques et leur hiérarchie (prélèvements → blocs → lames → coloration). Persistance via Prisma + SQLite.

## Prérequis
- Node.js >= 18
- npm >= 9

## Installation
```bash
cd backend
npm install
```

## Démarrage (dev)
```bash
npm run start:dev
```
L’API écoute par défaut sur `http://localhost:3000`.

## Build et exécution (prod)
```bash
npm run build
npm start
```

## Endpoints
- `GET /cases` — liste des dossiers
- `GET /cases/:id` — détail d’un dossier
- `POST /cases` — création d’un dossier complet
- `DELETE /cases/:id` — suppression d’un dossier

## Prisma
Commandes utiles:
```bash
# Après un clone
npm install

# Générer le client Prisma (si besoin)
npx prisma generate

# Appliquer les migrations (crée/maj la base file:./dev.db)
npx prisma migrate dev -n init

# Ouvrir Prisma Studio (UI)
npx prisma studio
```

Schéma: `prisma/schema.prisma`. La base locale par défaut est SQLite (`DATABASE_URL=file:./dev.db` dans `.env`).

Exemple de payload pour `POST /cases`:
```json
{
  "id": "CASE-001",
  "prelevements": [
    {
      "id": "P1",
      "blocs": [
        {
          "id": "A",
          "lames": [
            { "id": "1", "coloration": "HES" },
            { "id": "2", "coloration": "PAS" }
          ]
        }
      ]
    }
  ]
}
```
Si `id` est omis, un identifiant est généré automatiquement.

## Modèle & contraintes
- Clés primaires techniques (`pk`) pour prélevements/blocs/lames.
- Unicité “métier” par parent:
  - Prélevement unique par `(caseId, id)`
  - Bloc unique par `(prelevementPk, id)`
  - Lame unique par `(blocPk, id)`

## Notes d’architecture
- `CasesController`: endpoints REST.
- `CasesService`: logique métier + Prisma (includes imbriqués, nested create).
- DTO `class-validator` / `class-transformer`.
- `ValidationPipe` globale + CORS activés dans `main.ts`.


