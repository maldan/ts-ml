import { Vector3 } from '../../math/linear_algebra';
import { Cube } from '../../math/geometry';
import { BaseCollider } from './base';

export class BoxCollider extends BaseCollider {
  constructor(position: Vector3, size: Vector3) {
    super();
    this.primitive = new Cube(position, size);
  }

  public update() {
    super.update();
    (this.primitive as Cube).calculateVertices();
  }
}
