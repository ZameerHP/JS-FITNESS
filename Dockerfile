# Multi-stage Dockerfile for JS FITNESS INC (Client + Server)
FROM node:20-alpine AS builder

WORKDIR /app

# Install client dependencies & build static bundle
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client ./client
RUN cd client && npm run build

# Install server dependencies & build TypeScript
COPY server/package*.json ./server/
RUN cd server && npm ci

COPY server ./server
RUN cd server && npx prisma generate && npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma

RUN mkdir -p /app/server/uploads

WORKDIR /app/server
EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
