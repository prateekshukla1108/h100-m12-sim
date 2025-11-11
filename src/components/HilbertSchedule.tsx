import { motion } from 'framer-motion';
import { usePipelineStore } from '../store/pipelineStore';

export function HilbertSchedule() {
  const schedule = usePipelineStore(s => s.hilbertSchedule);
  const stats = usePipelineStore(s => s.stats);

  return (
    <div>
      <h2 className="text-h100-cyan font-bold text-lg mb-4">Hilbert Curve Schedule</h2>
      
      <div className="bg-slate-800/50 rounded-xl p-4">
        <div className="text-xs text-slate-400 mb-3">
          Block Processing Order • Progress: {stats.completedBlocks}/{schedule.length}
        </div>
        
        <div className="grid grid-cols-8 gap-2">
          {schedule.map((block, i) => (
            <motion.div
              key={i}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold ${
                block.status === 'complete' ? 'bg-emerald-600' :
                block.status === 'active' ? 'bg-h100-cyan animate-pulse' :
                'bg-slate-700'
              }`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              title={`Block M=${block.blockM}, N=${block.blockN}`}
            >
              <div className="text-[10px]">{block.idx}</div>
              <div className="text-[8px] opacity-60">
                {block.blockM},{block.blockN}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
