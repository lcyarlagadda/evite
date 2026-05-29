# Multi-stage build — Node.js (open source) + Alpine Linux
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html guests.html vite.config.js ./
COPY public ./public
COPY src ./src
COPY lib ./lib
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY server ./server
COPY lib ./lib

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["node", "server/index.js"]
