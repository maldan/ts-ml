import { Vector3 } from '../../math/linear_algebra';
import { VerletPoint } from './point';
import { DistanceConstraint } from './constraint';

export class VerletRope {
  public points: VerletPoint[] = [];
  public constraints: DistanceConstraint[] = [];
  public constraintIterations: number = 1;

  constructor(from: Vector3, to: Vector3, count: number = 1, iterations: number = 1) {
    let dir = Vector3.direction(from, to);
    let distance = Vector3.distance(from, to);
    let distanceStep = distance / count;
    let step = dir.scale(distanceStep);

    for (let i = 0; i < count; i++) {
      if (i === 0) {
        let p1 = new VerletPoint(from.add(step.scale(i)));
        let p2 = new VerletPoint(from.add(step.scale(i + 1)));
        this.points.push(p1, p2);
      } else {
        let p2 = new VerletPoint(from.add(step.scale(i + 1)));
        this.points.push(p2);
      }
    }

    for (let i = 0; i < this.points.length - 1; i++) {
      this.constraints.push(new DistanceConstraint(this.points[i], this.points[i + 1]));
    }

    this.points[0].isStatic = true;
    this.points[this.points.length - 1].isStatic = true;

    this.constraintIterations = iterations;
  }

  public get start() {
    return this.points[0];
  }

  public get end() {
    return this.points[this.points.length - 1];
  }

  public updatePhysics(delta: number) {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].update(delta);
    }
  }

  public applyConstraint() {
    /*for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].position.y < 0) {
        this.points[i].y = 0;
        this.points[i].y = this.position.y + vel.y;
      }
    }*/

    for (let k = 0; k < this.constraintIterations; k++) {
      for (let i = 0; i < this.constraints.length; i++) {
        this.constraints[i].apply();
      }
    }
  }
}
