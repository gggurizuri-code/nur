export type ExperimentType =
  | 'pendulum'
  | 'projectile'
  | 'freeFall'
  | 'collision'
  | 'circular'
  | 'rotational';

export interface SimulationState {
  isRunning: boolean;
  time: number;
  timeScale: number;
}

export interface PendulumParams {
  length: number;
  angle: number;
  mass: number;
  damping: number;
  gravity: number;
}

export interface ProjectileParams {
  velocity: number;
  angle: number;
  mass: number;
  airResistance: number;
  gravity: number;
}

export interface CollisionParams {
  m1: number;
  v1: number;
  m2: number;
  v2: number;
  restitution: number;
}

export interface CircularParams {
  radius: number;
  angularVelocity: number;
  mass: number;
  friction: number;
}

export interface MeasurementData {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  energy: { kinetic: number; potential: number; total: number };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  experimentType: ExperimentType;
  targetParams: Record<string, number>;
  validation: (measured: Record<string, number>) => { success: boolean; message: string };
}

export interface FreeFallParams {
  initialHeight: number; // метры
  mass: number; // кг
  dragCoefficient: number; // простая линейная "k" (N·s/m)
  gravity: number;
}

export interface RotationalParams {
  torque: number; // Н·м
  inertia: number; // кг·м² (момент инерции)
  angularVelocity: number; // рад/с начальная
  friction: number; // коэффициент трения/затухания (1/s)
}