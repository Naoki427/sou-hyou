# ===== build: TypeScript をコンパイル =====
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /repo

COPY . .
RUN pnpm install -r --frozen-lockfile

RUN node node_modules/typescript/bin/tsc -p packages/server/tsconfig.json

# ===== pack: server 単体の実行物を作成（prod依存のみ） =====
FROM node:20-alpine AS pack
RUN corepack enable
WORKDIR /repo

COPY --from=build /repo /repo
RUN pnpm -C packages/server deploy --prod /out
RUN mkdir -p /out/dist
COPY --from=build /repo/packages/server/dist /out/dist
RUN test -d /repo/packages/server/src/graphql && \
    mkdir -p /out/dist/src && \
    cp -r /repo/packages/server/src/graphql /out/dist/src/graphql || true

# ===== runner: 本番実行（最小） =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=pack /out .

RUN node -e "try{require('fs').accessSync('node_modules/dotenv')}catch(e){process.exit(1)}" || \
    (echo 'Installing dotenv for runtime...' && corepack enable && pnpm add dotenv@^17 --prod)

EXPOSE 4000
CMD ["node", "dist/index.js"]
