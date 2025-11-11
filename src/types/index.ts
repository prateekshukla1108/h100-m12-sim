export interface MatrixBlock {
  id: string;
  row: number;
  col: number;
  status: 'ready' | 'scheduled' | 'loading' | 'loaded';
  matrix: 'A' | 'B';
}

export interface SMEMBuffer {
  qIdx: number;
  A: MatrixBlock | null;
  B: MatrixBlock | null;
  status: 'empty' | 'loading' | 'full' | 'consuming';
  fullBarrier: boolean;
  emptyBarrier: boolean;
  kIteration: number;
}

export interface Warpgroup {
  id: number;
  type: 'producer' | 'consumer';
  status: 'idle' | 'waiting' | 'loading' | 'computing' | 'storing';
  currentQIdx: number;
  phase: number;
  assignedBlock?: string;
  progress: number;
  kTile: number;
}

export interface WGMMAOperation {
  id: string;
  warpgroup: number;
  scaleD: 0 | 1;
  kTile: number;
  mTile: number;
  progress: number;
  status: 'queued' | 'active' | 'complete';
}

export interface HilbertSchedule {
  blockM: number;
  blockN: number;
  idx: number;
  status: 'pending' | 'active' | 'complete';
}

export interface PipelineStats {
  cycle: number;
  hilbertIdx: number;
  tmaTransfers: number;
  wgmmaOps: number;
  barrierWaits: number;
  bufferUtilization: number;
  producerStalls: number;
  consumerStalls: number;
  completedBlocks: number;
}
