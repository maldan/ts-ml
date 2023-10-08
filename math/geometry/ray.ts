import { Vector3 } from '../linear_algebra';

export class Ray {
  public position: Vector3;
  public direction: Vector3;
  public length: number;

  constructor(from: Vector3, to: Vector3) {
    this.position = from;
    this.direction = to.sub(from).normalize();
    this.length = Vector3.distance(from, to);
  }

  public get start(): Vector3 {
    return this.position;
  }

  public get end(): Vector3 {
    return this.position.add(this.direction.scale(this.length));
  }
}
