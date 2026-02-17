FROM node:20-slim AS deps
WORKDIR /app

# Workspace metadata (required)
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Backend manifest
COPY backend/package.json backend/

RUN corepack enable && pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY backend ./backend
RUN pnpm --filter backend build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY backend/package.json backend/

RUN corepack enable && pnpm install --prod --filter backend --frozen-lockfile

COPY --from=build /app/backend/dist ./backend/dist

EXPOSE 8080
CMD ["node", "backend/dist/server.js"]
