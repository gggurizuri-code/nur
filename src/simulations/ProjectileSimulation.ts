import { ProjectileParams, MeasurementData } from '../types/physics';
import { metersToPixels } from '../utils/physics';

export class ProjectileSimulation {
  private x: number = 0; // meters
  private y: number = 0; // meters (height above baseline), positive up
  private vx: number = 0; // m/s
  private vy: number = 0; // m/s (positive up)
  private params: ProjectileParams;
  private trail: { x: number; y: number }[] = [];
  private startX: number;
  private startY: number;
  private hasLanded: boolean = false;

  // store last accelerations for measurements
  private lastAx: number = 0;
  private lastAy: number = 0;

  constructor(params: ProjectileParams, startX: number, startY: number) {
    this.params = params;
    this.startX = startX;
    this.startY = startY;
    this.reset(params);
  }

  update(deltaTime: number) {
    if (this.hasLanded) return;

    // speed for drag calculation
    const speed = Math.hypot(this.vx, this.vy);
    // drag force magnitude (simple linear model Fd = -k * v)
    const k = Math.max(0, this.params.airResistance);

    // acceleration components
    let ax = 0;
    let ay = -this.params.gravity; // gravity points down => negative acceleration in y (y positive up)

    if (speed > 1e-9 && k > 0) {
      const drag = k * speed;
      ax += -(drag * this.vx) / (speed * this.params.mass);
      ay += -(drag * this.vy) / (speed * this.params.mass);
    }

    // save last accelerations
    this.lastAx = ax;
    this.lastAy = ay;

    // integrate (semi-implicit Euler style)
    this.vx += ax * deltaTime;
    this.vy += ay * deltaTime;

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // push trail (limit length)
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 200) this.trail.shift();

    // landing: when height <= 0 (ground)
    if (this.y <= 0) {
      this.y = 0;
      this.hasLanded = true;
      this.vx = 0;
      this.vy = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // translate to baseline point: startX,startY is baseline (CSS pixels)
    ctx.translate(this.startX, this.startY);

    // draw trail and projectile; note: transform origin at baseline, y up is negative canvas Y
    ctx.strokeStyle = '#3b82f680';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < this.trail.length; i++) {
      const p = this.trail[i];
      const px = metersToPixels(p.x);
      const py = -metersToPixels(p.y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // draw projectile
    const px = metersToPixels(this.x);
    const py = -metersToPixels(this.y);
    const radius = Math.max(6, Math.sqrt(this.params.mass) * 5);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // baseline line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10000, 0);
    ctx.lineTo(10000, 0);
    ctx.stroke();

    // info near projectile
    ctx.fillStyle = '#0f172a';
    ctx.font = '13px sans-serif';
    ctx.fillText(`x=${this.x.toFixed(2)} m`, px + radius + 6, py - 6);
    ctx.fillText(`y=${this.y.toFixed(2)} m`, px + radius + 6, py + 12);
    ctx.restore();
  }

  getMeasurements(): MeasurementData {
    const speed = Math.hypot(this.vx, this.vy);
    const kinetic = 0.5 * this.params.mass * speed * speed;
    const potential = this.params.mass * this.params.gravity * this.y; // y is height (m)
    return {
      position: { x: this.x, y: this.y },
      velocity: { x: this.vx, y: this.vy },
      acceleration: { x: this.lastAx, y: this.lastAy },
      energy: {
        kinetic,
        potential,
        total: kinetic + potential,
      },
    };
  }

  getRange(): number {
    return this.x;
  }

  reset(params: ProjectileParams) {
    this.params = params;
    this.x = 0;
    this.y = 0;
    const angleRad = (params.angle * Math.PI) / 180;
    this.vx = params.velocity * Math.cos(angleRad);
    this.vy = params.velocity * Math.sin(angleRad); // positive up
    this.trail = [{ x: this.x, y: this.y }];
    this.hasLanded = false;
    this.lastAx = 0;
    this.lastAy = -this.params.gravity;
  }
}
