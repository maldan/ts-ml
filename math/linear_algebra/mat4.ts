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

  public static perspective(fov: number, aspect: number, near: number, far: number): Matrix4x4 {
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

  public static lookAt(eye: Vector3, at: Vector3, up: Vector3): Matrix4x4 {
    let zaxis = at.sub(eye).normalize();
    let xaxis = zaxis.cross(up).normalize();
    let yaxis = xaxis.cross(zaxis);

    zaxis = zaxis.invert();

    let viewMatrix = new Matrix4x4();
    viewMatrix.raw = new Float32Array([
      xaxis.x,
      xaxis.y,
      xaxis.z,
      -xaxis.dot(eye),
      yaxis.x,
      yaxis.y,
      yaxis.z,
      -yaxis.dot(eye),
      zaxis.x,
      zaxis.y,
      zaxis.z,
      -zaxis.dot(eye),
      0,
      0,
      0,
      1,
    ]);

    return viewMatrix;
  }
  /*public static lookAt(forward: Vector3, upwards: Vector3): Matrix4x4 {
    const zAxis = forward.normalize();
    const xAxis = upwards.cross(zAxis).normalize();
    const yAxis = zAxis.cross(xAxis);
    const m = new Matrix4x4();

    m.raw[0] = xAxis.x;
    m.raw[1] = xAxis.y;
    m.raw[2] = xAxis.z;
    m.raw[3] = 0;
    m.raw[4] = yAxis.x;
    m.raw[5] = yAxis.y;
    m.raw[6] = yAxis.z;
    m.raw[7] = 0;
    m.raw[8] = zAxis.x;
    m.raw[9] = zAxis.y;
    m.raw[10] = zAxis.z;
    m.raw[11] = 0;
    m.raw[12] = 0;
    m.raw[13] = 0;
    m.raw[14] = 0;
    m.raw[15] = 1;

    return m;
  }*/

  public invert(): Matrix4x4 {
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

    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (det == 0) {
      return new Matrix4x4();
    }
    det = 1.0 / det;

    let m = new Matrix4x4();
    m.raw[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    m.raw[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    m.raw[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    m.raw[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    m.raw[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    m.raw[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    m.raw[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    m.raw[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    m.raw[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    m.raw[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    m.raw[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    m.raw[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    m.raw[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    m.raw[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    m.raw[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    m.raw[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return m;
  }

  public identity_(): Matrix4x4 {
    this.raw[0] = 1;
    this.raw[1] = 0;
    this.raw[2] = 0;
    this.raw[3] = 0;

    this.raw[4] = 0;
    this.raw[5] = 1;
    this.raw[6] = 0;
    this.raw[7] = 0;

    this.raw[8] = 0;
    this.raw[9] = 0;
    this.raw[10] = 1;
    this.raw[11] = 0;

    this.raw[12] = 0;
    this.raw[13] = 0;
    this.raw[14] = 0;
    this.raw[15] = 1;

    return this;
  }

  public clone(): Matrix4x4 {
    const r = new Float32Array(16);
    r.set(this.raw, 0);
    return new Matrix4x4(r);
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
    return this.clone().translate_(v);
    /*let a00 = this.raw[0];
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

    return m;*/
  }

  public translate_(v: Vector3): Matrix4x4 {
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

    this.raw[0] = a00;
    this.raw[1] = a01;
    this.raw[2] = a02;
    this.raw[3] = a03;
    this.raw[4] = a10;
    this.raw[5] = a11;
    this.raw[6] = a12;
    this.raw[7] = a13;
    this.raw[8] = a20;
    this.raw[9] = a21;
    this.raw[10] = a22;
    this.raw[11] = a23;
    this.raw[12] = a00 * v.x + a10 * v.y + a20 * v.z + this.raw[12];
    this.raw[13] = a01 * v.x + a11 * v.y + a21 * v.z + this.raw[13];
    this.raw[14] = a02 * v.x + a12 * v.y + a22 * v.z + this.raw[14];
    this.raw[15] = a03 * v.x + a13 * v.y + a23 * v.z + this.raw[15];

    return this;
  }

  public rotateQuaternion(q: Quaternion): Matrix4x4 {
    return this.mul(q.toMatrix4x4());
  }

  public rotateQuaternion_(q: Quaternion): Matrix4x4 {
    return this.mul_(q.toMatrix4x4());
  }

  public scale(v: Vector3): Matrix4x4 {
    return this.clone().scale_(v);
  }

  public scale_(v: Vector3): Matrix4x4 {
    let m = this;

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

  public mul(b: Matrix4x4): Matrix4x4 {
    return this.clone().mul_(b);

    /*let m = this.clone();

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

    return m;*/
  }

  public mul_(b: Matrix4x4): Matrix4x4 {
    let m = this;

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

  public mulVector4(v: Vector4): Vector4 {
    let result = new Vector4();

    result.x = v.x * this.raw[0] + v.y * this.raw[1] + v.z * this.raw[2] + v.w * this.raw[3];
    result.y = v.x * this.raw[4] + v.y * this.raw[5] + v.z * this.raw[6] + v.w * this.raw[7];
    result.z = v.x * this.raw[8] + v.y * this.raw[9] + v.z * this.raw[10] + v.w * this.raw[11];
    result.w = v.x * this.raw[12] + v.y * this.raw[13] + v.z * this.raw[14] + v.w * this.raw[15];

    return result;
  }

  public mulVector3(v: Vector3): Vector3 {
    const result = new Array(3); // Результат - это 3D точка
    for (let i = 0; i < 3; i++) {
      result[i] = 0;
      result[i] += this.raw[i * 4] * v.x;
      result[i] += this.raw[i * 4 + 1] * v.y;
      result[i] += this.raw[i * 4 + 2] * v.z;
      result[i] += this.raw[i * 4 + 3]; // Учитываем смещение в четвертом столбце матрицы
    }
    return new Vector3(result[0], result[1], result[2]);
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

  public static targetTo(eye: Vector3, target: Vector3, up: Vector3): Matrix4x4 {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    let eyex = eye.x;
    let eyey = eye.y;
    let eyez = eye.z;
    let upx = up.x;
    let upy = up.y;
    let upz = up.z;
    let centerx = target.x;
    let centery = target.y;
    let centerz = target.z;

    if (
      Math.abs(eyex - centerx) < 0.000001 &&
      Math.abs(eyey - centery) < 0.000001 &&
      Math.abs(eyez - centerz) < 0.000001
    ) {
      return Matrix4x4.identity();
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      len = 1 / len;
      y0 *= len;
      y1 *= len;
      y2 *= len;
    }

    let out = new Matrix4x4();
    out.raw[0] = x0;
    out.raw[1] = y0;
    out.raw[2] = z0;
    out.raw[3] = 0;
    out.raw[4] = x1;
    out.raw[5] = y1;
    out.raw[6] = z1;
    out.raw[7] = 0;
    out.raw[8] = x2;
    out.raw[9] = y2;
    out.raw[10] = z2;
    out.raw[11] = 0;
    out.raw[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out.raw[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out.raw[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out.raw[15] = 1;
    return out;
  }

  public toString() {
    const r = this.raw;
    return `(
      ${r[0]}, ${r[1]}, ${r[2]}, ${r[3]},
      ${r[4]}, ${r[5]}, ${r[6]}, ${r[7]},
      ${r[8]}, ${r[9]}, ${r[10]}, ${r[11]},
      ${r[12]}, ${r[13]}, ${r[14]}, ${r[15]},
    )`;
  }
}
