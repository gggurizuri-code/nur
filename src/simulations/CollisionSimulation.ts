import { CollisionParams, MeasurementData } from '../types/physics';

export class CollisionSimulation {
  private x1: number;
  private v1: number;
  private x2: number;
  private v2: number;
  private params: CollisionParams;
  private hasCollided: boolean = false;
  private centerX: number;
  private centerY: number;

  constructor(params: CollisionParams, centerX: number, centerY: number) {
    this.params = params;
    this.x1 = -150;
    this.x2 = 50;
    this.v1 = params.v1;
    this.v2 = params.v2;
    this.centerX = centerX;
    this.centerY = centerY;
  }

  update(deltaTime: number) {
    if (!this.hasCollided) {
      this.x1 += this.v1 * deltaTime * 30;
      this.x2 += this.v2 * deltaTime * 30;

      const r1 = Math.sqrt(this.params.m1) * 10;
      const r2 = Math.sqrt(this.params.m2) * 10;

      if (this.x1 + r1 >= this.x2 - r2) {
        this.hasCollided = true;

        const totalMass = this.params.m1 + this.params.m2;
        const v1New =
          ((this.params.m1 - this.params.restitution * this.params.m2) * this.params.v1 +
            this.params.m2 * (1 + this.params.restitution) * this.params.v2) /
          totalMass;
        const v2New =
          ((this.params.m2 - this.params.restitution * this.params.m1) * this.params.v2 +
            this.params.m1 * (1 + this.params.restitution) * this.params.v1) /
          totalMass;

        this.v1 = v1New;
        this.v2 = v2New;
      }
    } else {
      this.x1 += this.v1 * deltaTime * 30;
      this.x2 += this.v2 * deltaTime * 30;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const r1 = Math.sqrt(this.params.m1) * 10;
    const r2 = Math.sqrt(this.params.m2) * 10;

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(this.centerX + this.x1, this.centerY, r1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(this.centerX + this.x2, this.centerY, r2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = '14px sans-serif';
    ctx.fillText(`m₁=${this.params.m1}kg`, this.centerX + this.x1 - 20, this.centerY - r1 - 10);
    ctx.fillText(`m₂=${this.params.m2}kg`, this.centerX + this.x2 - 20, this.centerY - r2 - 10);
    ctx.fillText(`v₁=${this.v1.toFixed(1)}m/s`, this.centerX + this.x1 - 25, this.centerY + r1 + 20);
    ctx.fillText(`v₂=${this.v2.toFixed(1)}m/s`, this.centerX + this.x2 - 25, this.centerY + r2 + 20);
  }

  getMeasurements(): MeasurementData {
    const momentum = this.params.m1 * this.v1 + this.params.m2 * this.v2;
    const kinetic =
      0.5 * this.params.m1 * this.v1 * this.v1 + 0.5 * this.params.m2 * this.v2 * this.v2;

    return {
      position: { x: this.x1, y: this.x2 },
      velocity: { x: this.v1, y: this.v2 },
      acceleration: { x: 0, y: 0 },
      energy: {
        kinetic,
        potential: momentum,
        total: kinetic,
      },
    };
  }

  reset(params: CollisionParams) {
    this.params = params;
    this.x1 = -150;
    this.x2 = 50;
    this.v1 = params.v1;
    this.v2 = params.v2;
    this.hasCollided = false;
  }
}
