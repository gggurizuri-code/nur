import { FreeFallParams, MeasurementData } from '../types/physics';
import { metersToPixels, GRAVITY } from '../utils/physics';

export class FreeFallSimulation {
  private params: FreeFallParams;
  private y: number; // высота над землёй (м)
  private vy: number; // скорость вниз положительная (м/с)
  private hasLanded: boolean = false;
  private centerX: number;
  private groundY: number;

  constructor(params: FreeFallParams, centerX: number, groundY: number) {
    this.params = params;
    this.centerX = centerX;
    this.groundY = groundY;
    this.y = params.initialHeight;
    this.vy = 0;
    this.hasLanded = false;
  }

  update(deltaTime: number) {
    if (this.hasLanded) return;

    const k = Math.max(0, this.params.dragCoefficient);
    // простая линейная модель сопротивления: Fd = -k * v (направление против движения)
    const dragAcc = (k * this.vy) / Math.max(1e-6, this.params.mass);
    // vy положительная — направлена вниз, сопротивление вверх => вычитаем dragAcc
    const ay = (this.params.gravity ?? GRAVITY) - dragAcc;

    this.vy += ay * deltaTime;
    this.y -= this.vy * deltaTime; // y измеряется вверх от земли; уменьшаем высоту при падении

    if (this.y <= 0) {
      this.y = 0;
      this.hasLanded = true;
      // зануляем скорость при посадке
      this.vy = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pxX = this.centerX;
    const pxY = this.groundY;

    // Ground line
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, pxY + 6, ctx.canvas.width, 4);

    // object
    const ballY = pxY - metersToPixels(this.y);
    const radius = Math.max(6, Math.sqrt(this.params.mass) * 6);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(pxX, ballY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#991b1b';
    ctx.stroke();

    // text
    ctx.fillStyle = '#0f172a';
    ctx.font = '13px sans-serif';
    ctx.fillText(`h=${this.y.toFixed(2)} m`, pxX + radius + 8, ballY - 6);
    ctx.fillText(`v=${this.vy.toFixed(2)} m/s`, pxX + radius + 8, ballY + 10);
  }

  getMeasurements(): MeasurementData {
    const kinetic = 0.5 * this.params.mass * this.vy * this.vy;
    const potential = this.params.mass * (this.params.gravity ?? GRAVITY) * this.y;
    return {
      position: { x: 0, y: this.y },
      velocity: { x: 0, y: this.vy },
      acceleration: { x: 0, y: this.params.gravity ?? GRAVITY },
      energy: {
        kinetic,
        potential,
        total: kinetic + potential,
      },
    };
  }

  reset(params: FreeFallParams) {
    this.params = params;
    this.y = params.initialHeight;
    this.vy = 0;
    this.hasLanded = false;
  }
}
