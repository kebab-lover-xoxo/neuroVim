FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages packages
COPY apps apps
COPY server server

RUN corepack enable && corepack pnpm install --frozen-lockfile
RUN corepack pnpm --filter @mnemo/core run build
RUN corepack pnpm --filter @mnemo/web run build
RUN corepack pnpm --filter @mnemo/ui run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/packages/ui/dist ./public
COPY --from=builder /app/apps/web/dist ./apps/web/dist

EXPOSE 3000
CMD ["node", "server/index.js"]
