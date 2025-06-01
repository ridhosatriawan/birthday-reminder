# preparation
FROM node:24-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

# build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# runtime
FROM node:24-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]