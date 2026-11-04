# Etapa de Build
FROM node:20-alpine as builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

# Etapa de Produção
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npm ci --production

EXPOSE 3333

# The server opens its port immediately. Migrations and seed run in the background, so a
# slow, paused or unreachable database can never keep the port closed (a silent service
# looks dead to the host and to visitors). Both steps are idempotent, `migrate deploy`
# takes an advisory lock, and a failure is only logged: /health/db and the 503 responses
# make the problem visible instead.
CMD ["sh", "-c", "(npx prisma migrate deploy && npx prisma db seed || echo '[boot] migrate/seed failed; server keeps running') & exec node dist/server.cjs"]