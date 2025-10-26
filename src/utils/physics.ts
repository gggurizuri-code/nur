export const GRAVITY = 9.81;
export const PIXELS_PER_METER = 50;

export function metersToPixels(meters: number): number {
  return meters * PIXELS_PER_METER;
}

export function pixelsToMeters(pixels: number): number {
  return pixels / PIXELS_PER_METER;
}

export function calculatePendulumPeriod(length: number, gravity: number = GRAVITY): number {
  return 2 * Math.PI * Math.sqrt(length / gravity);
}

export function calculateProjectileRange(velocity: number, angle: number, gravity: number = GRAVITY): number {
  const angleRad = (angle * Math.PI) / 180;
  return (velocity * velocity * Math.sin(2 * angleRad)) / gravity;
}

export function calculateProjectileMaxHeight(velocity: number, angle: number, gravity: number = GRAVITY): number {
  const angleRad = (angle * Math.PI) / 180;
  return (velocity * velocity * Math.sin(angleRad) * Math.sin(angleRad)) / (2 * gravity);
}

export function calculateElasticCollision(m1: number, v1: number, m2: number, v2: number, e: number = 1): { v1Final: number; v2Final: number } {
  const v1Final = ((m1 - e * m2) * v1 + m2 * (1 + e) * v2) / (m1 + m2);
  const v2Final = ((m2 - e * m1) * v2 + m1 * (1 + e) * v1) / (m1 + m2);
  return { v1Final, v2Final };
}

export function calculateKineticEnergy(mass: number, velocity: number): number {
  return 0.5 * mass * velocity * velocity;
}

export function calculatePotentialEnergy(mass: number, height: number, gravity: number = GRAVITY): number {
  return mass * gravity * height;
}

export function calculateCentripetalForce(mass: number, velocity: number, radius: number): number {
  return (mass * velocity * velocity) / radius;
}

export function calculateTerminalVelocity(mass: number, dragCoefficient: number, gravity: number = GRAVITY): number {
  return Math.sqrt((2 * mass * gravity) / dragCoefficient);
}
