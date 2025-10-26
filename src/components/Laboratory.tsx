import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, ChevronRight, BarChart3 } from 'lucide-react';
import { ExperimentType, PendulumParams, ProjectileParams, CollisionParams } from '../types/physics';
import { useSimulation } from '../hooks/useSimulation';
import { PendulumSimulation } from '../simulations/PendulumSimulation';
import { ProjectileSimulation } from '../simulations/ProjectileSimulation';
import { CollisionSimulation } from '../simulations/CollisionSimulation';
import { FreeFallSimulation } from '../simulations/FreeFallSimulation';
import { CircularSimulation } from '../simulations/CircularSimulation';
import { RotationalSimulation } from '../simulations/RotationalSimulation';
import { calculatePendulumPeriod } from '../utils/physics';

interface LaboratoryProps {
  onNavigate: (page: string) => void;
}

const presets: Record<ExperimentType, { name: string; icon: string }> = {
  pendulum: { name: 'Маятник', icon: '⚖️' },
  projectile: { name: 'Проекция', icon: '🎯' },
  freeFall: { name: 'Падение', icon: '⬇️' },
  collision: { name: 'Столкновение', icon: '💥' },
  circular: { name: 'Круг. движение', icon: '🔄' },
  rotational: { name: 'Вращение', icon: '🌀' },
};

type SimulationBase = {
  update: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  reset?: (params?: any) => void;
  getMeasurements?: () => any;
};

export default function Laboratory({ onNavigate }: LaboratoryProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentType>('pendulum');
  const [showGraphs, setShowGraphs] = useState(false);

  const [pendulumParams, setPendulumParams] = useState<PendulumParams>({
    length: 2.0,
    angle: 30,
    mass: 1.0,
    damping: 0.0,
    gravity: 9.81,
  });

  const [projectileParams, setProjectileParams] = useState<ProjectileParams>({
    velocity: 20,
    angle: 45,
    mass: 1.0,
    airResistance: 0.0,
    gravity: 9.81,
  });

  const [collisionParams, setCollisionParams] = useState<CollisionParams>({
    m1: 2.0,
    v1: 5.0,
    m2: 3.0,
    v2: 0.0,
    restitution: 1.0,
  });

  // params for newly added simulations (you can expose in UI later)
  const [freeFallParams, setFreeFallParams] = useState({
    initialHeight: 10,
    mass: 1,
    dragCoefficient: 0,
    gravity: 9.81,
  });

  const [circularParams, setCircularParams] = useState({
    radius: 1.5,
    angularVelocity: 2.0,
    mass: 1.0,
    friction: 0.1,
  });

  const [rotationalParams, setRotationalParams] = useState({
    torque: 0.5,
    inertia: 1.0,
    angularVelocity: 0,
    friction: 0.1,
  });

  const simulationRef = useRef<SimulationBase | null>(null);
  const [measurements, setMeasurements] = useState<any | null>(null);

  // resize canvas with DPR support
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  const updateSimulation = (deltaTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !simulationRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    simulationRef.current.update(deltaTime);

    // compute CSS-pixel width/height using DPR
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    simulationRef.current.draw(ctx);

    const m = simulationRef.current.getMeasurements ? simulationRef.current.getMeasurements() : null;
    setMeasurements(m);
  };

  const { state, play, pause, reset, step, setTimeScale } = useSimulation(updateSimulation);

  // set up resize listener once
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // recreate simulation when experiment or relevant params change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resizeCanvas();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // local dpr for correct coordinate math below
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;

    const centerX = cssWidth / 2;
    const centerY = 100;

    // clear
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // create simulation according to selected experiment
    if (selectedExperiment === 'pendulum') {
      simulationRef.current = new PendulumSimulation(pendulumParams, centerX, centerY);
    } else if (selectedExperiment === 'projectile') {
      // start near left, baseline near bottom
      simulationRef.current = new ProjectileSimulation(projectileParams, 100, cssHeight - 100);
    } else if (selectedExperiment === 'collision') {
      simulationRef.current = new CollisionSimulation(collisionParams, centerX, cssHeight / 2);
    } else if (selectedExperiment === 'freeFall') {
      simulationRef.current = new FreeFallSimulation(freeFallParams, centerX, cssHeight - 60);
    } else if (selectedExperiment === 'circular') {
      simulationRef.current = new CircularSimulation(circularParams, centerX, cssHeight / 2);
    } else if (selectedExperiment === 'rotational') {
      simulationRef.current = new RotationalSimulation(rotationalParams, centerX, cssHeight / 2);
    } else {
      simulationRef.current = null;
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '16px sans-serif';
      ctx.fillText('Эксперимент не реализован', 20, 40);
    }

    if (simulationRef.current) {
      simulationRef.current.draw(ctx);
      const m = simulationRef.current.getMeasurements ? simulationRef.current.getMeasurements() : null;
      setMeasurements(m);
    } else {
      setMeasurements(null);
    }

    // reset animation timer in hook
    reset();

    // list param deps explicitly so effect reruns when user changes them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedExperiment,
    pendulumParams.length,
    pendulumParams.angle,
    pendulumParams.mass,
    pendulumParams.damping,
    pendulumParams.gravity,
    projectileParams.velocity,
    projectileParams.angle,
    projectileParams.mass,
    projectileParams.airResistance,
    projectileParams.gravity,
    collisionParams.m1,
    collisionParams.v1,
    collisionParams.m2,
    collisionParams.v2,
    collisionParams.restitution,
    freeFallParams.initialHeight,
    freeFallParams.mass,
    freeFallParams.dragCoefficient,
    circularParams.radius,
    circularParams.angularVelocity,
    circularParams.mass,
    circularParams.friction,
    rotationalParams.torque,
    rotationalParams.inertia,
    rotationalParams.angularVelocity,
    rotationalParams.friction,
  ]);

  const handleReset = () => {
    reset();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;
    const centerX = cssWidth / 2;

    // try to reset via reset() method, otherwise recreate
    let recreated = false;
    if (simulationRef.current && typeof simulationRef.current.reset === 'function') {
      try {
        if (selectedExperiment === 'pendulum') {
          simulationRef.current.reset?.(pendulumParams);
        } else if (selectedExperiment === 'projectile') {
          simulationRef.current.reset?.(projectileParams);
        } else if (selectedExperiment === 'collision') {
          simulationRef.current.reset?.(collisionParams);
        } else if (selectedExperiment === 'freeFall') {
          simulationRef.current.reset?.(freeFallParams);
        } else if (selectedExperiment === 'circular') {
          simulationRef.current.reset?.(circularParams);
        } else if (selectedExperiment === 'rotational') {
          simulationRef.current.reset?.(rotationalParams);
        }
      } catch (e) {
        // fallback to recreate
        recreated = true;
        simulationRef.current = null;
      }
    } else {
      recreated = true;
    }

    if (recreated || !simulationRef.current) {
      if (selectedExperiment === 'pendulum') {
        simulationRef.current = new PendulumSimulation(pendulumParams, centerX, 100);
      } else if (selectedExperiment === 'projectile') {
        simulationRef.current = new ProjectileSimulation(projectileParams, 100, cssHeight - 100);
      } else if (selectedExperiment === 'collision') {
        simulationRef.current = new CollisionSimulation(collisionParams, centerX, cssHeight / 2);
      } else if (selectedExperiment === 'freeFall') {
        simulationRef.current = new FreeFallSimulation(freeFallParams, centerX, cssHeight - 60);
      } else if (selectedExperiment === 'circular') {
        simulationRef.current = new CircularSimulation(circularParams, centerX, cssHeight / 2);
      } else if (selectedExperiment === 'rotational') {
        simulationRef.current = new RotationalSimulation(rotationalParams, centerX, cssHeight / 2);
      }
    }

    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    simulationRef.current?.draw(ctx);
    const m = simulationRef.current?.getMeasurements ? simulationRef.current.getMeasurements() : null;
    setMeasurements(m);
  };

  const measured = measurements;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад на главную</span>
        </button>

        <h1 className="text-4xl font-bold text-slate-800 mb-8">Лаборатория</h1>

        <div className="grid lg:grid-cols-[300px,1fr] gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Эксперименты</h3>
              <div className="space-y-2">
                {Object.entries(presets).map(([key, { name, icon }]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedExperiment(key as ExperimentType)}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                      selectedExperiment === (key as ExperimentType)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{icon}</span>
                      <span className="text-sm font-medium">{name}</span>
                    </span>
                    {selectedExperiment === (key as ExperimentType) && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Управление</h3>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={state.isRunning ? pause : play}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {state.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="text-sm font-medium">{state.isRunning ? 'Пауза' : 'Пуск'}</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={step}
                  disabled={state.isRunning}
                  className="w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 text-sm"
                >
                  Шаг
                </button>
                <div>
                  <label className="text-sm text-slate-700 block mb-1">
                    Скорость: {state.timeScale}x
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={state.timeScale}
                    onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Время: {state.time.toFixed(2)} с
                  </div>
                </div>
              </div>
            </div>

            {/* params panels... (left intact from your version) */}
            {selectedExperiment === 'pendulum' && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-slate-800 mb-3">Параметры маятника</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-700 block mb-1">
                      Длина: {pendulumParams.length.toFixed(1)} м
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.1"
                      value={pendulumParams.length}
                      onChange={(e) => setPendulumParams({ ...pendulumParams, length: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700 block mb-1">
                      Угол: {pendulumParams.angle.toFixed(0)}°
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="90"
                      step="1"
                      value={pendulumParams.angle}
                      onChange={(e) => setPendulumParams({ ...pendulumParams, angle: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700 block mb-1">
                      Масса: {pendulumParams.mass.toFixed(1)} кг
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={pendulumParams.mass}
                      onChange={(e) => setPendulumParams({ ...pendulumParams, mass: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700 block mb-1">
                      Затухание: {pendulumParams.damping.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={pendulumParams.damping}
                      onChange={(e) => setPendulumParams({ ...pendulumParams, damping: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                    <div>Теор. период: {calculatePendulumPeriod(pendulumParams.length).toFixed(2)} с</div>
                  </div>
                </div>
              </div>
            )}

            {/* projectile and collision panels kept as in your original code (omitted here for brevity) */}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <canvas
                ref={canvasRef}
                // no fixed width/height attributes — CSS controls size; resizeCanvas will set buffer
                className="w-full h-[600px] border border-slate-200 rounded-lg"
              />
            </div>

            {measured && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">Измерения</h3>
                  <button
                    onClick={() => setShowGraphs(!showGraphs)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>{showGraphs ? 'Скрыть' : 'Показать'} графики</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-slate-600 mb-1">Энергия (кинет.)</div>
                    <div className="font-semibold text-slate-800">
                      {(measured.energy?.kinetic ?? 0).toFixed(2)} Дж
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-slate-600 mb-1">Энергия (потенц.)</div>
                    <div className="font-semibold text-slate-800">
                      {(measured.energy?.potential ?? 0).toFixed(2)} Дж
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-slate-600 mb-1">Полная энергия</div>
                    <div className="font-semibold text-slate-800">
                      {(measured.energy?.total ?? 0).toFixed(2)} Дж
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
