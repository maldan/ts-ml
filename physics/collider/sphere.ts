import { Cube, Sphere } from '../../math/geometry';
import { Vector3 } from '../../math/linear_algebra';
import { BaseCollider } from './base';

export class SphereCollider extends BaseCollider {
  constructor(position: Vector3, r: number) {
    super();

    this.primitive = new Sphere(position, r);
  }
}
