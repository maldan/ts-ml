import { MMath } from '../index';
import { Matrix4x4 } from './mat4';
import { Vector3 } from './vec3';

export class Vector4 {
  public x = 0;
  public y = 0;
  public z = 0;
  public w = 0;

  constructor(x?: number, y?: number, z?: number, w?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.z = z ?? 0;
    this.w = w ?? 0;
  }

  public scale(s: number): Vector4 {
    return new Vector4(this.x * s, this.y * s, this.z * s, this.w * s);
  }

  public add(v2: Vector4): Vector4 {
    return new Vector4(this.x + v2.x, this.y + v2.y, this.z + v2.z, this.w + v2.w);
  }

  public sub(v2: Vector4): Vector4 {
    return new Vector4(this.x - v2.x, this.y - v2.y, this.z - v2.z, this.w - v2.w);
  }

  public magnitude(): number {
    let ax = this.x;
    let ay = this.y;
    let az = this.z;
    let aw = this.w;
    return Math.sqrt(ax * ax + ay * ay + az * az + aw * aw);
  }

  public clone(): Vector4 {
    return new Vector4(this.x, this.y, this.z, this.w);
  }

  public normalize(): Vector4 {
    let v = this.clone();
    let l = this.magnitude();
    if (l == 0) {
      return new Vector4();
    }
    v.x /= l;
    v.y /= l;
    v.z /= l;
    v.w /= l;
    return v;
  }

  public toRad(): Vector4 {
    return new Vector4(
      MMath.degToRad(this.x),
      MMath.degToRad(this.y),
      MMath.degToRad(this.z),
      MMath.degToRad(this.w),
    );
  }

  public toDeg(): Vector4 {
    return new Vector4(
      MMath.radToDeg(this.x),
      MMath.radToDeg(this.y),
      MMath.radToDeg(this.z),
      MMath.radToDeg(this.w),
    );
  }

  public toVector3(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  public multiplyMatrix(m: Matrix4x4): Vector4 {
    let result = new Vector4();

    result.x = this.x * m.raw[0] + this.y * m.raw[4] + this.z * m.raw[8] + this.w * m.raw[12];
    result.y = this.x * m.raw[1] + this.y * m.raw[5] + this.z * m.raw[9] + this.w * m.raw[13];
    result.z = this.x * m.raw[2] + this.y * m.raw[6] + this.z * m.raw[10] + this.w * m.raw[14];
    result.w = this.x * m.raw[3] + this.y * m.raw[7] + this.z * m.raw[11] + this.w * m.raw[15];

    return result;
  }

  public static lerp(v1: Vector4, v2: Vector4, t: number): Vector4 {
    return new Vector4(
      MMath.lerp(v1.x, v2.x, t),
      MMath.lerp(v1.y, v2.y, t),
      MMath.lerp(v1.z, v2.z, t),
      MMath.lerp(v1.w, v2.w, t),
    );
  }

  public static listFromArray(arr: Float32Array | number[]): Vector4[] {
    let out: Vector4[] = [];
    for (let i = 0; i < arr.length; i += 4) {
      out.push(new Vector4(arr[i], arr[i + 1], arr[i + 2], arr[i + 3]));
    }
    return out;
  }
}
