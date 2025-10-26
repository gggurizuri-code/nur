// src/simulations/CircularSimulation.ts
import { CircularParams, MeasurementData } from '../types/physics';
import { metersToPixels } from '../utils/physics';

export class CircularSimulation {
  private params: CircularParams;
  private angle: number = 0; // rad
  private angularVelocity: number = 0; // rad/s (internal, not touching params continuously)
  private centerX: number;
  private centerY: number;
  private readonly EPS = 1e-6;

  constructor(params: CircularParams, centerX: number, centerY: number) {
    // normalize params with safe defaults
    this.params = {
      radius: (params.radius ?? 1) || 1,
      angularVelocity: params.angularVelocity ?? 0,
      mass: params.mass ?? 1,
      friction: params.friction ?? 0,
    };
    this.centerX = centerX;
    this.centerY = centerY;

    // initialize internal angular velocity from params (defensive)
    this.angularVelocity = Number.isFinite(this.params.angularVelocity) ? this.params.angularVelocity : 0;
    if (!Number.isFinite(this.angularVelocity)) this.angularVelocity = 0;
    this.angle = 0;
  }

  update(deltaTime: number) {
    if (!(deltaTime > 0)) return;

    // linear damping model: dω/dt = -friction * ω
    const friction = Number.isFinite(this.params.friction) ? this.params.friction : 0;
    // semi-implicit Euler integration: ω_{n+1} = ω_n + α * dt; θ_{n+1} = θ_n + ω_{n+1} * dt
    // here α = -friction * ω (no external torque)
    const alpha = -friction * this.angularVelocity;
    this.angularVelocity += alpha * deltaTime;
    // protect against tiny noise
    if (Math.abs(this.angularVelocity) < 1e-4) this.angularVelocity = 0;
    this.angle += this.angularVelocity * deltaTime;

    // keep angle bounded to avoid overflow
    if (!Number.isFinite(this.angle)) this.angle = 0;
    if (!Number.isFinite(this.angularVelocity)) this.angularVelocity = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const rMeters = Math.max(0.001, this.params.radius);
    const rPx = metersToPixels(rMeters);
    const cx = this.centerX;
    const cy = this.centerY;

    // circle path
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
    ctx.stroke();

    // moving mass
    const mx = cx + rPx * Math.cos(this.angle);
    const my = cy + rPx * Math.sin(this.angle);
    const drawRadius = Math.max(6, Math.sqrt(Math.max(0.01, this.params.mass)) * 5);

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(mx, my, drawRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.stroke();

    // centripetal force vector (toward center) — visuals only
    const v = Math.abs(this.angularVelocity) * rMeters; // m/s
    const Fc = (this.params.mass * v * v) / Math.max(this.EPS, rMeters);
    // scaled visual length (safe)
    const forceLen = Math.min(0.9 * rPx, (Math.log10(1 + Math.max(0, Fc)) + 0.1) * 8);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    const fx = cx + (mx - cx) * ((rPx - forceLen) / rPx);
    const fy = cy + (my - cy) * ((rPx - forceLen) / rPx);
    ctx.lineTo(fx, fy);
    ctx.stroke();

    // info
    ctx.fillStyle = '#0f172a';
    ctx.font = '13px sans-serif';
    ctx.fillText(`ω=${this.angularVelocity.toFixed(2)} rad/s`, cx + rPx + 8, cy - 4);
    ctx.fillText(`Fc≈${Fc.toFixed(2)} N`, cx + rPx + 8, cy + 12);
  }

  getMeasurements(): MeasurementData {
    const r = Math.max(this.EPS, this.params.radius);
    const omega = this.angularVelocity;
    const v = Math.abs(omega) * r;
    const centripetalAcc = omega * omega * r;
    const kinetic = 0.5 * this.params.mass * v * v;

    return {
      // positions/velocities in meters / m/s (not pixels)
      position: { x: r * Math.cos(this.angle), y: r * Math.sin(this.angle) },
      velocity: { x: -v * Math.sin(this.angle), y: v * Math.cos(this.angle) },
      acceleration: { x: -centripetalAcc * Math.cos(this.angle), y: -centripetalAcc * Math.sin(this.angle) },
      energy: {
        kinetic,
        potential: 0,
        total: kinetic,
      },
    };
  }

  reset(params: CircularParams) {
    this.params = {
      radius: (params.radius ?? 1) || 1,
      angularVelocity: params.angularVelocity ?? 0,
      mass: params.mass ?? 1,
      friction: params.friction ?? 0,
    };
    this.angle = 0;
    this.angularVelocity = Number.isFinite(this.params.angularVelocity) ? this.params.angularVelocity : 0;
  }
}
