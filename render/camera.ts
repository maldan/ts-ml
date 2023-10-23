import { Matrix4x4, Quaternion, Vector3 } from '../math/linear_algebra';
import { MMath } from '../math';
import { Keyboard } from '../io';

export class PerspectiveCamera {
  public fov: number = 45;
  public aspectRatio: number = 1;
  public near: number = 0.01;
  public far: number = 32;
  public position: Vector3 = new Vector3();
  public rotation: Quaternion = Quaternion.identity();
  public scale: Vector3 = new Vector3(1, 1, 1);
  public projectionMatrix: Matrix4x4 = new Matrix4x4();
  public viewMatrix: Matrix4x4 = new Matrix4x4();

  public isInversePositionX: boolean = false;
  public isInversePositionY: boolean = false;
  public isInversePositionZ: boolean = false;

  constructor(fov: number, aspectRatio: number, near: number, far: number) {
    this.fov = fov;
    this.aspectRatio = aspectRatio;
    this.near = near;
    this.far = far;
  }

  public calculateProjection() {
    this.projectionMatrix = Matrix4x4.perspective(
      MMath.degToRad(this.fov),
      this.aspectRatio,
      this.near,
      this.far,
    );
  }

  public offsetPosition(dir: Vector3) {
    let hh = this.rotation.invert();
    let head = Matrix4x4.identity().rotateQuaternion(hh);

    let dirNew = dir.toVector4(1.0).multiplyMatrix(head);
    this.position.add_(dirNew.toVector3());

    // this._positionOffset = this._positionOffset.add(dirNew.toVector3());
  }

  public calculateView() {
    let position = this.position.clone();
    if (this.isInversePositionX) position.x *= -1;
    if (this.isInversePositionY) position.y *= -1;
    if (this.isInversePositionZ) position.z *= -1;

    // Position
    this.viewMatrix = Matrix4x4.identity()
      .rotateQuaternion(this.rotation)
      .translate(position)
      .scale(this.scale);

    /*let offsetTransform = new Matrix4x4()
      .identity()
      .rotateQuaternion(this.rotation)
      .translate(position)
      .scale(this.scale);*/

    // this.viewMatrix = this.viewMatrix.multiply(offsetTransform);
  }

  public basicMovement(delta: number) {
    if (Keyboard.isKeyDown('KeyA')) this.offsetPosition(new Vector3(-delta, 0, 0));
    if (Keyboard.isKeyDown('KeyD')) this.offsetPosition(new Vector3(delta, 0, 0));
    if (Keyboard.isKeyDown('KeyW')) this.offsetPosition(new Vector3(0, 0, -delta));
    if (Keyboard.isKeyDown('KeyS')) this.offsetPosition(new Vector3(0, 0, delta));
    if (Keyboard.isKeyDown('KeyQ')) this.rotation.rotateEulerXYZ_(0, -delta, 0, 'rad');
    if (Keyboard.isKeyDown('KeyE')) this.rotation.rotateEulerXYZ_(0, delta, 0, 'rad');
    if (Keyboard.isKeyDown('ArrowUp')) this.offsetPosition(new Vector3(0, delta, 0));
    if (Keyboard.isKeyDown('ArrowDown')) this.offsetPosition(new Vector3(0, -delta, 0));
  }
}
