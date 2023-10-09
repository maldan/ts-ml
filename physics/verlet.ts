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

export class VerletLine {
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
    let percent = difference / distance / 2;
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
}

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
  public lines: VerletLine[] = [];

  constructor(from: Vector3, to: Vector3, count: number = 1) {
    let dir = Vector3.direction(from, to);
    let step = dir.divScalar(count);

    for (let i = 0; i < count; i++) {
      if (i === 0) {
        let p1 = new VerletPoint(from.add(step.scale(i)));
        let p2 = new VerletPoint(from.add(step.scale(i + 1)));
        this.lines.push(new VerletLine(p1, p2));
      } else {
        let p2 = new VerletPoint(from.add(step.scale(i + 1)));
        this.lines.push(new VerletLine(this.lines[i - 1].to, p2));
      }
    }

    this.lines[0].from.isStatic = true;
    this.lines[this.lines.length - 1].to.isStatic = true;
    // this.lines.push(new VerletLine(new VerletPoint(from), 0));
  }

  public update(delta: number) {
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].from.update(delta);
      this.lines[i].to.update(delta);
    }
  }
}
