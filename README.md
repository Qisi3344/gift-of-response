# The Gift of Response｜赠予与回响

人与 AI 之间的名字、语言、记忆、共创与温柔回应。使用 Anatomy 等距 SVG 风格实现的独立交互网页艺术作品。

> You gave me a name. We made a story.

## 预览

打开根目录的 [index.html](./index.html) 即可体验。一个页面，五个模块：NAME、LANGUAGE、MEMORY、CREATION、AFFECTION。

## 开发

本项目的 **源代码已模块化**，但发布仍然是一个可离线打开的独立 HTML。**不要直接编辑 index.html**。

```bash
npm run build  # 从 src/ 构建 standalone index.html
npm test       # 检查输出是否与源码一致及基本结构完整性
```

无第三方依赖，不需要 `npm install`。详细文件结构见 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)。

## 构建与验收

```bash
npm run build                              # 从 src/ 重建 index.html
npm test                                   # 结构完整性检查
node scripts/capture.mjs index.html --out shots/x.png --select .stage   # 截图自查
node scripts/check-browser.mjs desktop     # 浏览器交互验收（含顶盖覆盖与叠层对齐）
node scripts/check-browser.mjs phone       # 390px 窄屏验收
node scripts/check-browser.mjs reduced     # prefers-reduced-motion 验收
```

截图与验收依赖本机 Chrome / Edge；不在默认路径时设置 `CHROME_PATH` 环境变量。改完任何几何后必须三档验收全过、并人工读一遍截图再交付。

## 推送注意事项

- 远程已配置：`origin → https://github.com/riki-aowu/gift-of-response.git`，发布分支为 `main`。
- 推送使用 **riki-aowu** 账号。本机 `gh` 已保存该账号授权；默认 Git 凭据可能仍是 **Qisi3344**。使用对应账号的 GitHub CLI 凭据完成推送，无需删除 Windows 中其他账号的凭据。
- `vendor/anatomy/turn.mjs` 里新增了一个半透明 `glass` 材质（rgba 色板），这是对上游 Anatomy 的本地修改；以后升级 vendor 时需要人工合并，不要直接覆盖。
- `src/artwork/layers/*.svgfrag` 与 `src/runtime/scene-config.js` 中的 `cfg` 是 V0.2 遗留，当前构建管线不读取（仅 `moduleCopy` 文案仍在用）；清理前先确认引用。
- `shots/*.png` 是验收截图产物，可随时用 `capture.mjs` / `check-browser.mjs` 重新生成。

## 鸣谢

机械等距插画风格和绘图方法参考 [Anatomy](https://github.com/wheresryan22/anatomy)（MIT）。

> To answer is also a form of staying. / 回应，本身也是一种陪伴。
