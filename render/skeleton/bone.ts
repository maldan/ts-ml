import { Matrix4x4, Quaternion, Vector3 } from '../../math/linear_algebra';
import { GLTF_Bone } from '../gltf/skin';

export class Bone {
  public id: number;
  public name: string;
  public inverseBindMatrix = new Matrix4x4();
  public position = new Vector3(0, 0, 0);
  public localPosition = new Vector3(0, 0, 0);
  public rotation = new Quaternion(0, 0, 0, 1);
  public restRotation = new Quaternion(0, 0, 0, 1);
  public localRotation = Quaternion.identity();
  public scale = new Vector3(1, 1, 1);
  public children: Bone[] = [];
  public childrenId: number[] = [];
  public matrix = new Matrix4x4();
  public parentMatrix = new Matrix4x4();

  constructor(bone: GLTF_Bone) {
    this.id = bone.id;
    this.name = bone.name;
    this.position = new Vector3(bone.position[0], bone.position[1], bone.position[2]);
    this.rotation = new Quaternion(
      bone.rotation[0],
      bone.rotation[1],
      bone.rotation[2],
      bone.rotation[3],
    );
    this.restRotation = this.rotation.clone();

    this.scale = new Vector3(bone.scale[0], bone.scale[1], bone.scale[2]);
    this.inverseBindMatrix = bone.inverseBindMatrix;
    this.childrenId = bone.children;
    // this.calculate();
  }

  public update(parent: Matrix4x4) {
    /*let mx = Matrix4x4.identity();
    mx = mx.translate_(this.position);
    mx = mx.rotateQuaternion_(this.rotation.mul(this.localRotation));*/
    this.matrix
      .identity_()
      .translate_(this.position)
      .rotateQuaternion_(this.rotation.mul(this.localRotation));
    this.matrix = parent.multiply(this.matrix);
    this.parentMatrix = parent;

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].update(this.matrix);
    }
  }
}
