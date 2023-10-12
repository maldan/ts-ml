import { Vector3 } from '../../math/linear_algebra';

export class VerletPoint {
  public position: Vector3 = new Vector3();
  public previousPosition: Vector3 = new Vector3();
  public mass: number = 1;
  public force: Vector3 = new Vector3();
  public isStatic: boolean = false;

  constructor(p: Vector3, mass: number = 1.0) {
    this.mass = mass;
    this.position.set(p);
    this.previousPosition.set(p);
  }

  public update(delta: number) {
    if (this.isStatic) return;

    let vel = this.position.sub(this.previousPosition);

    // Update previous
    this.previousPosition.set(this.position);

    let acc = this.force.divScalar(this.mass);

    this.position.x += vel.x + acc.x * delta * delta;
    this.position.y += vel.y + acc.y * delta * delta;
    this.position.z += vel.z + acc.z * delta * delta;
  }
}
