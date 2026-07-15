# Etapa 1: BUILD
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Etapa 2: PRODUCCIÓN
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/index.js ./index.js
USER node
CMD ["node", "index.js"]