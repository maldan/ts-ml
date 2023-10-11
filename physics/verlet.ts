import { Vector3 } from '../math/linear_algebra';

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

export class DistanceConstraint {
  public from: VerletPoint;
  public to: VerletPoint;
  public length: number;

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

/*export class VerletLine {
  public from: VerletPoint;
  public to: VerletPoint;
  public length: number;

  constructor(from: VerletPoint, to: VerletPoint, length: number = 0) {
    this.from = from;
    this.to = to;
    if (length <= 0) {
      length = Vector3.distance(from.position, to.position);
    }
    this.length = length;
  }

  public update(delta: number) {
    this.from.update(delta);
    this.to.update(delta);

    this.applyConstrains();
  }

  public applyConstrains() {
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

  public get fromPosition() {
    return this.from.position;
  }

  public get toPosition() {
    return this.to.position;
  }
}*/

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

export class VerletRope {
  public points: VerletPoint[] = [];
  public constraints: DistanceConstraint[] = [];
  public constraintIterations: number = 1;

  constructor(from: Vector3, to: Vector3, count: number = 1, iterations: number = 1) {
    let dir = Vector3.direction(from, to);
    let step = dir.divScalar(count);

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
    for (let k = 0; k < this.constraintIterations; k++) {
      for (let i = 0; i < this.constraints.length; i++) {
        this.constraints[i].apply();
      }
    }
  }
}
