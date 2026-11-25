@echo off
cd /d C:\liubendou-build
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npm install --no-audit --no-fund --registry=https://registry.npmmirror.com > install.out 2> install.err
echo DONE %ERRORLEVEL% >> install.out
