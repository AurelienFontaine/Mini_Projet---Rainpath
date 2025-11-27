
BACKEND := backend
FRONTEND := frontend
FRONTEND_PORT ?= 5174
# Default API URL for the frontend dev server (can override: VITE_API_URL=http://localhost:3001 make start)
VITE_API_URL ?= http://localhost:3000

.PHONY: make default setup migrate start lien data clean reset destroy re

default: make

## make: install deps, run migrations, start both servers and show links
make: setup migrate start lien

## setup: install Node dependencies for backend and frontend
setup:
	@echo "Installing dependencies..."
	cd $(BACKEND) && npm install
	cd $(FRONTEND) && npm install
	@# Provision default .env if absent (SQLite)
	@cd $(BACKEND) && [ -f .env ] || (echo 'DATABASE_URL="file:./dev.db"' > .env && echo "Created backend/.env")

## migrate: generate Prisma client and apply dev migrations (SQLite)
migrate:
	@echo "Generating Prisma client and applying migrations..."
	cd $(BACKEND) && npx prisma generate
	cd $(BACKEND) && npx prisma migrate dev -n init

## start: start backend (port 3000) and frontend (configurable port) in background
start:
	@echo "Starting backend (3000) and frontend ($(FRONTEND_PORT))..."
	@cd $(BACKEND) && (npm run start:dev > .backend.log 2>&1 & echo $$! > .backend.pid)
	@cd $(FRONTEND) && (VITE_API_URL=$(VITE_API_URL) npm run dev -- --port $(FRONTEND_PORT) --host > .frontend.log 2>&1 & echo $$! > .frontend.pid)
	@sleep 1

## lien: print helpful URLs
lien:
	@echo "Backend API:      http://localhost:3000"
	@echo "Frontend (Vite):  http://localhost:$(FRONTEND_PORT)"

## data: open Prisma Studio to inspect the database
data:
	cd $(BACKEND) && npx prisma studio

## clean: stop background servers and clean PIDs; also free common ports
clean:
	@echo "Stopping background servers (if any)..."
	-@[ -f $(BACKEND)/.backend.pid ] && kill -9 `cat $(BACKEND)/.backend.pid` 2>/dev/null || true
	-@[ -f $(FRONTEND)/.frontend.pid ] && kill -9 `cat $(FRONTEND)/.frontend.pid` 2>/dev/null || true
	-@rm -f $(BACKEND)/.backend.pid $(FRONTEND)/.frontend.pid
	-@lsof -ti:3000 -sTCP:LISTEN | xargs -r kill -9 2>/dev/null || true
	-@lsof -ti:5173 -sTCP:LISTEN | xargs -r kill -9 2>/dev/null || true
	-@lsof -ti:5174 -sTCP:LISTEN | xargs -r kill -9 2>/dev/null || true
	@echo "Clean done."

## reset: drop and recreate schema (Prisma) – wipes all data
reset:
	@echo "Dropping and recreating schema with Prisma (this will erase data)..."
	cd $(BACKEND) && npx prisma migrate reset -f

## destroy: hard wipe of local state (stop servers, drop DB schema, remove DB file)
destroy: clean
	@echo "Resetting database schema with Prisma..."
	-@cd $(BACKEND) && npx prisma migrate reset -f
	@echo "Removing local SQLite database file..."
	-@rm -f $(BACKEND)/dev.db
	@echo "Local database wiped. Run 'make start' (or 'make') to recreate schema."

## re: clean then make
re: clean make


