import { EventEmitter } from '../event/event';
import { Matrix4x4, Vector3 } from '../math/linear_algebra';
import { Cube, Ray } from '../math/geometry';

export interface ICollider {
  debugColor: number;
  position: Vector3;
  update(): void;
  get matrix(): Matrix4x4;
  // checkRayIntersection(ray: Ray): void;
}

export interface IColliderEvent {
  ray: Ray;
  collider: ICollider;
  point?: Vector3;
}

export class BoxCollider {
  public event: EventEmitter = new EventEmitter();
  public cube: Cube;
  public debugColor = 0xffffffff;

  constructor(position: Vector3, size: Vector3) {
    this.cube = new Cube(position, size);
  }

  public update() {
    this.cube.calculateMatrix();
    this.cube.calculateVertices();
  }

  public set parentMatrix(mx: Matrix4x4) {
    this.cube.parentMatrix = mx;
  }

  public get parentMatrix() {
    return this.cube.parentMatrix;
  }

  public get matrix() {
    return this.cube.matrix;
  }

  public set position(v: Vector3) {
    this.cube.position = v;
  }

  public get position() {
    return this.cube.position;
  }

  /*public checkRayIntersection(ray: Ray) {
    const p = this.cube.rayIntersection(ray);
    if (this.eventState.isRayOver) {
      this.eventState.isRayOver = false;
      this.event.emit('rayOut', this, { ray });
    }
    if (!p) return;
    if (!this.eventState.isRayOver) {
      this.event.emit('rayOver', this, { ray, point: p });
    }
    this.eventState.isRayOver = true;
  }*/

  /*public rayIntersection(ray: Ray): Vector3 | null {
    return this.cube.rayIntersection(ray);
  }*/
}
