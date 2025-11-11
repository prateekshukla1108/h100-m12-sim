import { motion } from 'framer-motion';
import { usePipelineStore } from '../store/pipelineStore';

export function SMEMBuffers() {
  const smemBuffers = usePipelineStore(s => s.smemBuffers);

  return (
    <div>
      <h2 className="text-h100-cyan font-bold text-lg mb-4">Shared Memory Buffers (Triple Buffered)</h2>
      
      <div className="space-y-3">
        {smemBuffers.map((buf, i) => (
          <motion.div
            key={buf.qIdx}
            className={`rounded-xl p-4 border-2 ${
              buf.status === 'empty' ? 'border-slate-600 bg-slate-800/40' :
              buf.status === 'loading' ? 'border-amber-500 bg-amber-900/30' :
              buf.status === 'full' ? 'border-emerald-500 bg-emerald-900/30' :
              'border-rose-500 bg-rose-900/30'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-h100-cyan font-bold">Buffer Q[{buf.qIdx}]</div>
              <div className="flex gap-2">
                <motion.div
                  className={`w-3 h-3 rounded-full ${
                    buf.fullBarrier ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                  animate={buf.fullBarrier ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  title="Full Barrier"
                />
                <motion.div
                  className={`w-3 h-3 rounded-full ${
                    buf.emptyBarrier ? 'bg-cyan-400' : 'bg-slate-600'
                  }`}
                  animate={buf.emptyBarrier ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  title="Empty Barrier"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-lg p-3 ${buf.A ? 'bg-slate-700/50' : 'bg-slate-800/50'}`}>
                <div className="text-xs text-slate-400 mb-1">Matrix A</div>
                {buf.A ? (
                  <div className="text-h100-emerald font-mono text-sm">{buf.A.id}</div>
                ) : (
                  <div className="text-slate-600 text-sm">empty</div>
                )}
              </div>
              
              <div className={`rounded-lg p-3 ${buf.B ? 'bg-slate-700/50' : 'bg-slate-800/50'}`}>
                <div className="text-xs text-slate-400 mb-1">Matrix B</div>
                {buf.B ? (
                  <div className="text-h100-emerald font-mono text-sm">{buf.B.id}</div>
                ) : (
                  <div className="text-slate-600 text-sm">empty</div>
                )}
              </div>
            </div>
            
            <div className="mt-2 text-xs text-center">
              <span className={`px-2 py-1 rounded ${
                buf.status === 'empty' ? 'bg-slate-700' :
                buf.status === 'loading' ? 'bg-amber-600' :
                buf.status === 'full' ? 'bg-emerald-600' :
                'bg-rose-600'
              }`}>
                {buf.status} {buf.status !== 'empty' && `(K=${buf.kIteration})`}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg text-xs">
        <div className="text-slate-400 mb-2">Legend:</div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span>Full Barrier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <span>Empty Barrier</span>
          </div>
        </div>
      </div>
    </div>
  );
}
