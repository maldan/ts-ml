import { Vector3 } from './vec3';
import { Quaternion } from './quaternion';
import { Vector4 } from './vec4';

export class Matrix4x4 {
  public raw: Float32Array = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  constructor(r: Float32Array | undefined = undefined) {
    if (r) this.raw = r;
    else this.raw = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }

  public static identity(): Matrix4x4 {
    return new Matrix4x4(new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
  }

  public clone(): Matrix4x4 {
    const r = new Float32Array(16);
    r.set(this.raw, 0);
    return new Matrix4x4(r);
  }

  public perspective(fov: number, aspect: number, near: number, far: number): Matrix4x4 {
    let m = new Matrix4x4();
    let f = 1.0 / Math.tan(fov / 2.0);

    m.raw[0] = f / aspect;
    m.raw[1] = 0;
    m.raw[2] = 0;
    m.raw[3] = 0;
    m.raw[4] = 0;
    m.raw[5] = f;
    m.raw[6] = 0;
    m.raw[7] = 0;
    m.raw[8] = 0;
    m.raw[9] = 0;
    m.raw[11] = -1.0;
    m.raw[12] = 0;
    m.raw[13] = 0;
    m.raw[15] = 0;

    m.raw[10] = (far + near) / (near - far);
    m.raw[14] = (2.0 * far * near) / (near - far);

    return m;
  }

  public transpose(): Matrix4x4 {
    const r = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        r[i * 4 + j] = this.raw[j * 4 + i];
      }
    }

    return new Matrix4x4(r);
  }

  public translate(v: Vector3): Matrix4x4 {
    let a00 = this.raw[0];
    let a01 = this.raw[1];
    let a02 = this.raw[2];
    let a03 = this.raw[3];
    let a10 = this.raw[4];
    let a11 = this.raw[5];
    let a12 = this.raw[6];
    let a13 = this.raw[7];
    let a20 = this.raw[8];
    let a21 = this.raw[9];
    let a22 = this.raw[10];
    let a23 = this.raw[11];

    let m = this.clone();

    m.raw[0] = a00;
    m.raw[1] = a01;
    m.raw[2] = a02;
    m.raw[3] = a03;
    m.raw[4] = a10;
    m.raw[5] = a11;
    m.raw[6] = a12;
    m.raw[7] = a13;
    m.raw[8] = a20;
    m.raw[9] = a21;
    m.raw[10] = a22;
    m.raw[11] = a23;
    m.raw[12] = a00 * v.x + a10 * v.y + a20 * v.z + m.raw[12];
    m.raw[13] = a01 * v.x + a11 * v.y + a21 * v.z + m.raw[13];
    m.raw[14] = a02 * v.x + a12 * v.y + a22 * v.z + m.raw[14];
    m.raw[15] = a03 * v.x + a13 * v.y + a23 * v.z + m.raw[15];

    return m;
  }

  public rotateQuaternion(q: Quaternion): Matrix4x4 {
    let mm = q.toMatrix4x4();
    return this.multiply(mm);
  }

  public scale(v: Vector3): Matrix4x4 {
    let m = this.clone();

    m.raw[0] *= v.x;
    m.raw[1] *= v.x;
    m.raw[2] *= v.x;
    m.raw[3] *= v.x;

    m.raw[4] *= v.y;
    m.raw[5] *= v.y;
    m.raw[6] *= v.y;
    m.raw[7] *= v.y;

    m.raw[8] *= v.z;
    m.raw[9] *= v.z;
    m.raw[10] *= v.z;
    m.raw[11] *= v.z;

    return m;
  }

  public multiply(b: Matrix4x4): Matrix4x4 {
    let m = this.clone();

    let a00 = this.raw[0];
    let a01 = this.raw[1];
    let a02 = this.raw[2];
    let a03 = this.raw[3];
    let a10 = this.raw[4];
    let a11 = this.raw[5];
    let a12 = this.raw[6];
    let a13 = this.raw[7];
    let a20 = this.raw[8];
    let a21 = this.raw[9];
    let a22 = this.raw[10];
    let a23 = this.raw[11];
    let a30 = this.raw[12];
    let a31 = this.raw[13];
    let a32 = this.raw[14];
    let a33 = this.raw[15];

    // Cache only the current line of the second matrix
    let b0 = b.raw[0];
    let b1 = b.raw[1];
    let b2 = b.raw[2];
    let b3 = b.raw[3];
    m.raw[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    m.raw[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    m.raw[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    m.raw[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b.raw[4];
    b1 = b.raw[5];
    b2 = b.raw[6];
    b3 = b.raw[7];
    m.raw[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    m.raw[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    m.raw[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    m.raw[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b.raw[8];
    b1 = b.raw[9];
    b2 = b.raw[10];
    b3 = b.raw[11];
    m.raw[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    m.raw[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    m.raw[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    m.raw[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b.raw[12];
    b1 = b.raw[13];
    b2 = b.raw[14];
    b3 = b.raw[15];
    m.raw[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    m.raw[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    m.raw[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    m.raw[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    return m;
  }

  public multiplyVector(v: Vector4): Vector4 {
    let result = new Vector4();

    result.x = v.x * this.raw[0] + v.y * this.raw[1] + v.z * this.raw[2] + v.w * this.raw[3];
    result.y = v.x * this.raw[4] + v.y * this.raw[5] + v.z * this.raw[6] + v.w * this.raw[7];
    result.z = v.x * this.raw[8] + v.y * this.raw[9] + v.z * this.raw[10] + v.w * this.raw[11];
    result.w = v.x * this.raw[12] + v.y * this.raw[13] + v.z * this.raw[14] + v.w * this.raw[15];

    return result;
  }

  public getPosition(): Vector3 {
    return new Vector3(this.raw[12], this.raw[13], this.raw[14]);
  }

  public getScale(): Vector3 {
    let m11 = this.raw[0];
    let m12 = this.raw[1];
    let m13 = this.raw[2];
    let m21 = this.raw[4];
    let m22 = this.raw[5];
    let m23 = this.raw[6];
    let m31 = this.raw[8];
    let m32 = this.raw[9];
    let m33 = this.raw[10];

    return new Vector3(
      Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13),
      Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23),
      Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33),
    );
  }

  public getRotation(): Quaternion {
    let scaling = this.getScale();

    let is1 = 1.0 / scaling.x;
    let is2 = 1.0 / scaling.y;
    let is3 = 1.0 / scaling.z;

    let sm11 = this.raw[0] * is1;
    let sm12 = this.raw[1] * is2;
    let sm13 = this.raw[2] * is3;
    let sm21 = this.raw[4] * is1;
    let sm22 = this.raw[5] * is2;
    let sm23 = this.raw[6] * is3;
    let sm31 = this.raw[8] * is1;
    let sm32 = this.raw[9] * is2;
    let sm33 = this.raw[10] * is3;

    let trace = sm11 + sm22 + sm33;
    let s = 0.0;
    let out = Quaternion.identity();

    if (trace > 0.0) {
      s = Math.sqrt(trace + 1.0) * 2.0;
      out.x = (sm23 - sm32) / s;
      out.y = (sm31 - sm13) / s;
      out.z = (sm12 - sm21) / s;
      out.w = 0.25 * s;
    } else if (sm11 > sm22 && sm11 > sm33) {
      s = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2.0;
      out.x = 0.25 * s;
      out.y = (sm12 + sm21) / s;
      out.z = (sm31 + sm13) / s;
      out.w = (sm23 - sm32) / s;
    } else if (sm22 > sm33) {
      s = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2.0;
      out.x = (sm12 + sm21) / s;
      out.y = 0.25 * s;
      out.z = (sm23 + sm32) / s;
      out.w = (sm31 - sm13) / s;
    } else {
      s = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2.0;
      out.x = (sm31 + sm13) / s;
      out.y = (sm23 + sm32) / s;
      out.z = 0.25 * s;
      out.w = (sm12 - sm21) / s;
    }

    return out;
  }
}
