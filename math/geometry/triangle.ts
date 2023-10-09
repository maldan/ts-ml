import { Vector3 } from '../linear_algebra';
import { Ray } from './ray';

export class Triangle {
  public a: Vector3;
  public b: Vector3;
  public c: Vector3;

  constructor(a: Vector3, b: Vector3, c: Vector3) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  public rayIntersection(ray: Ray): Vector3 | null {
    const epsilon = 1e-5;
    const rayDirection = ray.direction;
    const rayStart = ray.start;

    const [p0, p1, p2] = [this.a, this.b, this.c];
    const edge1 = p1.sub(p0);
    const edge2 = p2.sub(p0);
    const h = rayDirection.cross(edge2);
    const a = edge1.dot(h);

    if (a > -epsilon && a < epsilon) {
      return null; // Рей не параллелен треугольнику
    }

    const f = 1.0 / a;
    const s = rayStart.sub(p0);
    const u = f * s.dot(h);

    if (u < 0.0 || u > 1.0) {
      return null;
    }

    const q = s.cross(edge1);
    const v = f * rayDirection.dot(q);

    if (v < 0.0 || u + v > 1.0) {
      return null;
    }

    // Теперь вычисляем t, чтобы получить точку пересечения
    const t = f * edge2.dot(q);
    if (t > epsilon && t <= ray.length) {
      return rayStart.add(rayDirection.scale(t));
    }

    return null;
  }
}
