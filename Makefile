compose_dev = docker compose \
								-f docker-compose.base.yml \
								-f docker-compose.dev.yml \
								-p richard-burton-dev \
								--env-file .env.development.local \
								up --build	

compose_prod = docker compose \
								-f docker-compose.base.yml \
								-f docker-compose.prod.yml \
								-p richard-burton-prod \
								--env-file .env.production.local \
								up --build				

dev:
	$(compose_dev)

dev_frontend:
	$(compose_dev) nextjs

dev_backend:
	$(compose_dev) phoenix db

dev_phoenix:
	$(compose_dev) phoenix

prod:
	$(compose_prod)

prod_frontend:
	$(compose_prod) nextjs

prod_backend:
	$(compose_prod) phoenix db

prod_phoenix:
	$(compose_prod) phoenix
