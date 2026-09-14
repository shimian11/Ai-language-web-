#!/bin/bash
set -a
. /opt/ailang/server/.env 2>/dev/null
set +a
echo "== 用 .env 账号密码 登录 =="
RESP=$(curl -sk -X POST https://blog.where2go.xyz/api/auth/login \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")
echo "$RESP"
echo
echo "ADMIN_USERNAME=$ADMIN_USERNAME"