dev:
	docker compose \
		-f docker-compose.base.yml \
		-f docker-compose.dev.yml \
		-p richard-burton-dev \
		--env-file .env.development.local \
		up --build
prod:
	docker compose \
		-f docker-compose.base.yml \
		-f docker-compose.prod.yml \
		-p richard-burton-prod \
		--env-file .env.production.local \
		up --build