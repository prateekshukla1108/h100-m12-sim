import { useEffect } from 'react';
import { usePipelineStore } from '../store/pipelineStore';

export function useSimulation() {
  const isRunning = usePipelineStore(s => s.isRunning);
  const runCycle = usePipelineStore(s => s.actions.runCycle);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      runCycle();
    }, 100); // 100ms per cycle for visible animation

    return () => clearInterval(interval);
  }, [isRunning, runCycle]);
}
