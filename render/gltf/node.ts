import { GLTF } from './index.js';

export class GLTF_Node {
  public id: number;
  public name: string;
  public gltf: GLTF;
  public meshId: number;
  public skinId: number;
  public children: number[];
  public position = [0, 0, 0];
  public rotation = [0, 0, 0, 1];
  public scale = [1, 1, 1];

  constructor(gltf: GLTF, node: any) {
    this.gltf = gltf;
    this.id = node.id;
    this.name = node.name;
    this.meshId = node.mesh ?? -1;
    this.skinId = node.skin ?? -1;
    this.children = node.children || [];
    this.position = node.translation || [0, 0, 0];
    this.rotation = node.rotation || [0, 0, 0, 1];
    this.scale = node.scale || [1, 1, 1];
  }
}
