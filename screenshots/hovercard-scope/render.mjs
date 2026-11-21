/**
 * Render the before/after evidence for the hover-card single-child fix.
 *
 * This is a static reproduction, not a live DSH screenshot: it uses the real
 * `CSS_GLASS` template from `packages/glass/src/glass-css.js` and the real DOM
 * shapes of the host TurnUsagePanel and the dsh-rewind popover. The only
 * difference between "before" and "after" is the selector under test:
 *   `[role="dialog"] > div`  →  `[role="dialog"] > div:only-of-type`
 *
 * Run: CHROME=/path/to/chrome node screenshots/hovercard-scope/render.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CSS_GLASS } from '../../packages/glass/src/glass-css.js'

const here = dirname(fileURLToPath(import.meta.url))
const tmp = join(here, '.render-tmp')
const chrome = process.env.CHROME || '/home/slev/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'

const OLD_RULE = ':not(.we-perf-float) > div {'
const NEW_RULE = ':not(.we-perf-float) > div:only-of-type {'
const cssAfter = CSS_GLASS.replaceAll(OLD_RULE, NEW_RULE)
if (CSS_GLASS.split(OLD_RULE).length !== 3) throw new Error('expected exactly two hover-card rules')
if (cssAfter.includes(OLD_RULE)) throw new Error('after CSS still contains the broad selector')

const TOKENS = {
  dark: `
    --dsw-radius-sm: 8px; --dsw-radius-md: 10px; --dsw-radius-lg: 12px;
    --dsw-specific-menu: #303136a3;
    --dsw-menu-backdrop-filter: blur(40px) saturate(150%);
    --dsw-alias-label-primary: #f9fafb;
    --dsw-alias-label-secondary: #cad2db;
    --dsw-alias-label-tertiary: #adb2b8;
    --dsw-alias-border-l1: #ffffff0f;
    --dsw-alias-border-l2: #ffffff1f;
    --dsw-alias-bg-overlay: #61666b;
    --dsw-alias-interactive-bg-hover: #ffffff14;
    --dsw-alias-button-primary-fill: #f9fafb;
    --dsw-alias-label-primary-foreground: #0f1115;
    --dsw-elevation-prominent: 0 0 0 .5px #ffffff1f, 0 3px 8px #0000000a, 0 0 20px #0000000d;
    --we-panel-color: #1e1f26; --we-saturate: 1.8; --we-glass-brightness: 1.04;
    --we-hovercard-alpha: .61; --we-hovercard-blur: 16px;
    background:
      radial-gradient(1100px 700px at 12% 8%, #5a463b 0%, transparent 58%),
      radial-gradient(900px 700px at 92% 70%, #263441 0%, transparent 62%),
      linear-gradient(155deg, #3a312c 0%, #1c2026 48%, #2b2420 100%);
    color: #f9fafb;
  `,
  light: `
    --dsw-radius-sm: 8px; --dsw-radius-md: 10px; --dsw-radius-lg: 12px;
    --dsw-specific-menu: #fcfdfeb3;
    --dsw-menu-backdrop-filter: blur(40px) saturate(150%);
    --dsw-alias-label-primary: #0f1115;
    --dsw-alias-label-secondary: #61666b;
    --dsw-alias-label-tertiary: #81858c;
    --dsw-alias-border-l1: #0000000a;
    --dsw-alias-border-l2: #0000001a;
    --dsw-alias-bg-overlay: #e9ecf2;
    --dsw-alias-interactive-bg-hover: #2631480f;
    --dsw-alias-button-primary-fill: #0f1115;
    --dsw-alias-label-primary-foreground: #ffffff;
    --dsw-elevation-prominent: 0 0 0 .5px #0000000a, 0 3px 8px #00000008, 0 0 20px #0000000d;
    --we-panel-color: #ffffff; --we-saturate: 1.8; --we-glass-brightness: 1.04;
    --we-hovercard-alpha: .61; --we-hovercard-blur: 16px;
    background:
      radial-gradient(1100px 700px at 12% 8%, #e5d5c6 0%, transparent 58%),
      radial-gradient(900px 700px at 92% 70%, #c9d8df 0%, transparent 62%),
      linear-gradient(155deg, #ded8d1 0%, #eef0f2 48%, #d9d0c8 100%);
    color: #0f1115;
  `,
}

function page(theme, glassCss) {
  const dark = theme === 'dark'
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: 900px; height: 320px; overflow: hidden; }
  body {
    ${TOKENS[theme]}
    font: 12px/18px "Noto Sans CJK SC", "Noto Sans SC", "Source Han Sans SC", system-ui, sans-serif;
  }
  .panel {
    position: fixed; top: 30px; box-sizing: border-box; padding: 16px;
    border-radius: var(--dsw-radius-lg); background: var(--dsw-specific-menu);
    backdrop-filter: var(--dsw-menu-backdrop-filter); color: var(--dsw-alias-label-secondary);
    --dsw-elevation-stroke-color: var(--dsw-alias-border-l1);
    box-shadow: var(--dsw-elevation-prominent);
    font-size: 12px; line-height: 18px; overflow: hidden; z-index: 1100;
  }
  #usage { left: 50px; width: 400px; }
  #rewind { left: 500px; width: 300px; }
  .title { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 8px;
    font-weight: 500; color: var(--dsw-alias-label-primary); }
  .rule { border-top: .5px solid var(--dsw-alias-border-l2); margin-bottom: 10px; }
  .details { display: grid; grid-template-columns: minmax(76px, auto) minmax(0, 1fr);
    gap: 6px 16px; margin: 0; color: var(--dsw-alias-label-tertiary); }
  .details dd { margin: 0; text-align: right; color: var(--dsw-alias-label-secondary);
    font-variant-numeric: tabular-nums; }
  .rw-title { font-size: 12px; font-weight: 500; line-height: 18px; color: var(--dsw-alias-label-primary); }
  .rw-target { margin: 2px 0 10px; color: var(--dsw-alias-label-tertiary);
    word-break: break-all; display: -webkit-box; -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; overflow: hidden; }
  .rw-option { display: flex; flex-direction: column; gap: 2px; width: 100%;
    margin: 0 0 2px; padding: 6px 8px; border: 0; border-radius: 8px;
    background: transparent; color: inherit; font: inherit; text-align: left; }
  .rw-option .hint { font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }
  .rw-impact { margin: 4px 0 10px; padding: 8px 10px; border-radius: 8px;
    background: var(--dsw-alias-interactive-bg-hover); font-size: 12px; line-height: 16px;
    color: var(--dsw-alias-label-secondary); white-space: pre-wrap; }
  .rw-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  .rw-actions button { height: 28px; padding: 0 10px; border: 0; border-radius: 8px;
    font: inherit; }
  .rw-actions .ghost { background: transparent; color: var(--dsw-alias-label-secondary); }
  .rw-actions .primary { background: var(--dsw-alias-button-primary-fill);
    color: var(--dsw-alias-label-primary-foreground); }
  ${glassCss}
  </style></head>
  <body data-we-glass-page data-we-glass-floaters${dark ? ' data-ds-dark-theme' : ''}>
    <div id="usage" class="panel" role="dialog" aria-label="本轮用量">
      <div class="title"><span>本轮用量</span><span>348,599 tok</span></div>
      <div class="rule"></div>
      <dl class="details">
        <dt>提供方 / 模型</dt><dd>deepseek-official/deepseek-flash</dd>
        <dt>缓存命中</dt><dd>99.96%</dd>
        <dt>未缓存输入</dt><dd>139 tok</dd>
        <dt>缓存读取</dt><dd>346,624 tok</dd>
        <dt>缓存写入</dt><dd>0 tok</dd>
        <dt>输出</dt><dd>1,836 tok</dd>
      </dl>
    </div>
    <div id="rewind" class="panel" role="dialog" aria-label="回退到这条消息">
      <div class="rw-title">回退到这条消息</div>
      <div class="rw-target">是不是就是那个“包含的组件”这个东西，这么看这个插件设计得好高级啊</div>
      <button class="rw-option" type="button">
        <span>仅回退对话</span>
        <span class="hint">仅回退上下文，不动工作区文件</span>
      </button>
      <div class="rw-impact">无法获取影响清单：文件还原不可用。</div>
      <div class="rw-actions"><button class="ghost" type="button">取消</button><button class="primary" type="button">确认</button></div>
    </div>
  </body></html>`
}

function comparison(theme) {
  const dark = theme === 'dark'
  const title = dark ? '深色：修改前 / 修改后' : '浅色：修改前 / 修改后'
  const bg = dark ? '#111214' : '#f4f4f5'
  const fg = dark ? '#e7e9ec' : '#1b1c1e'
  const muted = dark ? '#9aa0a8' : '#5f6368'
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
  html, body { margin: 0; background: ${bg}; color: ${fg}; }
  body { padding: 24px; font: 14px/1.5 "Noto Sans CJK SC", "Noto Sans SC", system-ui, sans-serif; }
  h1 { margin: 0 0 18px; font-size: 18px; font-weight: 600; }
  .row { display: flex; gap: 20px; align-items: flex-start; }
  figure { margin: 0; width: 900px; }
  img { display: block; width: 900px; height: 320px; border-radius: 8px; }
  figcaption { margin-top: 10px; font-size: 13px; line-height: 1.5; color: ${muted}; }
  figcaption strong { color: ${fg}; }
  </style></head><body>
    <h1>${title}</h1>
    <div class="row">
      <figure><img src="../before-${theme}.png" alt="before"><figcaption><strong>修改前</strong>：裸 <code>&gt; div</code> 把每个直接子 div 都涂上 HoverCard 的底、渐变与霜，出现多条不同色色带。</figcaption></figure>
      <figure><img src="../after-${theme}.png" alt="after"><figcaption><strong>修改后</strong>：<code>&gt; div:only-of-type</code> 只命中真正的单卡 HoverCard；两个面板恢复统一的菜单底。</figcaption></figure>
    </div>
  </body></html>`
}

function shot(html, out, width, height) {
  const file = join(tmp, out.replace(/\.png$/, '.html'))
  writeFileSync(file, html)
  execFileSync(chrome, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--allow-file-access-from-files', '--virtual-time-budget=1500',
    '--user-data-dir=' + join(tmp, 'profile-' + out.replace(/\.png$/, '')),
    '--window-size=' + width + ',' + height,
    '--screenshot=' + join(here, out),
    'file://' + file,
  ], { stdio: 'ignore' })
  console.log('wrote', out)
}

mkdirSync(tmp, { recursive: true })
for (const theme of ['dark', 'light']) {
  shot(page(theme, CSS_GLASS), `before-${theme}.png`, 900, 320)
  shot(page(theme, cssAfter), `after-${theme}.png`, 900, 320)
  shot(comparison(theme), `comparison-${theme}.png`, 1860, 470)
}
rmSync(tmp, { recursive: true, force: true })
