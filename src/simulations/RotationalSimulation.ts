import { CircularParams, MeasurementData } from '../types/physics';
import { metersToPixels } from '../utils/physics';

export class CircularSimulation {
  private params: CircularParams;
  private angle: number = 0; // rad
  private centerX: number;
  private centerY: number;

  constructor(params: CircularParams, centerX: number, centerY: number) {
    this.params = params;
    this.centerX = centerX;
    this.centerY = centerY;
    // ensure numeric defaults
    this.params.radius = Math.max(0.001, this.params.radius ?? 1);
    this.params.angularVelocity = this.params.angularVelocity ?? 0;
    this.params.mass = this.params.mass ?? 1;
    this.params.friction = this.params.friction ?? 0;
  }

  update(deltaTime: number) {
    // linear damping model: dω/dt = -friction * ω
    const friction = this.params.friction ?? 0;
    // simple Euler decay
    this.params.angularVelocity += -friction * this.params.angularVelocity * deltaTime;
    // integrate angle
    this.angle += this.params.angularVelocity * deltaTime;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const rMeters = Math.max(0.001, this.params.radius);
    const rPx = metersToPixels(rMeters);
    const cx = this.centerX;
    const cy = this.centerY;

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
    ctx.stroke();

    const mx = cx + rPx * Math.cos(this.angle);
    const my = cy + rPx * Math.sin(this.angle);
    const radius = Math.max(6, Math.sqrt(this.params.mass) * 5);

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(mx, my, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.stroke();

    // draw centripetal force vector (toward center) — scaled visually
    const v = Math.abs(this.params.angularVelocity) * rMeters; // m/s
    const Fc = (this.params.mass * v * v) / Math.max(1e-6, rMeters);
    // visual length with safe log scale
    const forceLen = Math.min(0.9 * rPx, (Math.log10(1 + Math.max(0, Fc)) + 0.1) * 8);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    const fx = cx + (mx - cx) * ((rPx - forceLen) / rPx);
    const fy = cy + (my - cy) * ((rPx - forceLen) / rPx);
    ctx.lineTo(fx, fy);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '13px sans-serif';
    ctx.fillText(`ω=${this.params.angularVelocity.toFixed(2)} rad/s`, cx + rPx + 8, cy - 4);
    ctx.fillText(`Fc≈${Fc.toFixed(2)} N`, cx + rPx + 8, cy + 12);
  }

  getMeasurements(): MeasurementData {
    const r = this.params.radius;
    const omega = this.params.angularVelocity;
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
    this.params = params;
    this.params.radius = Math.max(0.001, this.params.radius ?? 1);
    this.params.angularVelocity = this.params.angularVelocity ?? 0;
    this.angle = 0;
  }
}
