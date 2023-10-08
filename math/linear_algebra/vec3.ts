import { MMath } from '../index';
import { Vector4 } from './vec4';

export class Vector3 {
  public x = 0;
  public y = 0;
  public z = 0;

  constructor(x?: number, y?: number, z?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.z = z ?? 0;
  }

  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  public set(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }

  public setXYZ(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public invert(): Vector3 {
    return new Vector3(-this.x, -this.y, -this.z);
  }

  public scale(s: number): Vector3 {
    return this.clone().scale_(s);
  }

  public scale_(s: number): Vector3 {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  public divScalar(s: number): Vector3 {
    return new Vector3(this.x / s, this.y / s, this.z / s);
  }

  public add(v2: Vector3): Vector3 {
    return this.clone().add_(v2);
    // return new Vector3(this.x + v2.x, this.y + v2.y, this.z + v2.z);
  }

  public add_(v2: Vector3): Vector3 {
    this.x += v2.x;
    this.y += v2.y;
    this.z += v2.z;
    return this;
  }

  public sub(v2: Vector3): Vector3 {
    return this.clone().sub_(v2);
    // return new Vector3(this.x - v2.x, this.y - v2.y, this.z - v2.z);
  }

  public sub_(v2: Vector3): Vector3 {
    this.x -= v2.x;
    this.y -= v2.y;
    this.z -= v2.z;
    return this;
  }

  public cross(v2: Vector3): Vector3 {
    let out = new Vector3();
    out.x = this.y * v2.z - this.z * v2.y;
    out.y = this.z * v2.x - this.x * v2.z;
    out.z = this.x * v2.y - this.y * v2.x;
    return out;
  }

  public magnitude(): number {
    let ax = this.x;
    let ay = this.y;
    let az = this.z;
    return Math.sqrt(ax * ax + ay * ay + az * az);
  }

  public squareMagnitude(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public normalize(): Vector3 {
    let v = this.clone();
    let l = this.magnitude();
    if (l == 0) {
      return new Vector3(0, 0, 0);
    }
    v.x /= l;
    v.y /= l;
    v.z /= l;
    return v;
  }

  public dot(v2: Vector3): number {
    return this.x * v2.x + this.y * v2.y + this.z * v2.z;
  }

  public toRad(): Vector3 {
    return new Vector3(MMath.degToRad(this.x), MMath.degToRad(this.y), MMath.degToRad(this.z));
  }

  public toDeg(): Vector3 {
    return new Vector3(MMath.radToDeg(this.x), MMath.radToDeg(this.y), MMath.radToDeg(this.z));
  }

  public toVector4(w: number): Vector4 {
    return new Vector4(this.x, this.y, this.z, w);
  }

  public lerp(v2: Vector3, t: number): Vector3 {
    return new Vector3(
      MMath.lerp(this.x, v2.x, t),
      MMath.lerp(this.y, v2.y, t),
      MMath.lerp(this.z, v2.z, t),
    );
  }

  public static lerp(v1: Vector3, v2: Vector3, t: number): Vector3 {
    return new Vector3(
      MMath.lerp(v1.x, v2.x, t),
      MMath.lerp(v1.y, v2.y, t),
      MMath.lerp(v1.z, v2.z, t),
    );
  }

  public distanceTo(to: Vector3): number {
    let a = this.x - to.x;
    let b = this.y - to.y;
    let c = this.z - to.z;
    return Math.sqrt(a * a + b * b + c * c);
  }

  public static distance(from: Vector3, to: Vector3): number {
    let a = from.x - to.x;
    let b = from.y - to.y;
    let c = from.z - to.z;
    return Math.sqrt(a * a + b * b + c * c);
  }

  public static direction(from: Vector3, to: Vector3): Vector3 {
    return to.sub(from).normalize();
  }

  public static get zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  public static get one(): Vector3 {
    return new Vector3(1, 1, 1);
  }

  public static get forward(): Vector3 {
    return new Vector3(0, 0, -1);
  }

  public static get right(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  public static get up(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  public static dot(v1: Vector3, v2: Vector3): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  public static cross(v1: Vector3, v2: Vector3): Vector3 {
    let out = new Vector3();
    out.x = v1.y * v2.z - v1.z * v2.y;
    out.y = v1.z * v2.x - v1.x * v2.z;
    out.z = v1.x * v2.y - v1.y * v2.x;
    return out;
  }

  public static listFromArray(arr: Float32Array | number[]): Vector3[] {
    let out: Vector3[] = [];
    for (let i = 0; i < arr.length; i += 3) {
      out.push(new Vector3(arr[i], arr[i + 1], arr[i + 2]));
    }
    return out;
  }
}
