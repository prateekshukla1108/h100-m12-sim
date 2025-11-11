import { motion } from 'framer-motion';
import { usePipelineStore } from '../store/pipelineStore';

export function StatsPanel() {
  const stats = usePipelineStore(s => s.stats);

  return (
    <motion.div
      className="bg-slate-800/60 rounded-2xl p-6 border border-h100-cyan/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-h100-cyan font-bold text-lg mb-4">Pipeline Statistics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cycle', value: stats.cycle, color: 'cyan' },
          { label: 'TMA Transfers', value: stats.tmaTransfers, color: 'amber' },
          { label: 'WGMMA Ops', value: stats.wgmmaOps, color: 'emerald' },
          { label: 'Barrier Waits', value: stats.barrierWaits, color: 'purple' },
          { label: 'Producer Stalls', value: stats.producerStalls, color: 'rose' },
          { label: 'Consumer Stalls', value: stats.consumerStalls, color: 'orange' },
          { label: 'Completed Blocks', value: stats.completedBlocks, color: 'green' },
          { label: 'Buffer Util', value: `${stats.bufferUtilization}%`, color: 'blue' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-slate-900/50 rounded-lg p-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold text-${stat.color}-400`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
