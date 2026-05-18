.DEFAULT_GOAL := help

DOCKER_COMPOSE ?= docker compose

PYTHON ?= python3
VENV ?= .venv
PIP := $(VENV)/bin/pip
PY := $(VENV)/bin/python
UVICORN := $(VENV)/bin/uvicorn
ALEMBIC := $(VENV)/bin/alembic
ARQ := $(VENV)/bin/arq

FRONTEND_DIR := frontend
NPM := npm

.PHONY: help venv install install-backend install-frontend \
	dev-api dev-api-py dev-worker dev-web \
	db-current db-history migrate downgrade \
	infra-up infra-down infra-logs full-up full-down compose-logs up down \
	lint-web build-web build-web-prod \
	clean clean-venv

help: ## Hedefleri listele
	@echo "VectorDock — make <hedef>"
	@echo ""
	@echo "Kurulum:"
	@echo "  venv install-backend install-frontend install"
	@echo ""
	@echo "Yerel (venv + Postgres/Redis için: make infra-up, .env’de DATABASE_URL)"
	@echo "  dev-api dev-api-py dev-worker dev-web"
	@echo ""
	@echo "Veritabanı:"
	@echo "  migrate downgrade db-current db-history"
	@echo ""
	@echo "Docker Compose:"
	@echo "  infra-up infra-down infra-logs — sadece postgres + redis"
	@echo "  full-up full-down compose-logs — tüm stack (api, worker, web, migrate)"
	@echo "  up down — full-up / full-down kısayolu"
	@echo ""
	@echo "Frontend:"
	@echo "  lint-web build-web build-web-prod"
	@echo ""
	@echo "Temizlik:"
	@echo "  clean clean-venv"

venv: $(VENV)/bin/python ## Sanal ortam oluştur

$(VENV)/bin/python:
	$(PYTHON) -m venv $(VENV)

install-backend: venv ## requirements.txt yükle
	$(PIP) install -U pip
	$(PIP) install -r requirements.txt

install-frontend: ## frontend bağımlılıkları (npm ci)
	cd $(FRONTEND_DIR) && $(NPM) ci

install: install-backend install-frontend ## Backend + frontend kurulum

dev-api: ## API: uvicorn --reload (:8000)
	$(UVICORN) app.main:app --host 0.0.0.0 --port 8000 --reload

dev-api-py: ## API: python main.py (aynısı)
	$(PY) main.py

dev-worker: ## arq işçisi
	$(ARQ) app.workers.settings.WorkerSettings

dev-web: ## Next.js dev (Turbopack; frontend dizini)
	cd $(FRONTEND_DIR) && $(NPM) run dev

db-current: ## Alembic mevcut revizyon
	$(ALEMBIC) current

db-history: ## Alembic geçmiş
	$(ALEMBIC) history

migrate: ## Alembic upgrade head (DATABASE_URL gerekli)
	$(ALEMBIC) upgrade head

downgrade: ## Bir revizyon geri (DATABASE_URL gerekli)
	$(ALEMBIC) downgrade -1

infra-up: ## Sadece postgres + redis (-d)
	$(DOCKER_COMPOSE) up -d postgres redis

infra-down: ## postgres + redis kapat (volume korunur; tam kapanış: full-down)
	$(DOCKER_COMPOSE) stop postgres redis

infra-logs: ## postgres + redis günlükleri
	$(DOCKER_COMPOSE) logs -f postgres redis

full-up: ## Tüm servisleri ayağa kaldır (build ile)
	$(DOCKER_COMPOSE) up --build

full-down: ## Tüm servisleri ve ağları kapat
	$(DOCKER_COMPOSE) down

up: full-up ## full-up kısayolu

down: full-down ## full-down kısayolu

compose-logs: ## Tüm compose servis günlükleri
	$(DOCKER_COMPOSE) logs -f

lint-web: ## ESLint (frontend)
	cd $(FRONTEND_DIR) && $(NPM) run lint

build-web: ## next build —turbopack
	cd $(FRONTEND_DIR) && $(NPM) run build

build-web-prod: ## production next build (--turbopack yok)
	cd $(FRONTEND_DIR) && $(NPM) run build:prod

clean: ## .next ve frontend node_modules
	rm -rf $(FRONTEND_DIR)/.next $(FRONTEND_DIR)/node_modules

clean-venv: ## .venv klasörünü sil
	rm -rf $(VENV)
