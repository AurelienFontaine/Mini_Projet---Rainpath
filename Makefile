SHELL := /bin/bash

BACKEND := backend
FRONTEND := frontend

.PHONY: make default setup migrate start lien data clean destroy re

default: make

## make: install deps, run migrations, start both servers and show links
make: setup migrate start lien

## setup: install Node dependencies for backend and frontend
setup:
	@echo "Installing dependencies..."
	cd $(BACKEND) && npm install
	cd $(FRONTEND) && npm install

## migrate: generate Prisma client and apply dev migrations (SQLite)
migrate:
	@echo "Generating Prisma client and applying migrations..."
	cd $(BACKEND) && npx prisma generate
	cd $(BACKEND) && npx prisma migrate dev -n init

## start: start backend (port 3000) and frontend (fixed port 5174) in background
start:
	@echo "Starting backend (3000) and frontend (5174)..."
	@cd $(BACKEND) && (npm run start:dev > .backend.log 2>&1 & echo $$! > .backend.pid)
	@cd $(FRONTEND) && (npm run dev -- --port 5174 > .frontend.log 2>&1 & echo $$! > .frontend.pid)
	@sleep 1

## lien: print helpful URLs
lien:
	@echo "Backend API:      http://localhost:3000"
	@echo "Frontend (Vite):  http://localhost:5174  (port fixe)"

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

## destroy: clean and delete local SQLite database
destroy: clean
	@echo "Removing local SQLite database..."
	-@rm -f $(BACKEND)/dev.db
	@echo "Database removed."

## re: clean then make
re: clean make


