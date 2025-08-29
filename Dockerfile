# ===== build: TypeScript をコンパイル =====
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /repo

# monorepo 全体が必要（tsconfig.base / 共有pkg 参照のため）
COPY . .

# devDeps 含めて “全部” インストール（ここで失敗したら依存問題）
RUN pnpm install -r --frozen-lockfile

# --- 重要: スクリプト経由ではなく tsc を直叩き ---
# これで scripts/build に依存しない＆エラーも確実にログ化
RUN node node_modules/typescript/bin/tsc -p packages/server/tsconfig.json 2>&1 | tee /tmp/tsc.log

# ===== pack: 実行に必要なものだけを抽出（prod依存） =====
FROM node:20-alpine AS pack
RUN corepack enable
WORKDIR /repo

# build の成果と lock を持ってくる
COPY --from=build /repo /repo

# server 単体の prod 依存だけを /out に集約（pnpm v9 の deploy）
RUN pnpm -C packages/server deploy --prod /out

# dist を配置
RUN mkdir -p /out/dist
COPY --from=build /repo/packages/server/dist /out/dist

# GraphQL 等の静的アセットが必要なら（不要なら削除可）
# ※ ビルドで取り込んでない場合に限り
RUN test -d /repo/packages/server/src/graphql && \
    mkdir -p /out/dist/src && \
    cp -r /repo/packages/server/src/graphql /out/dist/src/graphql || true

# ===== runner: 本番実行（最小） =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# pack で自己完結した成果物（package.json + node_modules + dist）
COPY --from=pack /out .

# 本番でも dotenv を使うコードなら保険で注入（普段は dependencies へ移すのが本筋）
RUN node -e "try{require('fs').accessSync('node_modules/dotenv')}catch(e){process.exit(1)}" || \
    (echo 'Installing dotenv for runtime...' && corepack enable && pnpm add dotenv@^17 --prod)

EXPOSE 4000
CMD ["node", "dist/index.js"]
