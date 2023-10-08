import { Matrix4x4, Quaternion, Vector2, Vector3 } from '../math/linear_algebra';

class VR_Controller {
  public headset: VR_Headset;
  public axis: Vector2 = new Vector2();
  public trigger = false;
  public transform: Matrix4x4 = new Matrix4x4();

  constructor(headset: VR_Headset) {
    this.headset = headset;
  }

  public getRay(): { from: Vector3; to: Vector3 } {
    let offsetTransform = Matrix4x4.identity()
      .rotateQuaternion(this.headset.rotationOffset)
      .translate(this.headset.positionOffset.invert());

    let from = this.transform.multiply(offsetTransform);
    let head = this.headset.positionOffset
      .toVector4(0.0)
      .multiplyMatrix(offsetTransform)
      .toVector3();
    let to = Matrix4x4.identity();
    to.rotateQuaternion_(from.getRotation());
    to.translate_(new Vector3(0, 0, -2));
    to.rotateQuaternion_(from.getRotation().invert());
    to.translate_(from.getPosition().add(head));

    return { from: from.getPosition().add(head), to: to.getPosition() };
  }
}

class VR_Side {
  public headset: VR_Headset;
  public controller: VR_Controller;
  public projectionMatrix: Matrix4x4 = new Matrix4x4();
  public viewMatrix: Matrix4x4 = new Matrix4x4();

  constructor(headset: VR_Headset) {
    this.headset = headset;
    this.controller = new VR_Controller(headset);
  }
}

export class VR_Headset {
  public headTransform: Matrix4x4 = new Matrix4x4();
  public left: VR_Side = new VR_Side(this);
  public right: VR_Side = new VR_Side(this);
  public positionOffset = new Vector3();
  public rotationOffset = Quaternion.identity();

  public offsetPosition(dir: Vector3) {
    let hh = this.rotationOffset.invert().mul(this.headTransform.getRotation());
    let head = Matrix4x4.identity().rotateQuaternion(hh);

    let dirNew = dir.toVector4(1.0).multiplyMatrix(head);
    this.positionOffset = this.positionOffset.add(dirNew.toVector3());
  }

  public offsetRotation(dir: Vector3) {
    this.rotationOffset = this.rotationOffset.mul(Quaternion.fromEuler(dir));
  }

  public calculateOffset() {
    let offsetTransform = Matrix4x4.identity()
      .rotateQuaternion(this.rotationOffset)
      .translate(this.positionOffset.invert());

    this.left.viewMatrix = this.left.viewMatrix.multiply(offsetTransform);
    this.right.viewMatrix = this.right.viewMatrix.multiply(offsetTransform);
  }
}
