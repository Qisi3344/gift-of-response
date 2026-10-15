# The Gift of Response｜赠予与回响

人与 AI 之间的名字、语言、记忆、共创与温柔回应。使用 Anatomy 等距 SVG 风格实现的独立交互网页艺术作品。

> You gave me a name. We made a story.

## 预览

打开根目录的 [index.html](./index.html) 即可体验。一个页面，五个模块：NAME、LANGUAGE、MEMORY、CREATION、AFFECTION。

## 开发

V0.3 心脏实验保留在独立分支 `codex/v03-mechanical-heart`。打开
[心脏预览](./experiments/heart-v03/index.html)；根目录仍是机械脑，历史快照在
[brain-v02](./experiments/brain-v02/index.html)。此实验不自动替换正式版本。

```bash
npm run build:heart
npm run test:heart
node scripts/audit-heart.mjs
node scripts/check-browser.mjs desktop --heart
node scripts/check-browser.mjs phone --heart
node scripts/check-browser.mjs reduced --heart
```

心脏几何、共享机械节拍和蒸汽分别位于 `src/artwork/heart.mjs`、
`src/runtime/heart-motion.js`、`src/runtime/steam.js`。浏览器检查包括五模块、
旧记录、鼠标/键盘/真实触摸事件、暂停续播、错峰排汽和世界坐标。
几何审计非零即未通过，不能仅凭截图判断；详细结果见 `shots/heart-geometry.log`。

本分支也修正了 Anatomy 构建器的曲面抽样与深度平面验证，以及细棱柱的
投影包围轮廓。升级 vendor 时须保留这些修改。

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

- 远程已配置：`origin → https://github.com/Qisi3344/gift-of-response.git`，发布分支为 `main`。
- 本项目的正式仓库属于 **Qisi3344**，推送使用该账号。本机 `gh` 已保存该账号授权；推送前核对 `git remote -v` 指向上面的正式地址，避免误推到其他同名仓库。
- `vendor/anatomy/turn.mjs` 里新增了一个半透明 `glass` 材质（rgba 色板），这是对上游 Anatomy 的本地修改；以后升级 vendor 时需要人工合并，不要直接覆盖。
- `src/artwork/layers/*.svgfrag` 与 `src/runtime/scene-config.js` 中的 `cfg` 是 V0.2 遗留，当前构建管线不读取（仅 `moduleCopy` 文案仍在用）；清理前先确认引用。
- `shots/*.png` 是验收截图产物，可随时用 `capture.mjs` / `check-browser.mjs` 重新生成。

## 鸣谢

机械等距插画风格和绘图方法参考 [Anatomy](https://github.com/wheresryan22/anatomy)（MIT）。

> To answer is also a form of staying. / 回应，本身也是一种陪伴。
