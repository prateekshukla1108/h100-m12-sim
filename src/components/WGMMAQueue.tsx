import { motion, AnimatePresence } from 'framer-motion';
import { usePipelineStore } from '../store/pipelineStore';

export function WGMMAQueue() {
  const wgmmaQueue = usePipelineStore(s => s.wgmmaQueue);

  return (
    <div>
      <h2 className="text-h100-cyan font-bold text-lg mb-4">WGMMA Operations</h2>
      
      <div className="bg-slate-800/50 rounded-xl p-4 min-h-[200px]">
        <div className="text-xs text-slate-400 mb-3">
          Active Operations: {wgmmaQueue.length}
        </div>
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {wgmmaQueue.map((op) => (
              <motion.div
                key={op.id}
                className="rounded-lg p-3 bg-slate-700/50 border border-emerald-500/30"
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-h100-emerald font-mono text-xs">
                    WG{op.warpgroup} • K{op.kTile} • M{op.mTile}
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded ${
                    op.scaleD === 0 ? 'bg-purple-600' : 'bg-emerald-600'
                  }`}>
                    ScaleD={op.scaleD}
                  </div>
                </div>
                
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                    animate={{ width: `${op.progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                
                <div className="text-[10px] text-slate-400 mt-1">
                  wgmma.m64n256k16 • {op.status}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {wgmmaQueue.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              No active operations
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
