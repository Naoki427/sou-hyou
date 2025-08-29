# ===== build: TypeScript をコンパイル =====
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /repo

# まず全体コピー（tsconfig.base や workspace 依存を含める）
COPY . .

# devDependencies 含めてインストール（tsc 等が必要）
# monorepo 前提でワークスペース全体を解決
RUN pnpm install -r --frozen-lockfile

# server パッケージをビルド（依存パッケージも含めて解決）
# 依存関係もビルド対象に含めたい場合は ... を付与
RUN pnpm --filter @sou-hyou/server... build


# ===== pack: server 単体の実行成果物を作成（prod依存のみ） =====
FROM node:20-alpine AS pack
RUN corepack enable
WORKDIR /repo

# build 結果とロックファイル類を持ってくる
COPY --from=build /repo /repo

# server パッケージだけを自己完結の形で /out にデプロイ（prod 依存のみ）
# pnpm v9 以降の deploy を使用
RUN pnpm -C packages/server deploy --prod /out

# ビルド済み dist を配置
RUN mkdir -p /out/dist
COPY --from=build /repo/packages/server/dist /out/dist

# GraphQL スキーマなど静的ファイルが必要なら同梱
# （必要なければこの行は消してOK）
COPY packages/server/src/graphql /out/dist/src/graphql


# ===== runner: 実行ステージ（最小） =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# ここで /out（package.json + node_modules + dist）が自己完結
COPY --from=pack /out .

# もし dist/index.js が `import "dotenv/config"` を含むなら、
# 本番でも必要になるので dotenv を runtime に入れる。
# （server の package.json で "dotenv" が dependencies にあるならこの行は不要）
RUN node -e "try{require('fs').accessSync('node_modules/dotenv')}catch(e){process.exit(1)}" || \
    (echo 'Installing dotenv for runtime...' && \
     corepack enable && pnpm add dotenv@^17 --prod)

EXPOSE 4000
CMD ["node", "dist/index.js"]
