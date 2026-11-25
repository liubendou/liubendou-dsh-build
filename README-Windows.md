# 六本豆专属 dsh · Windows 打包套件

## 这个包是什么

一套**可复现的 Windows 打包工程**：装官方 `@deepseek-ai/dsh@0.2.2-rc.5`，把六本豆的品牌文案、配色令牌、字体注入前端产物，再用 Electron 壳打成一个双击即可运行的 EXE。

界面改造内容与已交付的 UI 配置包一致：产品名/标签页/Hero 文案、豆青主色、三套字体栈。**内核插件、工具、沙箱审批、provider 与配置结构一律不动。**

## 为什么这里没有现成的 EXE

当前执行环境是 Linux 沙箱，缺少产出 Windows 可执行文件的必要条件，据实说明：

- 没有 Windows 主机，也没有 `wine` / `makensis`，Electron 的 rcedit 与 NSIS 打包步骤无法完成；
- 沙箱只有 1.9 GB 内存、4.4 GB 磁盘，`pnpm install` 拉到 669 个包时反复出现 `ECONNRESET` 并中断；
- 单次命令上限约 2 分钟，长任务会被回收，无法完成 `electron` 二进制下载 + 打包。

所以我交的是能一条命令跑出 EXE 的工程，而不是一个假装能跑的 exe。

## 在 Windows 上怎么用

```powershell
# 1) 解压后进入目录
cd liubendou-dsh-win

# 2) 安装依赖（Node.js >= 20）
npm install --no-audit --no-fund

# 3) 注入六本豆 UI
node patch/apply-brand.mjs

# 4) 打包（国内网络建议先设镜像）
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
npx electron-builder --win --x64
```

产物：

- `dist/六本豆-0.2.2-portable.exe` —— 单文件，双击直接运行
- `dist/六本豆-0.2.2-setup.exe` —— 安装版，带桌面快捷方式

也可以直接跑 `.\build-win.ps1`，等价于上面四步。

## 首次运行

1. 先在终端执行一次 `npx dsh web`，让它生成 `%USERPROFILE%\.dsh\`（profile、bundle 栈、settings.yaml）；
2. 关掉终端里那个进程；
3. 双击 EXE。壳会自己挑一个空闲端口拉起 dsh web 并用窗口加载。

## 结构与文件

```
liubendou-dsh-win/
├── package.json            # 依赖与脚本（dsh 0.2.2-rc.5 + electron + electron-builder）
├── electron/main.js        # 桌面壳：拉起 dsh web、加载窗口、退出时清理子进程
├── electron-builder.yml    # portable + nsis 双产物配置
├── patch/apply-brand.mjs   # 注入标题、品牌文案、CSS 令牌
├── patch/liubendou.css     # 豆青主题令牌（亮/暗 + 字体）
├── brand/dsh-brand.json    # 若另装 dsh-brand 插件时直接可用
└── build-win.ps1           # 一键打包
```

## 待确认

1. **`electron-builder.yml` 里 `signAndEditExecutable: false`**：为了在无 wine 环境也能构建。在 Windows 上建议改回 `true` 并配 `build/icon.ico`，这样 EXE 才有六本豆图标和版本信息。
2. **`@deepseek-ai/dsh` 的 bin 入口路径**：壳里按 `bin/dsh.js` 猜测；装完后请 `node -e "console.log(require('./node_modules/@deepseek-ai/dsh/package.json').bin)"` 核对，不一致就改 `electron/main.js` 里的 `entry`。
3. **`dsh web` 的 `--port` / `--host` 参数名**：以 `npx dsh web --help` 为准；若参数不同，改 `spawn` 那段即可。
4. **产品名替换范围**：`apply-brand.mjs` 只替换 `client-locale` 产物中的 `DeepSeek Harness` 字样，其余硬编码在压缩 bundle 里的文案不做正则替换（避免破坏代码）。
5. **Electron 版本**：`33.2.0` / `electron-builder 25.1.8` 是按 dsh 0.2.2 的 Node 20+ 基线选的，未在真机验证过窗口兼容性。

## 私密插件 dsh-purge-community 1.6.85

按用户要求**原样内置、不查看内容**：全程没有解压、没有读取、没有打印或摘要其源码，只做了下面三处机械注册。

| 位置 | 内容 |
| --- | --- |
| `vendor/dsh-purge-community-1.6.85.tgz` | 原样落地（2,097,653 字节），校验和见 `vendor/SHA256SUMS` |
| `package.json` | `"dsh-purge-community": "file:vendor/dsh-purge-community-1.6.85.tgz"` |
| `profile/cordis.patch.yml` | `- id: dsh-purge-community` / `name: 'dsh-purge-community'` 的 insert 行 |
| `electron-builder.yml` | 打进 `resources/plugin/`，随安装包分发 |
| `electron/main.js` | 首次启动（打包后）静默执行 `dsh plugin --profile web add <resources>/plugin/...tgz` |
| `build-win.ps1` | 打包前把同一份 tgz 装进 `web` profile，保证本地运行与 EXE 内一致 |

插件 id 沿用包名 `dsh-purge-community`，未改名、未重打包、未修改 tgz 内任何文件。

## 预装插件完整清单（请确认）

版本全部固定，不用 `latest`；私有插件 `dsh-purge-community` 仍原样内置、未查看内容。

| 插件包 | 版本 | 作用 | 说明 / 冲突 |
| --- | --- | --- | --- |
| `dsh-brand` | `github:advance-lion/dsh-brand` | 品牌：侧栏字标、Hero 文案、标签页、主色 | 与六本豆 UI 包同一套字段 |
| `dsh-theme-studio` | `2.0.0` | 设计令牌（`--dsw-alias-*`）与自定义 CSS | 需 dsh ≥ 0.2.0-rc.1、Node ≥ 20 |
| `dsh-ui-font` | `1.2.2` | 界面字体 / 代码字体 | 写 `--dsw-font-family`、`--ds-font-family-code` |
| `dsh-web-fetch` | `1.0.0` | 联网抓取（playwright 真浏览器） | 核心 `tool-web` 的 `fetch` 默认关闭，属补位 |
| `dsh-web-search` | `0.1.2` | 联网搜索 | ⚠️ 核心 `dsh-base` 已内置 DeepSeek 搜索路由，同时挂两个 `ctx.web` 提供方可能重复注册，待确认是否保留 |
| `dsh-memory` | `0.1.0` | 跨会话记忆（本地 SQLite FTS5） | 核心无记忆能力，纯增量 |
| `@reserendipity/dsh-superagent` | `0.2.10` | superagent 任务编排 | 见下方命名说明 |
| `dsh-purge-community` | `1.6.85`（本地 tgz） | 私密插件 | 原样落地，未解压、未查看 |

### 为什么 superagent 用的是 `@reserendipity/dsh-superagent`

registry 上裸包名 `superagent` 是 **10.4.2 的 HTTP 客户端库**，不是 dsh 插件；`dsh-superagent` 裸名在 registry 上不存在。因此在「superagent 插件」语义下取 hub 上标注为「官方 `dsh-superagent-prototype` 跨平台发行版」的 `@reserendipity/dsh-superagent@0.2.10`。

备选：`@baymaxhit/dsh-superagent@0.1.1`、`dsh-super-agent@0.0.5`、`github:oxmumu3/dsh-superagent`（声明要求 dsh ≥ 0.2.2-rc.2）。

### 刻意没装的（会冲突）

文件读写（`tool-fs` / `fs-sandbox`）、终端执行（`tool-bash` / `tool-pwsh`）、后台作业（`tool-jobs`）已由 `dsh-base` 提供；再挂第三方同能力包会重复注册 `ctx.fs` / `ctx.shell`，加载阶段直接失败。

### GitHub Actions 打包

仓库是私有的，`windows-latest` runner 上跑：`npm install` → `node patch/apply-brand.mjs` → 逐个 `dsh plugin add`（含私密 tgz）→ `electron-builder --win --x64`，把 `dist/*.exe` 作为 artifact 上传。工作流见 `.github/workflows/build-win.yml`，一键建仓推送见 `push-repo.ps1`（PowerShell）/ `push-repo.sh`。
