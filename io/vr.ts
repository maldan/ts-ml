import { Matrix4x4, Quaternion, Vector2, Vector3 } from '../math/linear_algebra';

class VR_Controller {
  public axis: Vector2 = new Vector2();
  public trigger = false;
  public transform: Matrix4x4 = new Matrix4x4();
}

class VR_Side {
  public controller: VR_Controller = new VR_Controller();
  public projectionMatrix: Matrix4x4 = new Matrix4x4();
  public viewMatrix: Matrix4x4 = new Matrix4x4();
}

export class VR_Headset {
  public headTransform: Matrix4x4 = new Matrix4x4();
  public left: VR_Side = new VR_Side();
  public right: VR_Side = new VR_Side();
  private _positionOffset = new Vector3();
  private _rotationOffset = Quaternion.identity();

  public offsetPosition(dir: Vector3) {
    let hh = this._rotationOffset.invert().mul(this.headTransform.getRotation());
    let head = new Matrix4x4().identity().rotateQuaternion(hh);

    let dirNew = dir.toVector4(1.0).multiplyMatrix(head);
    this._positionOffset = this._positionOffset.add(dirNew.toVector3());
  }

  public offsetRotation(dir: Vector3) {
    this._rotationOffset = this._rotationOffset.mul(Quaternion.fromEuler(dir));
  }

  public calculateOffset() {
    let offsetTransform = new Matrix4x4()
      .identity()
      .rotateQuaternion(this._rotationOffset)
      .translate(this._positionOffset.invert());

    this.left.viewMatrix = this.left.viewMatrix.multiply(offsetTransform);
    this.right.viewMatrix = this.right.viewMatrix.multiply(offsetTransform);
  }
}
