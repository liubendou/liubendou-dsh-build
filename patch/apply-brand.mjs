#!/usr/bin/env node
// 六本豆 UI 注入脚本：在安装好的 dsh 前端产物上打品牌与配色补丁。
// 只改 UI 资源（标题、品牌文案、CSS 令牌），不动任何插件配置结构。
// 用法: node patch/apply-brand.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const nm = join(root, 'node_modules', '@deepseek-ai');
const BRAND = '六本豆';
const css = readFileSync(join(here, 'liubendou.css'), 'utf8');
const report = { patched: [], skipped: [], warnings: [] };

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// 1) HTML 标题
const htmlFiles = walk(nm).filter((f) => /(^|\/)(index|app)\.html?$/.test(f));
if (!htmlFiles.length) report.warnings.push('未找到 index.html，标题未改');
for (const f of htmlFiles) {
  const before = readFileSync(f, 'utf8');
  const after = before
    .replace(/<title>[^<]*<\/title>/i, `<title>${BRAND}</title>`)
    .replace(/(<meta[^>]+name=["']apple-mobile-web-app-title["'][^>]+content=["'])[^"']*/i, `$1${BRAND}`);
  if (after !== before) { writeFileSync(f, after); report.patched.push(f); } else report.skipped.push(f);
}

// 2) 前端 CSS 令牌
const cssFiles = walk(nm).filter((f) => /client-ui-theme.*\.css$|base\.css$/.test(f));
if (!cssFiles.length) report.warnings.push('未找到 client-ui-theme 的 CSS，配色未写入');
for (const f of cssFiles) {
  const before = readFileSync(f, 'utf8');
  if (before.includes('六本豆专属 · 注入')) { report.skipped.push(f); continue; }
  writeFileSync(f, `${before}\n\n/* 六本豆专属 · 注入 */\n${css}\n`);
  report.patched.push(f);
}

// 3) 产品名文案（仅 locale 产物里的英文产品名）
const localeFiles = walk(nm).filter((f) => /client-locale.*\.(js|json|mjs)$/.test(f));
for (const f of localeFiles) {
  const before = readFileSync(f, 'utf8');
  const after = before.replaceAll('DeepSeek Harness', BRAND).replaceAll('DeepSeek 深度求索', BRAND);
  if (after !== before) { writeFileSync(f, after); report.patched.push(f); } else report.skipped.push(f);
}

console.log(JSON.stringify(report, null, 2));
if (report.warnings.length) console.warn('\n注意:', report.warnings.join('; '));
