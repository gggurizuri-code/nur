import { PendulumParams, MeasurementData } from '../types/physics';
import { metersToPixels, GRAVITY } from '../utils/physics';

export class PendulumSimulation {
  private angle: number;
  private angularVelocity: number = 0;
  private params: PendulumParams;
  private centerX: number;
  private centerY: number;

  constructor(params: PendulumParams, centerX: number, centerY: number) {
    this.params = params;
    this.angle = (params.angle * Math.PI) / 180;
    this.centerX = centerX;
    this.centerY = centerY;
  }

  update(deltaTime: number) {
    const angularAcceleration =
      (-this.params.gravity / this.params.length) * Math.sin(this.angle) -
      this.params.damping * this.angularVelocity;

    this.angularVelocity += angularAcceleration * deltaTime;
    this.angle += this.angularVelocity * deltaTime;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const length = metersToPixels(this.params.length);
    const bobX = this.centerX + length * Math.sin(this.angle);
    const bobY = this.centerY + length * Math.cos(this.angle);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.centerX, this.centerY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, 6, 0, Math.PI * 2);
    ctx.fill();

    const radius = Math.sqrt(this.params.mass) * 8;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(bobX, bobY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  getMeasurements(): MeasurementData {
    const length = this.params.length;
    const x = length * Math.sin(this.angle);
    const y = length * Math.cos(this.angle);
    const vx = length * this.angularVelocity * Math.cos(this.angle);
    const vy = -length * this.angularVelocity * Math.sin(this.angle);
    const velocity = Math.sqrt(vx * vx + vy * vy);
    const height = length * (1 - Math.cos(this.angle));

    const kinetic = 0.5 * this.params.mass * velocity * velocity;
    const potential = this.params.mass * this.params.gravity * height;

    return {
      position: { x, y },
      velocity: { x: vx, y: vy },
      acceleration: { x: 0, y: 0 },
      energy: {
        kinetic,
        potential,
        total: kinetic + potential,
      },
    };
  }

  getAngle(): number {
    return (this.angle * 180) / Math.PI;
  }

  reset(params: PendulumParams) {
    this.params = params;
    this.angle = (params.angle * Math.PI) / 180;
    this.angularVelocity = 0;
  }
}
