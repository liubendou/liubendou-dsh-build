# 建私有仓库并触发 Actions（需要已授权的 gh）
param([string]$Repo = "liubendou-dsh")
$ErrorActionPreference = "Stop"
gh repo create $Repo --private --source . --remote origin --push
Write-Host "已推送到私有仓库 $Repo，Actions 开始构建。" -ForegroundColor Green
Write-Host "取回产物: gh run download -n liubendou-dsh-win -D .\artifacts"
