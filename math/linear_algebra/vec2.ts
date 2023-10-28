import { MMath } from '../index';
import { Matrix3x3 } from './mat3';

export class Vector2 {
  public x = 0;
  public y = 0;

  constructor(x?: number, y?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
  }

  public add(v2: Vector2): Vector2 {
    return new Vector2(this.x + v2.x, this.y + v2.y);
  }

  public sub(v2: Vector2): Vector2 {
    return new Vector2(this.x - v2.x, this.y - v2.y);
  }

  public scale(s: number): Vector2 {
    return this.clone().scale_(s);
  }

  public scale_(s: number): Vector2 {
    this.x *= s;
    this.y *= s;
    return this;
  }

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public multiplyMatrix3x3(m: Matrix3x3): Vector2 {
    const x = this.x * m.raw[0] + this.y * m.raw[1] + m.raw[2];
    const y = this.x * m.raw[3] + this.y * m.raw[4] + m.raw[5];

    return new Vector2(x, y);
  }

  public distanceTo(to: Vector2): number {
    let a = this.x - to.x;
    let b = this.y - to.y;
    return Math.sqrt(a * a + b * b);
  }

  public toRad(): Vector2 {
    return new Vector2(MMath.degToRad(this.x), MMath.degToRad(this.y));
  }

  public toDeg(): Vector2 {
    return new Vector2(MMath.radToDeg(this.x), MMath.radToDeg(this.y));
  }

  public static get zero(): Vector2 {
    return new Vector2(0, 0);
  }

  public static get one(): Vector2 {
    return new Vector2(1, 1);
  }

  public static distance(from: Vector2, to: Vector2): number {
    let a = from.x - to.x;
    let b = from.y - to.y;
    return Math.sqrt(a * a + b * b);
  }

  public static lerp(v1: Vector2, v2: Vector2, t: number): Vector2 {
    return new Vector2(MMath.lerp(v1.x, v2.x, t), MMath.lerp(v1.y, v2.y, t));
  }

  public static listFromArray(arr: Float32Array | number[]): Vector2[] {
    let out: Vector2[] = [];
    for (let i = 0; i < arr.length; i += 2) {
      out.push(new Vector2(arr[i], arr[i + 1]));
    }
    return out;
  }
}
