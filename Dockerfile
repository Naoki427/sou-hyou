# ===== build: TypeScript をコンパイル =====
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app

# まず全体をコピー（ワークスペース依存も解決したいので丸ごと）
COPY . .

# devDependencies 含めてインストール（tsc 等が必要）
RUN pnpm install --frozen-lockfile

# server パッケージのみビルド（tsc）
RUN pnpm -F @sou-hyou/server build


# ===== runner: 本番実行用（prod 依存のみ） =====
FROM node:20-alpine AS runner
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

# prod 依存だけを再インストール（ワークスペース最小構成でOK）
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/server/package.json packages/server/
RUN pnpm install --prod --filter @sou-hyou/server --frozen-lockfile

# ビルド済みの dist を配置
COPY --from=build /app/packages/server/dist ./dist

# GraphQL スキーマなど静的ファイルが必要なら同梱
COPY packages/server/src/graphql ./dist/src/graphql

EXPOSE 4000
CMD ["node", "dist/index.js"]
