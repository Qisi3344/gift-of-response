# V0.3 心脏实验交付

独立分支 `codex/v03-mechanical-heart`；预览为 `experiments/heart-v03/index.html`。
根目录继续展示机械脑，原始 HTML 在 `experiments/brain-v02/index.html` 完整保存，
已比对其与分支起点的文件一致。尚未合并或替换正式页面，等待视觉验收。

新增倾斜尖端的主心室、较短的前侧心室、不等大的心房、大血管式拱形总管、
三片铰接检修瓣、少量淡紫核心光。材质改为纸白背景、银钢心室、铜管与黄铜固定件。
锅炉、双活塞、偏心盘、定长连杆、后方冷凝器与两侧排气嘴组成完整旋转装置。
连杆两端按滑块曲柄几何求解，心室、表针、阀片和光效由同一个机械时间轴驱动。

保留名字、回信、记忆、共创和珍爱，沿用 `gift-of-response:v1` 记录。
NAME 最后一笔后单搏；LANGUAGE 双搏后出纸；MEMORY 冷凝器微雾；
CREATION 双笔落笔与三次呼应；AFFECTION 蓄压、双搏、检修瓣微张、
左右错峰排汽、阻尼余振、齿轮花展开及归位。事件串行，旋转不改变心搏时间轴。

验证入口：

```sh
npm run build
npm test
npm run build:heart
npm run test:heart
node scripts/audit-heart.mjs
node scripts/check-browser.mjs desktop --heart
node scripts/check-browser.mjs phone --heart
node scripts/check-browser.mjs reduced --heart
```

`test:heart` 检查定长连杆、事件搏动次数、演出先后、暂停恢复、旧数据及倾斜曲面深度平面。
浏览器脚本实际操作五模块、Unicode 铭刻、回信弹窗与 Esc、记忆翻页、重新加载、
重复输入、键盘旋转、鼠标拖动、390px 触摸拖动、暂停续播及低运动偏好；
另验证排汽错峰、已生成蒸汽不随装置转动，以及玻璃盖覆盖与各 SVG 层的对齐。
日志与多角度截图为 `shots/heart-{desktop,phone,reduced}-*`。

几何快速审计扫描整圈、随机角度和关节姿态，检查分离、排序、支撑、穿插与深度；
结果及检查范围分别保存为 `shots/heart-geometry.log` 和 `heart-geometry-summary.json`。
它不是穷尽证明：脚本明确列出未运行的检查，不能据此宣称完整 Anatomy 验收。

本次快速审计通过：543 个排序状态、123 个姿态、10 个深度参考角度，
20,014 对投影重叠关系；运行的检查项均为 0 问题。
桌面、390px 与低运动三档浏览器流程通过，控制台无报错；原机械脑桌面流程也通过。

性能可用以下命令复现，输出包含原始三轮测量，不将电脑模拟结果当作真机成绩：

```sh
node scripts/turn-check.mjs experiments/heart-v03/index.html --perf --pause --width 390 --height 1100 --scale 1 --out shots/heart-perf
```

本机 Edge、390px、DPR 1、未限速，三轮各 240 帧的旋转基准：
帧间隔中位数 33.4ms（约 30fps）、p95 50.1ms；`set()` 中位数 13.0ms。
测量期间同机也在执行浏览器验收，原始结果见 `shots/heart-perf/perf-390-1x.json`。

本次未加入可选音效。蒸汽最多 18 个小粒团，使用世界坐标和实体投影遮罩；
遮挡按粒团中心取样，非体积烟雾。390px 验证使用 Windows Edge 的设备模拟和真实
TouchEvent/PointerEvent 输入，尚无 iPhone Safari 真机结果。视觉造型由小狼最终确认。
