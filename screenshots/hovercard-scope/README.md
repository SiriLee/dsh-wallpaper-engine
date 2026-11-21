# HoverCard 玻璃选择器收窄：前后对照

临时证据分支，用于 PR 配图，不用于合并。

这些图是**最小复现**，不是实时 DSH 截图：使用仓库真实的 `CSS_GLASS`
（`packages/glass/src/glass-css.js`），以及宿主播出面板和 dsh-rewind 弹层的
真实 DOM 结构。除被验证的选择器外，两边的样式完全一致：

- before：`[role="dialog"] > div`（当前实现）
- after：`[role="dialog"] > div:only-of-type`

## 三个面板

1. **官方「本轮用量」**：`div.title` + `div.titleRule` + `dl.details`。
   旧选择器只涂到 `title`，看起来像一条“官方标题带”。
2. **dsh-rewind 模式选择**：`title` / `target` / `impact` 三个直接 `div`；
   选择模式后立即执行，**没有**取消/确认 footer。
3. **dsh-rewind 文件变更确认**：选择“回退对话和文件”后才出现；`impact`
   （文件清单）与 `actions` 两个直接 `div`，footer 是「返回 / 确认回退」。
   「取消 / 确认」属于撤回未发送消息的 retract 变体，不是这个流程。

旧选择器会把上面每个直接子 `div` 都涂上 HoverCard 的底、白色渐变与霜，
所以三个面板各出现多条色带。改成 `> div:only-of-type` 后，只有「外层只有
一个卡片 div」的真实 HoverCard 仍命中，三个面板都恢复统一的菜单底。

图中的回退目标文案是占位示例：
`这里是一段用于演示回退目标的消息摘要，内容仅为示例。`

## 图

| 图 | 用途 |
|---|---|
| `comparison-dark.png` / `comparison-light.png` | PR 正文推荐直接引用，上下对照 |
| `before-dark.png` / `after-dark.png` | 深色三面板前后图 |
| `before-light.png` / `after-light.png` | 浅色三面板前后图 |

## 重新生成

需要 Chromium：

```bash
CHROME=/path/to/chrome node screenshots/hovercard-scope/render.mjs
```

脚本从当前分支的 `packages/glass/src/glass-css.js` 读取真实 `CSS_GLASS`，
并把两条 `> div` 选择器替换成 `> div:only-of-type` 生成 after 图。
