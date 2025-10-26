// src/simulations/CollisionSimulation.ts
import { CollisionParams, MeasurementData } from '../types/physics';
import { metersToPixels, pixelsToMeters, PIXELS_PER_METER } from '../utils/physics';

/**
 * CollisionSimulation
 * - internal units: meters (position) and m/s (velocity)
 * - drawing uses metersToPixels to convert to canvas pixels
 */
export class CollisionSimulation {
  private x1: number; // meters
  private v1: number; // m/s
  private x2: number; // meters
  private v2: number; // m/s
  private params: CollisionParams;
  private hasCollided: boolean = false;
  private centerX: number; // CSS pixels center
  private centerY: number; // CSS pixels center

  // visual radii in pixels (derived from mass) - kept for drawing/collision check
  private getRpx1(): number {
    return Math.sqrt(Math.max(0.01, this.params.m1)) * 10;
  }
  private getRpx2(): number {
    return Math.sqrt(Math.max(0.01, this.params.m2)) * 10;
  }

  constructor(params: CollisionParams, centerX: number, centerY: number) {
    this.params = { ...params };
    // convert initial pixel offsets to meters so positions are in meters internally
    // original code used -150 and 50 pixels; keep same initial separation but in meters
    this.x1 = pixelsToMeters(-150);
    this.x2 = pixelsToMeters(50);
    // velocities in params are assumed m/s => use directly
    this.v1 = params.v1;
    this.v2 = params.v2;
    this.centerX = centerX;
    this.centerY = centerY;
  }

  update(deltaTime: number) {
    if (!(deltaTime > 0)) return;

    if (!this.hasCollided) {
      // simple constant velocity before collision (no forces)
      this.x1 += this.v1 * deltaTime;
      this.x2 += this.v2 * deltaTime;

      // compute pixel positions for collision detection
      const px1 = this.centerX + metersToPixels(this.x1);
      const px2 = this.centerX + metersToPixels(this.x2);
      const r1 = this.getRpx1();
      const r2 = this.getRpx2();

      if (px1 + r1 >= px2 - r2) {
        // collision event: compute post-collision velocities (1D)
        this.hasCollided = true;

        const m1 = Math.max(1e-6, this.params.m1);
        const m2 = Math.max(1e-6, this.params.m2);
        const e = Math.max(0, Math.min(1, this.params.restitution ?? 1));

        // use current velocities v1 and v2 (in m/s) for computation
        const v1_before = this.v1;
        const v2_before = this.v2;

        // standard formula for 1D with restitution e:
        // v1' = (m1 - e*m2)/(m1+m2) * v1 + (1+e)*m2/(m1+m2) * v2
        // v2' = (1+e)*m1/(m1+m2) * v1 + (m2 - e*m1)/(m1+m2) * v2
        const denom = m1 + m2;
        const v1New =
          ((m1 - e * m2) * v1_before + (1 + e) * m2 * v2_before) / denom;
        const v2New =
          ((1 + e) * m1 * v1_before + (m2 - e * m1) * v2_before) / denom;

        this.v1 = v1New;
        this.v2 = v2New;
      }
    } else {
      // after collision bodies continue with new velocities
      this.x1 += this.v1 * deltaTime;
      this.x2 += this.v2 * deltaTime;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const r1 = this.getRpx1();
    const r2 = this.getRpx2();

    // pixel coordinates
    const px1 = this.centerX + metersToPixels(this.x1);
    const px2 = this.centerX + metersToPixels(this.x2);

    // body 1
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(px1, this.centerY, r1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.stroke();

    // body 2
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(px2, this.centerY, r2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // labels and velocities (show m/s)
    ctx.fillStyle = '#475569';
    ctx.font = '14px sans-serif';
    ctx.fillText(`m₁=${this.params.m1}kg`, px1 - 20, this.centerY - r1 - 10);
    ctx.fillText(`m₂=${this.params.m2}kg`, px2 - 20, this.centerY - r2 - 10);
    ctx.fillText(`v₁=${this.v1.toFixed(2)} m/s`, px1 - 30, this.centerY + r1 + 20);
    ctx.fillText(`v₂=${this.v2.toFixed(2)} m/s`, px2 - 30, this.centerY + r2 + 20);
  }

  getMeasurements(): MeasurementData {
    // positions in meters, velocities in m/s
    const momentum = this.params.m1 * this.v1 + this.params.m2 * this.v2; // kg·m/s
    const kinetic =
      0.5 * this.params.m1 * this.v1 * this.v1 + 0.5 * this.params.m2 * this.v2 * this.v2; // J

    return {
      position: { x: this.x1, y: this.x2 }, // metres
      velocity: { x: this.v1, y: this.v2 }, // m/s
      acceleration: { x: 0, y: 0 },
      energy: {
        kinetic,
        potential: 0,
        total: kinetic,
      },
    };
  }

  reset(params: CollisionParams) {
    this.params = { ...params };
    this.x1 = pixelsToMeters(-150);
    this.x2 = pixelsToMeters(50);
    this.v1 = params.v1;
    this.v2 = params.v2;
    this.hasCollided = false;
  }
}
