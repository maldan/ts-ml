import { Matrix4x4, Quaternion, Vector3 } from '../linear_algebra';
import { Ray } from './ray';

export class Primitive {
  public position: Vector3 = Vector3.zero;
  public rotation: Quaternion = Quaternion.identity();
  public scale: Vector3 = Vector3.one;
  public matrix: Matrix4x4 = Matrix4x4.identity();
  private _parentMatrix?: Matrix4x4 | (() => Matrix4x4);

  constructor() {}

  public calculateMatrix() {
    this.matrix = Matrix4x4.identity();
    this.matrix = this.matrix.translate(this.position);
    this.matrix = this.matrix.rotateQuaternion(this.rotation);
    this.matrix = this.matrix.scale(this.scale);

    if (this._parentMatrix) {
      // @ts-ignore
      this.matrix = this.parentMatrix.mul(this.matrix);
    }
  }

  public set parentMatrix(mx: Matrix4x4 | (() => Matrix4x4) | undefined) {
    this._parentMatrix = mx;
  }

  public get parentMatrix(): Matrix4x4 | undefined {
    if (this._parentMatrix instanceof Matrix4x4) {
      return this._parentMatrix;
    }
    if (this._parentMatrix instanceof Function) {
      return this._parentMatrix();
    }
    return undefined;
  }

  public get worldPosition() {
    if (this._parentMatrix) {
      return this.position
        .toVector4(1.0)
        .multiplyMatrix(this.parentMatrix as Matrix4x4)
        .toVector3();
    }
    return this.position;
  }

  public get worldRotation() {
    if (this._parentMatrix) {
      return (this.parentMatrix as Matrix4x4).rotateQuaternion(this.rotation).getRotation();
    }
    return this.rotation;
  }

  public rayIntersection(ray: Ray): Vector3 | null {
    return null;
  }

  public pointIntersection(point: Vector3): Vector3 | null {
    return null;
  }
}
