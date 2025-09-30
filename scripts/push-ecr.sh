#!/usr/bin/env bash

# このスクリプトはルートで実行すること

set -euo pipefail

# ====== .env 読み込み ======
ENV_FILE="./.env"
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

# ====== 設定 ======
IMAGE_TAG=$(git rev-parse --short HEAD)

# ====== ECRリポジトリが無ければ作成 ======
aws ecr create-repository \
  --repository-name ${REPO_NAME} \
  --region ${AWS_REGION} || true

# ====== ログイン ======
aws ecr get-login-password --region ${AWS_REGION} \
  | docker login --username AWS --password-stdin \
    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# ====== ビルド ======
docker build -t ${REPO_NAME}:${IMAGE_TAG} .

# latest タグもつけておく
docker tag ${REPO_NAME}:${IMAGE_TAG} \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}:${IMAGE_TAG}
docker tag ${REPO_NAME}:${IMAGE_TAG} \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}:latest

# ====== プッシュ ======
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}:${IMAGE_TAG}
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}:latest

echo "✅ Pushed: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}:${IMAGE_TAG}"