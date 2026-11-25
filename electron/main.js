// å…­æœ¬è±†ä¸“å±ž dsh æ¡Œé¢å£³ï¼šæ‹‰èµ·æœ¬æœº dsh web æœåŠ¡ï¼Œç”¨çª—å£åŠ è½½å®ƒã€‚
// ä¸æ”¹å†…æ ¸æ’ä»¶ä¸Žé…ç½®ç»“æž„ï¼›å“ç‰Œä¸Žé…è‰²ç”± patch/apply-brand.mjs åœ¨å®‰è£…åŽå†™å…¥ã€‚
const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const http = require('node:http');

const TITLE = 'å…­æœ¬è±†';
let serverProc = null;

function freePort() {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

function waitForServer(port, timeoutMs = 90000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get({ host: '127.0.0.1', port, path: '/' }, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) reject(new Error('dsh web å¯åŠ¨è¶…æ—¶'));
        else setTimeout(tick, 700);
      });
    };
    tick();
  });
}

// é¦–æ¬¡è¿è¡Œæ—¶æŠŠéšåŒ…æºå¸¦çš„ç§å¯†æ’ä»¶æ³¨å†Œè¿› profileï¼ˆåªå®‰è£…ï¼Œä¸è§£æžå…¶å†…å®¹ï¼‰
function ensureBundledPlugin() {
  return new Promise((resolve) => {
    if (!app.isPackaged) return resolve();
    const tgz = path.join(process.resourcesPath, 'plugin', 'dsh-purge-community-1.6.85.tgz');
    const dshEntry = path.join(process.resourcesPath, 'dsh', 'lib', 'bin.js');
    const child = spawn(process.execPath, [dshEntry, 'plugin', '--profile', 'web', 'add', tgz], {
      cwd: app.getPath('home'),
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
      stdio: 'ignore',
      windowsHide: true
    });
    child.on('exit', () => resolve());
    child.on('error', () => resolve());
  });
}

const PLUGIN_SPECS = ["github:advance-lion/dsh-brand", "dsh-theme-studio@2.0.0", "dsh-ui-font@1.2.2", "dsh-web-fetch@1.0.0", "dsh-web-search@0.1.2", "dsh-memory@0.1.0", "@reserendipity/dsh-superagent@0.2.10"];

// é¦–æ¬¡å¯åŠ¨æŠŠéšåŒ…æ’ä»¶è¡¥é½åˆ° web profileï¼ˆå¹‚ç­‰ï¼šåªè£…ç¼ºçš„ï¼‰
function installBundledPlugins() {
  return new Promise((resolve) => {
    if (!app.isPackaged) return resolve();
    const dshEntry = path.join(process.resourcesPath, 'dsh', 'lib', 'bin.js');
    const profilePkg = path.join(app.getPath('home'), '.dsh', 'profiles', 'web', 'package.json');
    let installed = {};
    try { installed = JSON.parse(require('node:fs').readFileSync(profilePkg, 'utf8')).dependencies || {}; } catch {}
    const tgz = path.join(process.resourcesPath, 'plugin', 'dsh-purge-community-1.6.85.tgz');
    const queue = PLUGIN_SPECS.filter((s) => !installed[s.split('@')[0]]).concat([tgz]);
    const run = () => {
      const spec = queue.shift();
      if (!spec) return resolve();
      const child = spawn(process.execPath, [dshEntry, 'plugin', '--profile', 'web', 'add', spec], {
        cwd: app.getPath('home'),
        env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
        stdio: 'ignore',
        windowsHide: true
      });
      child.on('exit', run);
      child.on('error', run);
    };
    run();
  });
}

async function createWindow() {
  // æ‰“åŒ…åŽ dsh åœ¨ resources/dsh é‡Œï¼›å¼€å‘æ—¶åœ¨ node_modules é‡Œ
  const dshHome = app.isPackaged
    ? path.join(process.resourcesPath, 'dsh')
    : path.join(__dirname, '..', 'node_modules', '@deepseek-ai', 'dsh');
  const entry = path.join(dshHome, 'lib', 'bin.js');
  const port = await freePort();

  serverProc = spawn(process.execPath, [entry, 'web', '--port', String(port), '--host', '127.0.0.1'], {
    cwd: app.getPath('home'),
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: 'ignore',
    windowsHide: true
  });

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: TITLE,
    backgroundColor: '#FAF8F2',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  win.setTitle(TITLE);

  try {
    await waitForServer(port);
  } catch (err) {
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(
      `<body style="font-family:system-ui;padding:40px"><h2>å…­æœ¬è±† å¯åŠ¨å¤±è´¥</h2><p>${err.message}</p>
       <p>è¯·ç¡®è®¤å·²å®‰è£…ä¾èµ–å¹¶é¦–æ¬¡è¿è¡Œè¿‡ <code>npx dsh web</code>ã€‚</p></body>`));
    return;
  }
  win.loadURL(`http://127.0.0.1:${port}/`);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(installBundledPlugins).then(createWindow);
app.on('window-all-closed', () => { if (serverProc) serverProc.kill(); app.quit(); });
app.on('quit', () => { if (serverProc) serverProc.kill(); });


