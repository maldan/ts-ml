import { GLTF } from './index.js';
import { Quaternion, Vector3 } from '../../math/linear_algebra';

export class GLTF_Node {
  public gltf: GLTF;

  public id: number;
  public name: string;
  public meshId: number = -1;
  public skinId: number = -1;
  public children: number[] = [];
  public position: Vector3 = Vector3.zero;
  public rotation: Quaternion = Quaternion.identity();
  public scale: Vector3 = Vector3.one;

  constructor(gltf: GLTF, node: any) {
    this.gltf = gltf;
    this.id = node.id;
    this.name = node.name;
    this.meshId = node.mesh ?? -1;
    this.skinId = node.skin ?? -1;
    this.children = node.children || [];

    if (node.translation) {
      this.position = new Vector3(node.translation[0], node.translation[1], node.translation[2]);
    }
    if (node.rotation) {
      this.rotation = new Quaternion(
        node.rotation[0],
        node.rotation[1],
        node.rotation[2],
        node.rotation[3],
      );
    }
    if (node.scale) {
      this.scale = new Vector3(node.scale[0], node.scale[1], node.scale[2]);
    }
  }
}
