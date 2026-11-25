@echo off
cd /d C:\liubendou-build
set npm_config_registry=https://registry.npmmirror.com
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
npx dsh plugin --profile web add github:advance-lion/dsh-brand >> plugins.out 2>&1
npx dsh plugin --profile web add dsh-theme-studio@2.0.0 >> plugins.out 2>&1
npx dsh plugin --profile web add dsh-ui-font@1.2.2 >> plugins.out 2>&1
npx dsh plugin --profile web add dsh-web-fetch@1.0.0 >> plugins.out 2>&1
npx dsh plugin --profile web add dsh-web-search@0.1.2 >> plugins.out 2>&1
npx dsh plugin --profile web add dsh-memory@0.1.0 >> plugins.out 2>&1
npx dsh plugin --profile web add @reserendipity/dsh-superagent@0.2.10 >> plugins.out 2>&1
npx dsh plugin --profile web add .\vendor\dsh-purge-community-1.6.85.tgz >> plugins.out 2>&1
echo DONE %ERRORLEVEL% >> plugins.out
