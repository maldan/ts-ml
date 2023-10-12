export { VerletPoint } from './point';
export { VerletRope } from './rope';
export { VerletHair } from './hair';
export { DistanceConstraint } from './constraint';

/*export class EulerPoint {
  public position: Vector3 = new Vector3();
  public velocity: Vector3 = new Vector3();
  public mass: number = 1;
  public force: Vector3 = new Vector3();

  constructor(p: Vector3) {
    this.position = p;
  }

  public update(delta: number) {
    let acc = this.force.divScalar(this.mass);

    this.velocity.add_(acc.scale(delta));
    this.position.add_(this.velocity.scale(delta));

    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y *= -1;
    }
  }
}*/
