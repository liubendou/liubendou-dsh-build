# 六本豆 dsh Windows 打包套件

一套可复现的 Windows 打包工程：安装官方 `@deepseek-ai/dsh`，注入六本豆品牌文案、配色与字体，再用 Electron 壳打包为 EXE。

## 使用

```powershell
npm install --no-audit --no-fund
node patch/apply-brand.mjs
npx electron-builder --win --x64
```

详见 `README-Windows.md`。

## 说明

只改品牌层，不改内核插件、工具、沙箱审批与 provider 配置。构建产物与依赖不入库。

## 许可

MIT
