import { Vector3 } from '../linear_algebra';
import { Ray } from './ray';

export class Sphere {
  public position: Vector3;
  public radius: number;

  constructor(pos: Vector3, r: number) {
    this.position = pos;
    this.radius = r;
  }

  public rayIntersection(ray: Ray): Vector3 | null {
    const sphereCenter = this.position;
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
