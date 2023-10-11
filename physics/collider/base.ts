import { EventEmitter } from '../../event/event';
import { RGBA8 } from '../../color';
import { Primitive } from '../../math/geometry/primitive';
import { Matrix4x4, Quaternion, Vector3 } from '../../math/linear_algebra';

export class BaseCollider {
  public event: EventEmitter = new EventEmitter();
  public debugColor = RGBA8.white.toNumber();
  public primitive: Primitive;

  public update() {
    this.primitive.calculateMatrix();
  }

  public set parentMatrix(mx: Matrix4x4 | (() => Matrix4x4) | undefined) {
    this.primitive.parentMatrix = mx;
  }

  public get parentMatrix(): Matrix4x4 | undefined {
    return this.primitive.parentMatrix;
  }

  public get matrix() {
    return this.primitive.matrix;
  }

  public set position(v: Vector3) {
    this.primitive.position = v;
  }

  public get position() {
    return this.primitive.position;
  }

  public set rotation(q: Quaternion) {
    this.primitive.rotation = q;
  }

  public get rotation() {
    return this.primitive.rotation;
  }

  public get worldPosition() {
    return this.primitive.worldPosition;
  }

  public get worldRotation() {
    return this.primitive.worldRotation;
  }
}
