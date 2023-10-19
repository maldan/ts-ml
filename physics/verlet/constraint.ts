import { Vector3 } from '../../math/linear_algebra';
import { VerletPoint } from './point';

export class DistanceConstraint {
  public from: VerletPoint;
  public to: VerletPoint;
  public length: number;
  public debug = {
    isDraw: true,
  };

  constructor(from: VerletPoint, to: VerletPoint, length: number = 0) {
    this.from = from;
    this.to = to;
    if (length <= 0) {
      length = Vector3.distance(from.position, to.position);
    }
    this.length = length;
  }

  public apply() {
    let deltaPosition = this.to.position.sub(this.from.position);
    let distance = Vector3.distance(this.from.position, this.to.position);
    let difference = this.length - distance;
    let percent = 0;

    if (this.from.isStatic || this.to.isStatic) {
      percent = difference / distance;
    } else {
      percent = difference / distance / 2;
    }

    let offset = deltaPosition.scale(percent);

    if (!this.from.isStatic) this.from.position.sub_(offset);
    if (!this.to.isStatic) this.to.position.add_(offset);
  }
}
