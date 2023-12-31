import { Vector3 } from './vec3';
import { Matrix4x4 } from './mat4';
import { MMath } from '../index';

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

  public set(q: Quaternion) {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
  }

  public static get identity(): Quaternion {
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

    let mx = Matrix4x4.identity;

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

  public static fromUnitVectors(fromVector: Vector3, toVector: Vector3): Quaternion {
    // Нормализуем векторы, чтобы они были единичной длины
    fromVector = fromVector.normalize();
    toVector = toVector.normalize();

    // Вычисляем угол между векторами
    const dot = fromVector.dot(toVector);
    const angle = Math.acos(Math.min(1, Math.max(-1, dot)));

    // Вычисляем ось вращения
    const axis = fromVector.cross(toVector).normalize();

    // Создаем кватернион, представляющий поворот
    return Quaternion.fromAxisAngle(axis, angle);
  }

  public static fromEulerXYZ(x: number, y: number, z: number, unit: 'deg' | 'rad'): Quaternion {
    //if (unit === 'deg') return this.fromEuler(new Vector3(x, y, z).toRad());
    //return this.fromEuler(new Vector3(x, y, z));
    return this.fromEuler(new Vector3(x, y, z), unit);
  }

  public static fromEuler(v: Vector3, unit: 'deg' | 'rad'): Quaternion {
    /*let _x = v.x * 0.5;
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
    );*/

    let x = v.x;
    let y = v.y;
    let z = v.z;

    if (unit === 'deg') {
      x = MMath.degToRad(x);
      y = MMath.degToRad(y);
      z = MMath.degToRad(z);
    }

    const qx =
      Math.sin(x / 2) * Math.cos(y / 2) * Math.cos(z / 2) -
      Math.cos(x / 2) * Math.sin(y / 2) * Math.sin(z / 2);
    const qy =
      Math.cos(x / 2) * Math.sin(y / 2) * Math.cos(z / 2) +
      Math.sin(x / 2) * Math.cos(y / 2) * Math.sin(z / 2);
    const qz =
      Math.cos(x / 2) * Math.cos(y / 2) * Math.sin(z / 2) -
      Math.sin(x / 2) * Math.sin(y / 2) * Math.cos(z / 2);
    const qw =
      Math.cos(x / 2) * Math.cos(y / 2) * Math.cos(z / 2) +
      Math.sin(x / 2) * Math.sin(y / 2) * Math.sin(z / 2);

    return new Quaternion(qx, qy, qz, qw);
  }

  public rotateEulerXYZ_(x: number, y: number, z: number, unit: 'deg' | 'rad') {
    const r = Quaternion.fromEulerXYZ(x, y, z, unit);
    this.mul_(r);
  }

  public multiplyMatrix(matrix: Matrix4x4): Quaternion {
    /*const q = [this.x, this.y, this.z, this.w];

    const result = new Array(4);

    for (let i = 0; i < 4; i++) {
      result[i] = 0;
      for (let j = 0; j < 4; j++) {
        result[i] += matrix.raw[i * 4 + j] * q[j];
      }
    }

    return new Quaternion(result[0], result[1], result[2], result[3]);*/

    // Преобразование кватерниона в матрицу 4x4
    const q0 = this.w;
    const q1 = this.x;
    const q2 = this.y;
    const q3 = this.z;

    const m11 = matrix.raw[0];
    const m12 = matrix.raw[1];
    const m13 = matrix.raw[2];
    const m21 = matrix.raw[4];
    const m22 = matrix.raw[5];
    const m23 = matrix.raw[6];
    const m31 = matrix.raw[8];
    const m32 = matrix.raw[9];
    const m33 = matrix.raw[10];

    const w = q0 * m11 + q1 * m21 + q2 * m31;
    const x = q0 * m12 + q1 * m22 + q2 * m32;
    const y = q0 * m13 + q1 * m23 + q2 * m33;
    const z = q0 * matrix.raw[3] + q1 * matrix.raw[7] + q2 * matrix.raw[11] + q3;

    return new Quaternion(x, y, z, w);
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

    /*const euler = new Vector3();
    const q = this;

    // Преобразование кватерниона в углы Эйлера
    const sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
    const cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
    euler.x = Math.atan2(sinr_cosp, cosr_cosp);

    const sinp = 2 * (q.w * q.y - q.z * q.x);
    if (Math.abs(sinp) >= 1) {
      euler.y = (Math.sign(sinp) * Math.PI) / 2;
    } else {
      euler.y = Math.asin(sinp);
    }

    const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
    const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
    euler.z = Math.atan2(siny_cosp, cosy_cosp);

    return euler;*/
  }

  public invert(): Quaternion {
    return new Quaternion(-this.x, -this.y, -this.z, this.w);
  }

  public conjugate(): Quaternion {
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

  public static difference(a: Quaternion, b: Quaternion): Quaternion {
    return a.mul(b.invert());
  }

  // Метод для создания кватерниона, который ориентирован на точку
  /*public static targetTo(forward: Vector3, up: Vector3) {
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
  }*/

  /*public static lookRotation(forward: Vector3, upwards: Vector3 = Vector3.up) {
    // Нормализуем векторы
    // forward.normalize();
    // upwards.normalize();

    // Вычисляем вектор right как векторное произведение upwards и forward
    const right = upwards.cross(forward).normalize();

    // Вычисляем вектор up как векторное произведение forward и right
    const up = forward.cross(right);

    // Создаем матрицу поворота из векторов right, up и forward
    const matrix = new Matrix4x4();
    matrix.raw = new Float32Array([
      right.x,
      right.y,
      right.z,
      0,
      up.x,
      up.y,
      up.z,
      0,
      forward.x,
      forward.y,
      forward.z,
      0,
      0,
      0,
      0,
      1,
    ]);

    return Quaternion.fromMatrix(matrix);
  }*/

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

  public static fromDirection(forward: Vector3, upwards: Vector3 = Vector3.up) {
    forward = forward.normalize();
    const angle = Math.acos(forward.dot(upwards) / (forward.magnitude() * upwards.magnitude()));
    const rotationAxis = forward.cross(upwards).normalize();
    return Quaternion.fromAxisAngle(rotationAxis, angle);

    /*forward = forward.normalize();
    upwards = upwards.normalize();

    const rotationMatrix = Matrix4x4.lookAt(forward, upwards);

    // Получаем кватернион из матрицы поворота
    return Quaternion.fromMatrix(rotationMatrix);*/
  }

  public static fromLookAt(position: Vector3, target: Vector3, upVector: Vector3): Quaternion {
    const direction = target.sub(position).normalize();

    // Проверка на нулевой вектор
    if (direction.magnitude() === 0) {
      return Quaternion.identity;
    }

    // Вычисляем угол между начальным вектором взгляда и целевым вектором
    const dot = upVector.dot(direction);

    if (Math.abs(dot - -1.0) < 0.000001) {
      // Если вектора сонаправлены, используем другой вектор как "верхний"
      upVector = new Vector3(0, 0, 1);
    }

    if (Math.abs(dot - 1.0) < 0.000001) {
      // Если вектора противоположно направлены, объект уже смотрит в нужном направлении
      return Quaternion.identity;
    }

    const axis = upVector.cross(direction).normalize();
    const radians = Math.acos(dot);

    return Quaternion.fromAxisAngle(axis, radians);
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
