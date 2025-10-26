import { useState, useEffect, useRef } from 'react';
import { SimulationState } from '../types/physics';

export function useSimulation(onUpdate: (deltaTime: number) => void) {
  const [state, setState] = useState<SimulationState>({
    isRunning: false,
    time: 0,
    timeScale: 1,
  });

  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!state.isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = ((timestamp - lastTimeRef.current) / 1000) * state.timeScale;
      lastTimeRef.current = timestamp;

      setState(prev => ({ ...prev, time: prev.time + deltaTime }));
      onUpdate(deltaTime);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isRunning, state.timeScale, onUpdate]);

  const play = () => {
    setState(prev => ({ ...prev, isRunning: true }));
    lastTimeRef.current = 0;
  };

  const pause = () => {
    setState(prev => ({ ...prev, isRunning: false }));
  };

  const reset = () => {
    setState(prev => ({ ...prev, isRunning: false, time: 0 }));
    lastTimeRef.current = 0;
  };

  const step = () => {
    onUpdate(0.016 * state.timeScale);
    setState(prev => ({ ...prev, time: prev.time + 0.016 * state.timeScale }));
  };

  const setTimeScale = (scale: number) => {
    setState(prev => ({ ...prev, timeScale: scale }));
  };

  return { state, play, pause, reset, step, setTimeScale };
}
