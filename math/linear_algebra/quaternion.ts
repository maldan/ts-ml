import { Vector3 } from './vec3';
import { Matrix4x4 } from './mat4';

export class Quaternion {
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

  public static identity(): Quaternion {
    return new Quaternion(0, 0, 0, 1);
  }

  public clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  public toMatrix4x4(): Matrix4x4 {
    let w = this.w;
    let x = this.x;
    let y = this.y;
    let z = this.z;

    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;
    let xx = x * x2;
    let xy = x * y2;
    let xz = x * z2;
    let yy = y * y2;
    let yz = y * z2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;

    let mx = new Matrix4x4().identity();

    mx.raw[0] = 1.0 - (yy + zz);
    mx.raw[4] = xy - wz;
    mx.raw[8] = xz + wy;

    mx.raw[1] = xy + wz;
    mx.raw[5] = 1.0 - (xx + zz);
    mx.raw[9] = yz - wx;

    mx.raw[2] = xz - wy;
    mx.raw[6] = yz + wx;
    mx.raw[10] = 1.0 - (xx + yy);

    // last column
    mx.raw[3] = 0.0;
    mx.raw[7] = 0.0;
    mx.raw[11] = 0.0;

    // bottom row
    mx.raw[12] = 0.0;
    mx.raw[13] = 0.0;
    mx.raw[14] = 0.0;
    mx.raw[15] = 1.0;

    return mx;
  }

  public magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }

  public normalize(): Quaternion {
    let magnitude = this.magnitude();
    return new Quaternion(
      this.x / magnitude,
      this.y / magnitude,
      this.z / magnitude,
      this.w / magnitude,
    );
  }

  public mul(q2: Quaternion): Quaternion {
    /*let x1 = this.x;
    let y1 = this.y;
    let z1 = this.z;
    let w1 = this.w;

    let x2 = q2.x;
    let y2 = q2.y;
    let z2 = q2.z;
    let w2 = q2.w;

    return new Quaternion(
      w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
      w1 * y2 + y1 * w2 + z1 * x2 - x1 * z2,
      w1 * z2 + z1 * w2 + x1 * y2 - y1 * x2,
      w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
    );*/
    return this.clone().mul_(q2);
  }

  public mul_(q2: Quaternion): Quaternion {
    let x1 = this.x;
    let y1 = this.y;
    let z1 = this.z;
    let w1 = this.w;

    let x2 = q2.x;
    let y2 = q2.y;
    let z2 = q2.z;
    let w2 = q2.w;

    this.x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
    this.y = w1 * y2 + y1 * w2 + z1 * x2 - x1 * z2;
    this.z = w1 * z2 + z1 * w2 + x1 * y2 - y1 * x2;
    this.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;

    return this;
  }

  public static fromEulerXYZ(
    x: number,
    y: number,
    z: number,
    unit: 'deg' | 'rad' = 'rad',
  ): Quaternion {
    if (unit === 'deg') return this.fromEuler(new Vector3(x, y, z).toRad());
    return this.fromEuler(new Vector3(x, y, z));
  }

  public static fromEuler(v: Vector3): Quaternion {
    let _x = v.x * 0.5;
    let _y = v.y * 0.5;
    let _z = v.z * 0.5;

    let c_x = Math.cos(_x);
    let c_y = Math.cos(_y);
    let c_z = Math.cos(_z);

    let s_x = Math.sin(_x);
    let s_y = Math.sin(_y);
    let s_z = Math.sin(_z);

    return new Quaternion(
      c_y * c_z * s_x + c_x * s_y * s_z,
      c_x * c_z * s_y - c_y * s_x * s_z,
      c_x * c_y * s_z + c_z * s_x * s_y,
      c_x * c_y * c_z - s_x * s_y * s_z,
    );
  }

  public rotateEulerXYZ_(x: number, y: number, z: number, unit: 'deg' | 'rad' = 'rad') {
    const r = Quaternion.fromEulerXYZ(x, y, z, unit);
    this.mul_(r);
  }

  public multiplyMatrix(matrix: Matrix4x4): Quaternion {
    const q = [this.x, this.y, this.z, this.w];

    const result = new Array(4);

    for (let i = 0; i < 4; i++) {
      result[i] = 0;
      for (let j = 0; j < 4; j++) {
        result[i] += matrix.raw[i * 4 + j] * q[j];
      }
    }

    return new Quaternion(result[0], result[1], result[2], result[3]);
  }

  public toEuler(): Vector3 {
    let t = 2.0 * (this.w * this.y - this.z * this.x);
    let v = new Vector3(0, 0, 0);

    // Set X
    let a = 2.0 * (this.w * this.x + this.y * this.z);
    v.x = Math.atan2(a, 1.0 - 2.0 * (this.x * this.x + this.y * this.y));

    // Set Y
    if (t >= 1.0) {
      v.y = Math.PI / 2.0;
    } else {
      if (t <= -1.0) {
        v.y = -Math.PI / 2.0;
      } else {
        v.y = Math.asin(t);
      }
    }

    // Set Z
    a = 2.0 * (this.w * this.z + this.x * this.y);
    v.z = Math.atan2(a, 1.0 - 2.0 * (this.y * this.y + this.z * this.z));

    return v;
  }

  public invert(): Quaternion {
    return new Quaternion(-this.x, -this.y, -this.z, this.w);
  }

  // Метод для вычисления кватерниона между двумя векторами
  public static fromTwoVectors(vectorA: Vector3, vectorB: Vector3): Quaternion {
    vectorA = vectorA.normalize();
    vectorB = vectorB.normalize();

    const dotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;

    if (dotProduct < -0.99999) {
      const axis = new Vector3(0, 0, 1).cross(vectorA);
      if (axis.magnitude() === 0) {
        axis.setXYZ(1, 0, 0);
      }
      return new Quaternion(axis.x, axis.y, axis.z, 0);
    }

    const crossProduct = vectorA.cross(vectorB);
    const w = 1 + dotProduct;
    const k = 1 / Math.sqrt(2 * w);

    return new Quaternion(crossProduct.x * k, crossProduct.y * k, crossProduct.z * k, w * k);
  }

  // Функция для создания кватерниона из направления (Vector3)
  /*static fromDirection(direction: Vector3) {
    direction.normalize();

    const angle = Math.acos(direction.z); // Угол между направлением и вектором (0, 0, 1)
    const axis = new Vector3(-direction.y, direction.x, 0).normalize(); // Перпендикулярный вектор

    const halfAngle = angle / 2;
    const sinHalfAngle = Math.sin(halfAngle);

    return new Quaternion(
      axis.x * sinHalfAngle,
      axis.y * sinHalfAngle,
      axis.z * sinHalfAngle,
      Math.cos(halfAngle),
    );
  }*/

  static fromDirection(direction: Vector3, upwards: Vector3) {
    direction = direction.normalize();
    const right = upwards.cross(direction).normalize();
    const up = direction.cross(right);

    const m00 = right.x;
    const m01 = right.y;
    const m02 = right.z;
    const m10 = up.x;
    const m11 = up.y;
    const m12 = up.z;
    const m20 = -direction.x;
    const m21 = -direction.y;
    const m22 = -direction.z;

    const trace = m00 + m11 + m22;
    let x, y, z, w;

    if (trace > 0) {
      const s = 0.5 / Math.sqrt(1 + trace);
      w = 0.25 / s;
      x = (m21 - m12) * s;
      y = (m02 - m20) * s;
      z = (m10 - m01) * s;
    } else if (m00 > m11 && m00 > m22) {
      const s = 2 * Math.sqrt(1 + m00 - m11 - m22);
      w = (m21 - m12) / s;
      x = 0.25 * s;
      y = (m01 + m10) / s;
      z = (m02 + m20) / s;
    } else if (m11 > m22) {
      const s = 2 * Math.sqrt(1 + m11 - m00 - m22);
      w = (m02 - m20) / s;
      x = (m01 + m10) / s;
      y = 0.25 * s;
      z = (m12 + m21) / s;
    } else {
      const s = 2 * Math.sqrt(1 + m22 - m00 - m11);
      w = (m10 - m01) / s;
      x = (m02 + m20) / s;
      y = (m12 + m21) / s;
      z = 0.25 * s;
    }

    return new Quaternion(x, y, z, w);
  }

  // Метод для создания кватерниона, который ориентирован на точку
  static targetTo(forward: Vector3, up: Vector3) {
    forward = forward.normalize();

    const dot = Vector3.dot(Vector3.forward, forward);
    if (Math.abs(dot - -1.0) < 1e-6) {
      return new Quaternion(up.x, up.y, up.z, Math.PI);
    }
    if (Math.abs(dot - 1.0) < 1e-6) {
      return new Quaternion(0, 0, 0, 1);
    }

    const angle = Math.acos(dot);
    const axis = Vector3.cross(Vector3.forward, forward).normalize();

    return Quaternion.fromAxisAngle(axis, angle);
  }

  public static fromAxisAngle(axis: Vector3, angle: number) {
    // Угол в радианах разделяем пополам
    angle *= 0.5;

    // Вычисляем синус и косинус угла
    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);

    // Создаем кватернион
    const x = axis.x * sinAngle;
    const y = axis.y * sinAngle;
    const z = axis.z * sinAngle;
    return new Quaternion(x, y, z, cosAngle);
  }

  static fromMatrix(matrix: Matrix4x4) {
    const trace = matrix.raw[0] + matrix.raw[5] + matrix.raw[10];
    let x, y, z, w;

    if (trace > 0) {
      const s = 0.5 / Math.sqrt(1 + trace);
      w = 0.25 / s;
      x = (matrix.raw[6] - matrix.raw[9]) * s;
      y = (matrix.raw[8] - matrix.raw[2]) * s;
      z = (matrix.raw[1] - matrix.raw[4]) * s;
    } else if (matrix.raw[0] > matrix.raw[5] && matrix.raw[0] > matrix.raw[10]) {
      const s = 2 * Math.sqrt(1 + matrix.raw[0] - matrix.raw[5] - matrix.raw[10]);
      w = (matrix.raw[6] - matrix.raw[9]) / s;
      x = 0.25 * s;
      y = (matrix.raw[1] + matrix.raw[4]) / s;
      z = (matrix.raw[8] + matrix.raw[2]) / s;
    } else if (matrix.raw[5] > matrix.raw[10]) {
      const s = 2 * Math.sqrt(1 + matrix.raw[5] - matrix.raw[0] - matrix.raw[10]);
      w = (matrix.raw[8] - matrix.raw[2]) / s;
      x = (matrix.raw[1] + matrix.raw[4]) / s;
      y = 0.25 * s;
      z = (matrix.raw[6] + matrix.raw[9]) / s;
    } else {
      const s = 2 * Math.sqrt(1 + matrix.raw[10] - matrix.raw[0] - matrix.raw[5]);
      w = (matrix.raw[1] - matrix.raw[4]) / s;
      x = (matrix.raw[8] + matrix.raw[2]) / s;
      y = (matrix.raw[6] + matrix.raw[9]) / s;
      z = 0.25 * s;
    }

    return new Quaternion(x, y, z, w);
  }

  public static lerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    let result = new Quaternion(0, 0, 0, 0);
    let t_inv = 1.0 - t;

    // Linear interpolation for the quaternion components
    result.w = a.w * t_inv + b.w * t;
    result.x = a.x * t_inv + b.x * t;
    result.y = a.y * t_inv + b.y * t;
    result.z = a.z * t_inv + b.z * t;

    // Normalize the resulting quaternion
    let norm = Math.sqrt(
      result.w * result.w + result.x * result.x + result.y * result.y + result.z * result.z,
    );
    result.w /= norm;
    result.x /= norm;
    result.y /= norm;
    result.z /= norm;

    return result;
  }
}
