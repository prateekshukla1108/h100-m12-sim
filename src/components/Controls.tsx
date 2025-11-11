import { motion } from 'framer-motion';
import { usePipelineStore } from '../store/pipelineStore';

export function Controls() {
  const { isRunning } = usePipelineStore();
  const actions = usePipelineStore(s => s.actions);

  return (
    <div className="flex justify-center gap-4 flex-wrap mb-6">
      <motion.button
        className={`px-8 py-3 rounded-xl font-semibold transition-all text-black ${
          isRunning ? 'bg-h100-amber hover:bg-yellow-400' : 'bg-h100-cyan hover:bg-cyan-400'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={actions.toggleRunning}
      >
        {isRunning ? '⏸ Pause' : '▶ Start'}
      </motion.button>
      
      <motion.button
        className="px-8 py-3 rounded-xl font-semibold bg-slate-700 hover:bg-slate-600 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={actions.reset}
      >
        🔄 Reset
      </motion.button>
    </div>
  );
}
