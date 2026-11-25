# 六本豆专属 dsh · Windows 打包脚本
# 在 Windows 10/11 + Node.js >= 20 上运行；产物在 .\dist\
$ErrorActionPreference = "Stop"

Write-Host "== 1/3 安装依赖 ==" -ForegroundColor Cyan
if (Test-Path pnpm-lock.yaml) { pnpm install } else { npm install --no-audit --no-fund }

Write-Host "== 2/3 注入六本豆 UI（标题 / 品牌 / 配色令牌） ==" -ForegroundColor Cyan
node patch/apply-brand.mjs

Write-Host "== 2.5/3 注册随包私密插件 ==" -ForegroundColor Cyan
npx dsh plugin --profile web add (Resolve-Path .\vendor\dsh-purge-community-1.6.85.tgz).Path

Write-Host "== 3/3 打包 Windows EXE ==" -ForegroundColor Cyan
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
npx electron-builder --win --x64

Write-Host "`n完成，产物：" -ForegroundColor Green
Get-ChildItem .\dist -Filter *.exe | ForEach-Object { "  $($_.FullName)  ($([math]::Round($_.Length/1MB,1)) MB)" }
Write-Host "`n首次运行前建议先在终端执行一次 npx dsh web 生成 %USERPROFILE%\.dsh\ 目录，然后关掉再双击 EXE。" -ForegroundColor Yellow
