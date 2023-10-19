import { Matrix4x4, Quaternion, Vector3 } from '../linear_algebra';
import { Ray } from './ray';
import { Primitive } from './primitive';

export class Sphere extends Primitive {
  public radius: number;

  constructor(pos: Vector3, r: number) {
    super();

    this.position = pos;
    this.radius = r;
    this.calculateMatrix();
  }

  public pointIntersection(point: Vector3): Vector3 | null {
    const sphereCenter = this.matrix.getPosition();
    const distance = point.distanceTo(sphereCenter);
    const collisionOccurred = distance <= this.radius;
    if (collisionOccurred) {
      // Есть коллизия, вычисляем вектор выталкивания
      /*const pushVector = this.position
        .sub(sphereCenter)
        .normalize()
        .scale(this.radius - distance);
      return point.add(pushVector);*/
      // Вычисляем вектор от центра сферы до точки коллизии
      const collisionVector = point.sub(sphereCenter);

      // Нормализуем вектор коллизии
      const collisionDirection = collisionVector.normalize();

      // Умножаем на радиус сферы, чтобы получить вектор на поверхности сферы
      const surfaceVector = collisionDirection.scale(this.radius);

      // Корректируем позицию точки после коллизии
      return sphereCenter.add(surfaceVector);
    } else {
      return null;
    }
  }

  public rayIntersection(ray: Ray): Vector3 | null {
    const sphereCenter = this.matrix.getPosition();
    const segmentStart = ray.start;
    const segmentEnd = ray.end;
    const sphereRadius = this.radius;

    const d = segmentEnd.sub(segmentStart); // Вектор между началом и концом отрезка
    const f = segmentStart.sub(sphereCenter); // Вектор от начала отрезка до центра сферы

    const a = d.dot(d); // Квадрат длины отрезка
    const b = 2 * f.dot(d); // Произведение вектора от начала отрезка до центра сферы и вектора между началом и концом отрезка
    const c = f.dot(f) - sphereRadius * sphereRadius; // Квадрат расстояния от начала отрезка до центра сферы

    const discriminant = b * b - 4 * a * c; // Дискриминант квадратного уравнения

    if (discriminant < 0) return null; // Нет пересечения

    // Найдем ближайшую точку пересечения на отрезке
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    if (t1 >= 0 && t1 <= 1) {
      const tt1 = segmentStart.add(d.scale(t1));
      const tt2 = segmentStart.add(d.scale(t2));
      if (segmentStart.distanceTo(tt1) > segmentStart.distanceTo(tt2)) {
        return tt2;
      } else {
        return tt1;
      }
    } else if (t2 >= 0 && t2 <= 1) {
      const tt1 = segmentStart.add(d.scale(t1));
      const tt2 = segmentStart.add(d.scale(t2));
      if (segmentStart.distanceTo(tt1) > segmentStart.distanceTo(tt2)) {
        return tt2;
      } else {
        return tt1;
      }
    }

    return null; // Нет пересечения на отрезке
  }
}
