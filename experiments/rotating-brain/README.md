# Anatomy 3D experiment (not yet integrated)

This folder is the **isolated** V0.3 testbed for a true turning, reprojected mechanical brain. The published website remains the V0.2 root `index.html`.

Source reference: [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy) at `454a0ef801b6d9b905f08309d094491c7085b3dd`, MIT license.

## Build

From repository root:

```bash
git clone https://github.com/wheresryan22/anatomy.git .anatomy-upstream
git -C .anatomy-upstream checkout 454a0ef801b6d9b905f08309d094491c7085b3dd
node experiments/rotating-brain/build.mjs
```

Opens `experiments/rotating-brain/index.html` in a browser. This uses the **actual Anatomy 3D Turning engine**, not a CSS fake. No API key or npm dependencies needed. If no internet access is available during checkout, fetch the Anatomy repository separately and place it in `.anatomy-upstream/`.

**Status**: prototype. Do not replace the production mechanical brain until browser screenshots, 360° orbit audit and mobile tests pass. See `docs/3D_DESIGN_CONTRACT.md`.
