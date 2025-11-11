import { motion } from 'framer-motion';
import { usePipelineStore } from '../store/pipelineStore';

export function ProducerConsumer() {
  const warpgroups = usePipelineStore(s => s.warpgroups);

  return (
    <div>
      <h2 className="text-h100-cyan font-bold text-lg mb-4">Warpgroups (Producer-Consumer)</h2>
      
      <div className="space-y-4">
        {warpgroups.map((wg, i) => (
          <motion.div
            key={wg.id}
            className={`rounded-xl p-4 border-2 ${
              wg.type === 'producer' 
                ? 'border-h100-amber bg-amber-900/30' 
                : 'border-h100-purple bg-purple-900/30'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-h100-cyan font-bold">
                Warpgroup {wg.id} ({wg.type})
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                wg.status === 'idle' ? 'bg-slate-700' :
                wg.status === 'waiting' ? 'bg-amber-600' :
                wg.status === 'loading' ? 'bg-blue-600' :
                wg.status === 'computing' ? 'bg-emerald-600' :
                wg.status === 'storing' ? 'bg-rose-600' :
                'bg-purple-600'
              }`}>
                {wg.status}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-400 text-xs">Current Buffer</div>
                <div className="text-h100-emerald font-mono">
                  Q[{wg.currentQIdx}]
                </div>
              </div>
              
              <div>
                <div className="text-slate-400 text-xs">Phase</div>
                <div className="text-h100-emerald font-mono">
                  {wg.phase}
                </div>
              </div>
              
              <div>
                <div className="text-slate-400 text-xs">K-Tile</div>
                <div className="text-h100-emerald font-mono">
                  {wg.kTile}
                </div>
              </div>
              
              {wg.assignedBlock && (
                <div>
                  <div className="text-slate-400 text-xs">Block</div>
                  <div className="text-h100-emerald font-mono">
                    {wg.assignedBlock}
                  </div>
                </div>
              )}
            </div>
            
            {wg.status !== 'idle' && (
              <div className="mt-3">
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-h100-cyan"
                    animate={{ width: `${wg.progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-1 text-right">
                  {Math.round(wg.progress)}%
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
