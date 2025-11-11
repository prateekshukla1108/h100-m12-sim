# H100 M12 Kernel Pipeline Simulator

Accurate visualization of NVIDIA H100's M12 GEMM kernel architecture with producer-consumer pipeline.

## Architecture Features

### Producer-Consumer Model
- **Warpgroup 0 (Producer)**: Async TMA transfers from HBM to SMEM
- **Warpgroups 1-2 (Consumers)**: WGMMA matrix multiply operations

### Triple Buffering
- 3 circular buffer slots (QSIZE=3)
- Full/Empty barriers for synchronization
- Enables load-compute-store overlap

### WGMMA Operations
- m64n256k16 tensor core instructions
- ScaleD=0 for initialization (first K-tile)
- ScaleD=1 for accumulation (subsequent K-tiles)

### Hilbert Curve Scheduling
- Space-filling curve for block ordering
- Maximizes L2 cache locality
- Better than row-major or Z-order

## Quick Start

```bash
npm install
npm run dev
```

Visit: http://localhost:5173/

## Deployment to GitHub Pages

### Method 1: Automated GitHub Actions (Recommended)

1. Create a new GitHub repository named `h100-m12-sim`
2. Push your code to the main branch:
   ```bash
   git remote add origin https://github.com//h100-m12-sim.git
   git branch -M main
   git push -u origin main
   ```
3. Go to repository Settings > Pages
4. Set "Source" to "GitHub Actions"
5. The workflow will automatically deploy your site

### Method 2: Manual Deployment

```bash
npm run deploy
```

This will publish to: https://.github.io/h100-m12-sim

## Implementation Details

Based on the M12 kernel architecture:
- BM=128, BN=256, BK=64
- 3 warpgroups (128 threads each)
- Triple-buffered SMEM
- Async TMA with multicast
- WGMMA tensor core operations
- Hilbert curve block scheduling
