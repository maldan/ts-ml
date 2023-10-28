import { Vector2 } from './vec2';
import { Vector3 } from './vec3';

export class Matrix3x3 {
  public raw: Float32Array = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0]);

  constructor(r: Float32Array | number[] | undefined = undefined) {
    if (r) {
      if (r instanceof Float32Array) this.raw = r;
      else this.raw = new Float32Array(r);
    } else this.raw = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }

  public static get identity(): Matrix3x3 {
    return new Matrix3x3(new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]));
  }

  public clone(): Matrix3x3 {
    const r = new Float32Array(9);
    r.set(this.raw, 0);
    return new Matrix3x3(r);
  }

  public mul(m: Matrix3x3): Matrix3x3 {
    const result = new Matrix3x3();
    const a = this.raw;
    const b = m.raw;
    const c = result.raw;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let sum = 0;
        for (let k = 0; k < 3; k++) {
          sum += a[i * 3 + k] * b[k * 3 + j];
        }
        c[i * 3 + j] = sum;
      }
    }

    return result;
  }

  public rotate(angle: number, unit: 'deg' | 'rad'): Matrix3x3 {
    if (unit === 'deg') angle = (angle / 180.0) * Math.PI;

    let c = Math.cos(angle);
    let s = Math.sin(angle);
    const m = Matrix3x3.identity;

    m.raw[0] = c;
    m.raw[1] = -s;

    m.raw[3] = s;
    m.raw[4] = c;

    return this.mul(m);
  }

  public translate(v: Vector2): Matrix3x3 {
    const translationMatrix = new Matrix3x3([1, 0, v.x, 0, 1, v.y, 0, 0, 1]);

    // Умножаем текущую матрицу на матрицу переноса
    const resultMatrix = new Matrix3x3();

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let sum = 0;
        for (let k = 0; k < 3; k++) {
          sum += this.raw[i * 3 + k] * translationMatrix.raw[k * 3 + j];
        }
        resultMatrix.raw[i * 3 + j] = sum;
      }
    }

    return resultMatrix;
  }

  public scale(v: Vector2): Matrix3x3 {
    let m = this.clone();

    m.raw[0] *= v.x;
    m.raw[1] *= v.x;
    m.raw[2] *= v.x;

    m.raw[3] *= v.y;
    m.raw[4] *= v.y;
    m.raw[5] *= v.y;

    return m;
  }

  public getPosition(): Vector2 {
    return new Vector2(this.raw[2], this.raw[5]);
  }
}
