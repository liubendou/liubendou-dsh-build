@echo off
cd /d C:\liubendou-build
rmdir /s /q dist
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npx --no-install electron-builder --win portable --x64 > builder.out 2> builder.err
echo DONE %ERRORLEVEL% >> builder.out
