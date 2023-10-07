import { MMath } from '../index';

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

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public toRad(): Vector2 {
    return new Vector2(MMath.degToRad(this.x), MMath.degToRad(this.y));
  }

  public toDeg(): Vector2 {
    return new Vector2(MMath.radToDeg(this.x), MMath.radToDeg(this.y));
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
