import { Matrix4x4, Quaternion, Vector3 } from '../../math/linear_algebra';
import { GLTF_Bone } from '../gltf/skin';

export class Bone {
  public id: number;
  public name: string;
  public inverseBindMatrix = new Matrix4x4();
  public position = new Vector3(0, 0, 0);
  public restPosition = new Vector3(0, 0, 0);
  // public localPosition = new Vector3(0, 0, 0);
  public rotation = new Quaternion(0, 0, 0, 1);
  public restRotation = new Quaternion(0, 0, 0, 1);
  //public localRotation = Quaternion.identity();
  public scale = new Vector3(1, 1, 1);
  public children: Bone[] = [];
  public childrenId: number[] = [];
  public matrix = new Matrix4x4();
  public parentMatrix = new Matrix4x4();

  constructor(bone: GLTF_Bone) {
    this.id = bone.id;
    this.name = bone.name;
    this.position = bone.position.clone();
    this.restPosition = bone.position.clone();
    this.rotation = bone.rotation.clone();
    this.restRotation = bone.rotation.clone();
    this.scale = bone.scale.clone();
    this.inverseBindMatrix = bone.inverseBindMatrix;
    this.childrenId = bone.children;
    // this.calculate();
  }

  public update(parent: Matrix4x4) {
    this.matrix.identity_().translate_(this.position).rotateQuaternion_(this.rotation);
    this.matrix = parent.multiply(this.matrix);
    this.parentMatrix = parent;

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].update(this.matrix);
    }
  }
}
