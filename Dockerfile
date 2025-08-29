# ---- deps: 依存の取得 ----
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app

# ワークスペースのメタと server の package.json だけ先にコピー
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/server/package.json packages/server/

# 依存を取得（キャッシュ効きやすい）
RUN pnpm install --filter @sou-hyou/server --frozen-lockfile

# ---- build: dist を作る ----
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# devDependencies 含めてビルド
RUN pnpm install --filter @sou-hyou/server --frozen-lockfile
RUN pnpm -F @sou-hyou/server build

# ---- deploy: 本番用の最小パッケージを作る ----
FROM node:20-alpine AS deploy
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/server/package.json packages/server/

# 本番依存だけ解決して /out に吐き出し
RUN pnpm install --filter @sou-hyou/server --prod --frozen-lockfile
RUN mkdir -p /out
RUN cp -r packages/server/package.json node_modules /out/

# ビルド成果物を合流
COPY --from=build /app/packages/server/dist /out/dist
# GraphQL スキーマなど静的ファイルも必要ならコピー
COPY packages/server/src/graphql /out/dist/src/graphql

# ---- runner: 実行ステージ ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deploy /out .
EXPOSE 4000
CMD ["node", "dist/index.js"]
