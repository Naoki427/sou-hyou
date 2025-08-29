# ---- deps: 共通依存をキャッシュ ----
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app

# ワークスペースのメタ情報と server の package.json だけコピー
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/server/package.json packages/server/

# 依存をインストール（devDeps 含む） → build ステージ用
RUN pnpm install --frozen-lockfile

# ---- build: TypeScript をコンパイル ----
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app

# 全体コピーして build 実行
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# server パッケージを build (tsc)
RUN pnpm -F @sou-hyou/server build

# ---- deploy: 本番用の最小成果物を作成 ----
FROM node:20-alpine AS deploy
RUN corepack enable
WORKDIR /app

# server の package.json と lockfile をコピー
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/server/package.json packages/server/

# 本番依存だけインストール
RUN pnpm install --prod --filter @sou-hyou/server --frozen-lockfile

# build 成果物をコピー
COPY --from=build /app/packages/server/dist ./dist
# GraphQL スキーマなど静的ファイルも必要ならコピー
COPY packages/server/src/graphql ./dist/src/graphql

# ---- runner: 実行ステージ ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# deploy 成果物をコピー
COPY --from=deploy /app .

EXPOSE 4000
CMD ["node", "dist/index.js"]
