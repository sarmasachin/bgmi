#!/usr/bin/env bash
# Deploy + keep Next.js alive on :3001 via PM2 (fixes nginx 502 after rebuild).
# Website + admin are the same Next.js app. Run DB schema push before build.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/bgmi}"
cd "$APP_DIR"

echo "==> Pull"
git pull origin main

echo "==> Install"
npm install --omit=dev

echo "==> Prisma generate + DB schema push"
npx prisma generate
npx prisma db push

echo "==> Build"
npm run build

echo "==> Ensure PM2"
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "==> Stop stray process on 3001 (if any)"
fuser -k 3001/tcp 2>/dev/null || true
sleep 1

echo "==> Start / reload with PM2"
if pm2 describe bgmi >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo "==> Health check"
sleep 2
ss -tlnp | grep 3001 || true
curl -I --max-time 5 http://127.0.0.1:3001 || true
pm2 status
echo "==> Done"
