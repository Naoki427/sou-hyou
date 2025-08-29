# ---- deps: 依存の取得とデプロイ成果物作成 ----
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app

# ワークスペースのメタと server の package.json だけ先にコピー
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/server/package.json packages/server/

# 依存を取得（キャッシュ効きやすい）
RUN pnpm fetch --filter @sou-hyou/server

# ---- build: dist を作る ----
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app
COPY . .
# オフラインで server だけインストール（fetch 済）
RUN pnpm install --filter @sou-hyou/server --frozen-lockfile
RUN pnpm -F @sou-hyou/server build

# ---- deploy: 本番用の最小パッケージを作る ----
FROM node:20-alpine AS deploy
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/server/package.json packages/server/
RUN pnpm fetch --filter @sou-hyou/server
# /out に「単独で動く」node_modules+package一式を出力
RUN pnpm deploy --filter @sou-hyou/server --prod /out
# ビルド成果物を合流
COPY --from=build /app/packages/server/dist /out/dist

# ---- runner: 実行ステージ ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# deploy で作られた自己完結の成果物をコピー
COPY --from=deploy /out .
COPY packages/server/src/graphql ./dist/src/graphql
EXPOSE 4000
CMD ["node", "dist/index.js"]
