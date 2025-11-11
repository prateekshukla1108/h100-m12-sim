import { motion } from 'framer-motion';
import { useSimulation } from '../hooks/useSimulation';
import { Controls } from './Controls';
import { StatsPanel } from './StatsPanel';
import { ProducerConsumer } from './ProducerConsumer';
import { SMEMBuffers } from './SMEMBuffers';
import { WGMMAQueue } from './WGMMAQueue';
import { HilbertSchedule } from './HilbertSchedule';

export function GPUViewer() {
  useSimulation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-h100-bg via-slate-900 to-cyan-950 p-8 text-white">
      <motion.div
        className="max-w-[1800px] mx-auto backdrop-blur-xl bg-white/5 rounded-3xl p-8 shadow-2xl border border-white/10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-h100-cyan via-h100-emerald to-h100-purple bg-clip-text text-transparent mb-4">
          H100 M12 Kernel Pipeline
        </h1>
        <p className="text-center text-slate-400 mb-8">
          Producer-Consumer Architecture with Triple Buffering & Hilbert Scheduling
        </p>
        
        <Controls />
        <StatsPanel />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          <ProducerConsumer />
          <SMEMBuffers />
          <WGMMAQueue />
        </div>
        
        <div className="mt-8">
          <HilbertSchedule />
        </div>
        
        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-h100-cyan/30 text-sm">
          <div className="text-h100-cyan font-bold mb-2">Architecture Details:</div>
          <ul className="space-y-1 text-slate-300">
            <li>• <span className="text-h100-emerald">Producer Warpgroup (0):</span> Async TMA loads from HBM → SMEM</li>
            <li>• <span className="text-h100-emerald">Consumer Warpgroups (1-2):</span> WGMMA computations (m64n256k16)</li>
            <li>• <span className="text-h100-emerald">Triple Buffering:</span> Q[0], Q[1], Q[2] with full/empty barriers</li>
            <li>• <span className="text-h100-emerald">ScaleD:</span> 0 for first K-tile (init), 1 for accumulation</li>
            <li>• <span className="text-h100-emerald">Hilbert Curve:</span> Optimal block scheduling for cache locality</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
