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
  public parentBone: Bone | undefined;

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
    this.matrix = parent.mul(this.matrix);
    this.parentMatrix = parent;

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].parentBone = this;
      this.children[i].update(this.matrix);
    }
  }

  public updateMatrix() {
    this.matrix.identity_().translate_(this.position).rotateQuaternion_(this.rotation);
    this.matrix = this.parentMatrix.mul(this.matrix);
  }

  public updateChildren() {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].parentBone = this;
      this.children[i].update(this.matrix);
    }
  }

  /*public lookAtLocal(v: Vector3) {
    // Вычисляем направление от текущей позиции к целевой точке
    const target = v.sub(this.matrix.getPosition()).normalize();

    // Вычисляем углы для поворота объекта
    const pitch = Math.asin(target.y);
    const yaw = Math.atan2(-target.x, target.z);

    // Применяем повороты
    // this.rotation.set(pitch, yaw, 0);
    const q = Quaternion.fromEulerXYZ(pitch, yaw, 0);
    this.rotation.set(q);
  }*/

  public trackToContrain(v: Vector3, upVector: Vector3) {
    // Вычисляем вектор, направленный от объекта к цели
    // let lookDirection = v.sub(this.worldPosition).normalize();
    /*let lookDirection = Vector3.direction(this.matrix.getPosition(), v);

    // Находим ось вращения, перпендикулярную `trackAxis` и `lookDirection`
    const rotationAxis = trackAxis.clone().cross(lookDirection).normalize();
    let rotationAngle = Math.acos(trackAxis.dot(lookDirection));
    let qq = Quaternion.fromAxisAngle(rotationAxis, rotationAngle);

    this.setWorldRotation(qq);*/
    // let q = Matrix4x4.targetTo(v, this.worldPosition, upVector).getRotation();
    let q = Matrix4x4.targetTo(this.worldPosition, v, upVector).getRotation();

    this.setWorldRotation(q);
  }

  public lookAt(v: Vector3, up: Vector3 = Vector3.up) {
    // WORKS ALMOST
    /*const target = v.sub(this.matrix.getPosition()).normalize();
    const rr = Quaternion.lookRotation(target, this.matrix.getPosition().normalize()).toEuler();
    rr.x += Math.PI / 2;
    this.setWorldRotation(Quaternion.fromEuler(rr));*/

    /*const mx = this.matrix.targetTo(this.matrix.getPosition(), v, Vector3.up);
    const rr = mx.getRotation().toEuler();
    rr.x -= Math.PI / 2;

    this.position = mx.getPosition();
    this.rotation = Quaternion.fromEuler(rr);*/

    let dir = Vector3.direction(this.matrix.getPosition(), v);
    const q = Quaternion.fromDirection(dir, up).normalize();
    this.setWorldRotation(q.invert());
  }

  public setWorldPosition(v: Vector3) {
    let mx = this.parentMatrix.invert();
    this.position = v.toVector4(1.0).multiplyMatrix(mx).toVector3();
  }

  public setWorldRotation(q: Quaternion) {
    // Умножьте инвертированный кватернион на матрицу родителя
    let mx = this.parentMatrix.invert();
    this.rotation = mx.rotateQuaternion(q).getRotation();
  }

  public get worldRotation() {
    return this.matrix.getRotation();
  }

  public get worldPosition() {
    return this.matrix.getPosition();
  }
}
