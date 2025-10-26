// src/simulations/RotationalSimulation.ts
import { RotationalParams, MeasurementData } from '../types/physics';

export class RotationalSimulation {
  private params: RotationalParams;
  private angle: number = 0; // рад
  private angularVelocity: number = 0;
  private centerX: number;
  private centerY: number;

  constructor(params: RotationalParams, centerX: number, centerY: number) {
    this.params = {
      torque: params.torque ?? 0,
      inertia: params.inertia ?? 1,
      angularVelocity: params.angularVelocity ?? 0,
      friction: params.friction ?? 0,
    };
    this.centerX = centerX;
    this.centerY = centerY;
    this.angularVelocity = this.params.angularVelocity;
  }

  update(deltaTime: number) {
    if (!(deltaTime > 0)) return;
    const I = Math.max(1e-6, this.params.inertia);
    // friction torque proportional to angular velocity
    const frictionTorque = (this.params.friction ?? 0) * this.angularVelocity;
    const alpha = (this.params.torque - frictionTorque) / I;

    // semi-implicit Euler
    this.angularVelocity += alpha * deltaTime;
    // kill tiny noise
    if (Math.abs(this.angularVelocity) < 1e-6) this.angularVelocity = 0;
    this.angle += this.angularVelocity * deltaTime;

    // defensive
    if (!Number.isFinite(this.angularVelocity)) this.angularVelocity = 0;
    if (!Number.isFinite(this.angle)) this.angle = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.centerX;
    const cy = this.centerY;
    const radius = 60;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angle);
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#0f172a';
    ctx.font = '13px sans-serif';
    ctx.fillText(`ω=${this.angularVelocity.toFixed(2)} rad/s`, cx + radius + 12, cy - 6);
    ctx.fillText(`τ=${(this.params.torque ?? 0).toFixed(2)} N·m`, cx + radius + 12, cy + 12);
  }

  getMeasurements(): MeasurementData {
    const kinetic = 0.5 * (this.params.inertia ?? 1) * this.angularVelocity * this.angularVelocity;
    return {
      position: { x: this.angle, y: 0 },
      velocity: { x: this.angularVelocity, y: 0 },
      acceleration: { x: 0, y: 0 },
      energy: {
        kinetic,
        potential: 0,
        total: kinetic,
      },
    };
  }

  reset(params: RotationalParams) {
    this.params = {
      torque: params.torque ?? 0,
      inertia: params.inertia ?? 1,
      angularVelocity: params.angularVelocity ?? 0,
      friction: params.friction ?? 0,
    };
    this.angle = 0;
    this.angularVelocity = this.params.angularVelocity;
  }
}
