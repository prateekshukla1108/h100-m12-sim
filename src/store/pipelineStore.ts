import { create } from 'zustand';
import { produce } from 'immer';
import { SMEMBuffer, Warpgroup, WGMMAOperation, HilbertSchedule, PipelineStats, MatrixBlock } from '../types';

// M12 Kernel Parameters
const PARAMS = {
  BM: 128,
  BN: 256,
  BK: 64,
  QSIZE: 3,
  NUM_WARPGROUPS: 3,
  WGMMA_M: 64,
  WGMMA_K: 16,
  TMA_LATENCY: 5,
  WGMMA_LATENCY: 8,
  STORE_LATENCY: 3,
  NUM_BLOCKS_M: 8,
  NUM_BLOCKS_N: 4,
  NUM_BLOCKS_K: 8,
} as const;

interface State {
  cycle: number;
  isRunning: boolean;
  smemBuffers: SMEMBuffer[];
  warpgroups: Warpgroup[];
  wgmmaQueue: WGMMAOperation[];
  hilbertSchedule: HilbertSchedule[];
  hbmA: MatrixBlock[][];
  hbmB: MatrixBlock[][];
  stats: PipelineStats;
  actions: {
    toggleRunning: () => void;
    runCycle: () => void;
    reset: () => void;
  };
}

// Generate Hilbert curve schedule (simplified)
function generateHilbertSchedule(): HilbertSchedule[] {
  const schedule: HilbertSchedule[] = [];
  for (let m = 0; m < PARAMS.NUM_BLOCKS_M; m++) {
    for (let n = 0; n < PARAMS.NUM_BLOCKS_N; n++) {
      schedule.push({ blockM: m, blockN: n, idx: schedule.length, status: 'pending' });
    }
  }
  return schedule;
}

// Initialize HBM matrices
function initHBM(matrix: 'A' | 'B'): MatrixBlock[][] {
  const rows = matrix === 'A' ? PARAMS.NUM_BLOCKS_M : PARAMS.NUM_BLOCKS_K;
  const cols = matrix === 'A' ? PARAMS.NUM_BLOCKS_K : PARAMS.NUM_BLOCKS_N;
  
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      id: `${matrix}${row}_${col}`,
      row,
      col,
      status: 'ready',
      matrix,
    }))
  );
}

export const usePipelineStore = create<State>((set) => ({
  cycle: 0,
  isRunning: false,
  smemBuffers: Array.from({ length: PARAMS.QSIZE }, (_, i) => ({
    qIdx: i,
    A: null,
    B: null,
    status: 'empty',
    fullBarrier: false,
    emptyBarrier: true,
    kIteration: 0,
  })),
  warpgroups: [
    { id: 0, type: 'producer', status: 'idle', currentQIdx: 0, phase: 0, progress: 0, kTile: 0 },
    { id: 1, type: 'consumer', status: 'idle', currentQIdx: 0, phase: 0, progress: 0, kTile: 0 },
    { id: 2, type: 'consumer', status: 'idle', currentQIdx: 0, phase: 0, progress: 0, kTile: 0 },
  ],
  wgmmaQueue: [],
  hilbertSchedule: generateHilbertSchedule(),
  hbmA: initHBM('A'),
  hbmB: initHBM('B'),
  stats: {
    cycle: 0,
    hilbertIdx: 0,
    tmaTransfers: 0,
    wgmmaOps: 0,
    barrierWaits: 0,
    bufferUtilization: 0,
    producerStalls: 0,
    consumerStalls: 0,
    completedBlocks: 0,
  },
  
  actions: {
    toggleRunning: () => set(state => ({ isRunning: !state.isRunning })),
    
    reset: () => set({
      cycle: 0,
      isRunning: false,
      smemBuffers: Array.from({ length: PARAMS.QSIZE }, (_, i) => ({
        qIdx: i,
        A: null,
        B: null,
        status: 'empty',
        fullBarrier: false,
        emptyBarrier: true,
        kIteration: 0,
      })),
      warpgroups: [
        { id: 0, type: 'producer', status: 'idle', currentQIdx: 0, phase: 0, progress: 0, kTile: 0 },
        { id: 1, type: 'consumer', status: 'idle', currentQIdx: 0, phase: 0, progress: 0, kTile: 0 },
        { id: 2, type: 'consumer', status: 'idle', currentQIdx: 0, phase: 0, progress: 0, kTile: 0 },
      ],
      wgmmaQueue: [],
      hilbertSchedule: generateHilbertSchedule(),
      hbmA: initHBM('A'),
      hbmB: initHBM('B'),
      stats: {
        cycle: 0,
        hilbertIdx: 0,
        tmaTransfers: 0,
        wgmmaOps: 0,
        barrierWaits: 0,
        bufferUtilization: 0,
        producerStalls: 0,
        consumerStalls: 0,
        completedBlocks: 0,
      },
    }),
    
    runCycle: () => set(produce((state: State) => {
      if (!state.isRunning) return;
      state.cycle++;
      state.stats.cycle = state.cycle;

      const nextBlock = state.hilbertSchedule.find(s => s.status === 'pending');

      // PRODUCER WARPGROUP (id=0)
      const producer = state.warpgroups[0];
      if (producer.status === 'idle' && nextBlock) {
        nextBlock.status = 'active';
        producer.status = 'waiting';
        producer.assignedBlock = `${nextBlock.blockM}_${nextBlock.blockN}`;
        producer.kTile = 0;
        state.stats.hilbertIdx = nextBlock.idx;
      } else if (producer.status === 'waiting') {
        // Wait for empty barrier
        const buf = state.smemBuffers[producer.currentQIdx];
        if (buf.emptyBarrier) {
          producer.status = 'loading';
          producer.progress = 0;
          buf.emptyBarrier = false;
          state.stats.barrierWaits++;
        } else {
          state.stats.producerStalls++;
        }
      } else if (producer.status === 'loading') {
        producer.progress += 100 / PARAMS.TMA_LATENCY;
        
        if (producer.progress >= 100) {
          const buf = state.smemBuffers[producer.currentQIdx];
          const [blockM, blockN] = producer.assignedBlock!.split('_').map(Number);
          
          // Load A and B tiles via TMA
          buf.A = { ...state.hbmA[blockM][producer.kTile] };
          buf.B = { ...state.hbmB[producer.kTile][blockN] };
          buf.A.status = 'loaded';
          buf.B.status = 'loaded';
          buf.status = 'full';
          buf.fullBarrier = true;
          buf.kIteration = producer.kTile;
          
          producer.kTile++;
          state.stats.tmaTransfers++;
          
          if (producer.kTile >= PARAMS.NUM_BLOCKS_K) {
            // Completed all K tiles for this block
            const block = state.hilbertSchedule.find(s => s.status === 'active');
            if (block) {
              block.status = 'complete';
              state.stats.completedBlocks++;
            }
            producer.status = 'idle';
            producer.kTile = 0;
            producer.currentQIdx = 0;
            producer.phase = 0;
          } else {
            // Move to next buffer slot
            producer.currentQIdx = (producer.currentQIdx + 1) % PARAMS.QSIZE;
            producer.phase ^= 1;
            producer.status = 'waiting';
            producer.progress = 0;
          }
        }
      }

      // CONSUMER WARPGROUPS (id=1,2)
      state.warpgroups.slice(1).forEach((consumer, idx) => {
        if (consumer.status === 'idle') {
          const buf = state.smemBuffers[consumer.currentQIdx];
          if (buf.fullBarrier && buf.status === 'full') {
            consumer.status = 'computing';
            consumer.progress = 0;
            consumer.kTile = buf.kIteration;
            buf.fullBarrier = false;
            buf.status = 'consuming';
            
            // Create WGMMA operations
            const scaleD = consumer.kTile === 0 ? 0 : 1;
            const numOps = PARAMS.BK / PARAMS.WGMMA_K;
            
            for (let i = 0; i < numOps; i++) {
              state.wgmmaQueue.push({
                id: `wg${consumer.id}_k${consumer.kTile}_op${i}`,
                warpgroup: consumer.id,
                scaleD,
                kTile: consumer.kTile,
                mTile: idx,
                progress: 0,
                status: 'queued',
              });
            }
          } else if (buf.status === 'full') {
            state.stats.consumerStalls++;
          }
        } else if (consumer.status === 'computing') {
          consumer.progress += 100 / PARAMS.WGMMA_LATENCY;
          
          if (consumer.progress >= 100) {
            const buf = state.smemBuffers[consumer.currentQIdx];
            buf.status = 'empty';
            buf.emptyBarrier = true;
            buf.A = null;
            buf.B = null;
            
            consumer.status = consumer.kTile >= PARAMS.NUM_BLOCKS_K - 1 ? 'storing' : 'idle';
            consumer.currentQIdx = (consumer.currentQIdx + 1) % PARAMS.QSIZE;
            consumer.phase ^= 1;
            consumer.progress = 0;
          }
        } else if (consumer.status === 'storing') {
          consumer.progress += 100 / PARAMS.STORE_LATENCY;
          if (consumer.progress >= 100) {
            consumer.status = 'idle';
            consumer.progress = 0;
            consumer.kTile = 0;
            consumer.currentQIdx = 0;
          }
        }
      });

      // Process WGMMA queue
      state.wgmmaQueue = state.wgmmaQueue.filter(op => {
        if (op.status === 'queued') {
          op.status = 'active';
          state.stats.wgmmaOps++;
        }
        if (op.status === 'active') {
          op.progress += 25;
          if (op.progress >= 100) {
            op.status = 'complete';
            return false;
          }
        }
        return true;
      });

      // Update stats
      state.stats.bufferUtilization = Math.round(
        (state.smemBuffers.filter(b => b.status !== 'empty').length / PARAMS.QSIZE) * 100
      );
    })),
  },
}));
