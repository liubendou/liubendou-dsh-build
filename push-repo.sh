#!/usr/bin/env bash
# 建私有仓库并触发 Actions（需要已授权的 gh）
set -euo pipefail
REPO="${1:-liubendou-dsh}"
gh repo create "$REPO" --private --source . --remote origin --push
echo "已推送到私有仓库 $REPO，Actions 开始构建。"
echo "查看: gh run watch --repo $(gh api user -q .login)/$REPO"
echo "取回: gh run download --repo $(gh api user -q .login)/$REPO -n liubendou-dsh-win -D ./artifacts"
