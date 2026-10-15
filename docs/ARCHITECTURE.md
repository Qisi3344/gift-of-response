# 项目结构与后续开发约定

这个项目**对访问者仍是单页面**，源码则分文件维护。构建后的根目录 `index.html` 是单文件发布产物，可直接双击打开，GitHub Pages 也能直接使用。

## 文件职责

- `src/page.template.html`：页面语义、布局、五模块交互区和弹窗。三个 `{{...}}` 插入点会由构建器替换。
- `src/styles/anatomy.css`：Anatomy SVG 的着色、阴影及通用基础样式。
- `src/styles/site.css`：本作品的颜色、字体、布局和移动端适配。
- `src/artwork/heart.mjs`：机械心脏、玻璃舱、底座及周边机构的三维几何和关节。
- `src/runtime/anatomy-kit.js`：现有等距投影与图形函数；不放业务状态。
- `src/runtime/state-machine.js`：五模块的纯状态转移和进度计算。
- `src/runtime/scene-config.js`：五模块文案。
- `src/runtime/heart-motion.js`：共享心搏、曲柄连杆、阀片、压力和演出节拍。
- `src/runtime/steam.js`：世界坐标蒸汽与实体遮挡。
- `src/runtime/exhibit.js`：整景旋转、玻璃反光、机械控制与关节绘制。
- `src/runtime/interaction.js`：DOM 事件、动画循环、持久化、文字与交互反馈。
- `src/manifest.json`：构建顺序，由 `scripts/build.mjs` 消费。
- `scripts/test.mjs`：构建一致性与基本 DOM 标记完整性检查。
- `index.html`：自动生成的**发布产物**，不要直接编辑。
- `备份.zip`：机械脑旧版的完整页面与可重建源码，不参与当前构建。

## 运行

```sh
npm run build
npm test
```

无第三方依赖、无需 `npm install`。直接用浏览器打开根目录的 `index.html` 即可预览；不需要开发服务器。

## 对后续 V0.3 的约束

1. 源文件是单一事实来源。禁止直接编辑生成的 `index.html`，否则下次构建会覆盖。
2. 插入 SVG 零件时务必保留正确的**遮挡深度顺序**：玻璃前后层、齿轮与轴的排列不能仅凭分组调整。新增图层只在 manifest 中明确顺序后加入。
3. 交互状态变化应优先写在 `state-machine.js`，几何坐标放在 `heart.mjs`，机械节拍放在 `heart-motion.js`，浏览器监听与持久化放在 `interaction.js`，各层不要混合。
4. 未来若纸带、玫瑰或传动系统变复杂，继续提取独立逻辑模块，统一由构建脚本按顺序引入；不为了拆文件引入 React。
5. 变更后先 `npm run build && npm test`，再在桌面与 390px 移动端检查机械遮挡、文字、5 个模块及减少动态效果模式。
6. 未来可以升级为独立 `.mjs` 真正的 ES modules，但请先兼容现有本地直开与 GitHub Pages 交付方式。

## 心脏版本约束

当前以 [机械心脏规范](./V03_HEART_SPEC.md) 为开发目标，使用统一 Anatomy 等距相机、真实三维零件和整景旋转。保留五模块与已有记录。用户已决定将心脏设为默认展品；机械脑的旧契约与源码均归入 `备份.zip`。
