# Etapa de Build
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

# Etapa de Produção
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npm ci --production

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm start"]