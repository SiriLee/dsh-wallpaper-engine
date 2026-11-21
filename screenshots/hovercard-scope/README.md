# HoverCard 玻璃选择器收窄：前后对照

临时证据分支，用于 PR 配图，不用于合并。

这些图是**最小复现**，不是实时 DSH 截图：使用仓库真实的 `CSS_GLASS`
（`packages/glass/src/glass-css.js`），以及宿主 `TurnUsagePanel` 与 dsh-rewind
弹层的真实 DOM 结构。除被验证的选择器外，两边的样式完全一致：

- before：`[role="dialog"] > div`（当前实现）
- after：`[role="dialog"] > div:only-of-type`

## 结论

- 宿主的「本轮用量」面板是 `div.title` + `div.titleRule` + `dl.details`；
  旧选择器只涂到 `title`，所以看起来像一条“官方标题带”。
- dsh-rewind 弹层有 `title` / `target` / `impact` / `actions` 四个直接 `div`，
  旧选择器给每个都涂上 HoverCard 的底、白色渐变与霜，所以出现多条色带。
- 改成 `> div:only-of-type` 后，只有「外层只有一个卡片 div」的真实 HoverCard
  仍命中；两个多子元素面板都恢复统一的菜单底。

## 图

| 图 | 用途 |
|---|---|
| `comparison-dark.png` / `comparison-light.png` | PR 正文推荐直接引用，左右并排 |
| `before-dark.png` / `after-dark.png` | 深色单独前后图 |
| `before-light.png` / `after-light.png` | 浅色单独前后图 |

## 重新生成

需要 Chromium：

```bash
CHROME=/path/to/chrome node screenshots/hovercard-scope/render.mjs
```

脚本从当前分支的 `packages/glass/src/glass-css.js` 读取真实 `CSS_GLASS`，
并把两条 `> div` 选择器替换成 `> div:only-of-type` 生成 after 图。
