import { Matrix4x4, Quaternion, Vector2, Vector3 } from '../math/linear_algebra';
import { Ray } from '../math/geometry';

class VR_Controller {
  public headset: VR_Headset;
  public axis: Vector2 = new Vector2();
  public trigger = false;
  public matrix: Matrix4x4 = Matrix4x4.identity();

  constructor(headset: VR_Headset) {
    this.headset = headset;
  }

  public getRay(length: number): Ray {
    // From
    let fr = Matrix4x4.identity();
    fr = fr.translate(this.matrix.getPosition());
    fr = fr.rotateQuaternion(this.matrix.getRotation());
    let from = fr
      .getPosition()
      .toVector4(0.0)
      .multiplyMatrix(this.headset.rotationOffset.invert().toMatrix4x4())
      .toVector3()
      .add(this.headset.positionOffset);

    // To
    fr = Matrix4x4.identity();
    fr = fr.translate(this.matrix.getPosition());
    fr = fr.rotateQuaternion(this.matrix.getRotation());
    fr = fr.translate(new Vector3(0, 0, -length));

    let to = fr
      .getPosition()
      .toVector4(0.0)
      .multiplyMatrix(this.headset.rotationOffset.invert().toMatrix4x4())
      .toVector3()
      .add(this.headset.positionOffset);

    return new Ray(this.absoluteMatrix.getPosition(), to);
  }

  public get absoluteMatrix() {
    // To
    let fr = Matrix4x4.identity();
    let position = this.matrix
      .getPosition()
      .toVector4(0.0)
      .multiplyMatrix(this.headset.rotationOffset.invert().toMatrix4x4())
      .toVector3()
      .add(this.headset.positionOffset);

    fr = fr.translate(position);
    fr = fr.rotateQuaternion(this.headset.rotationOffset.invert().mul(this.matrix.getRotation()));

    return fr;
  }
}

class VR_Side {
  public headset: VR_Headset;
  public controller: VR_Controller;
  public projectionMatrix: Matrix4x4 = Matrix4x4.identity();
  public viewMatrix: Matrix4x4 = Matrix4x4.identity();

  constructor(headset: VR_Headset) {
    this.headset = headset;
    this.controller = new VR_Controller(headset);
  }
}

export class VR_Headset {
  public headTransform: Matrix4x4 = Matrix4x4.identity();
  public left: VR_Side = new VR_Side(this);
  public right: VR_Side = new VR_Side(this);
  public positionOffset = new Vector3();
  public rotationOffset = Quaternion.identity();
  public offsetMatrix = Matrix4x4.identity();

  public offsetPosition(dir: Vector3) {
    let hh = this.rotationOffset.invert().mul(this.headTransform.getRotation());
    let head = Matrix4x4.identity().rotateQuaternion(hh);

    let dirNew = dir.toVector4(1.0).multiplyMatrix(head);
    this.positionOffset = this.positionOffset.add(dirNew.toVector3());
  }

  public offsetRotation(dir: Vector3) {
    this.rotationOffset = this.rotationOffset.mul(Quaternion.fromEuler(dir, 'rad'));
  }

  public calculateOffset() {
    let offsetTransform = Matrix4x4.identity()
      .rotateQuaternion(this.rotationOffset)
      .translate(this.positionOffset.invert());
    this.offsetMatrix = offsetTransform;

    this.left.viewMatrix = this.left.viewMatrix.mul(offsetTransform);
    this.right.viewMatrix = this.right.viewMatrix.mul(offsetTransform);
  }
}
