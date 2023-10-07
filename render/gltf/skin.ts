import type { GLTF } from './index.js';
import { parseAccessor } from './util.js';
import type { GLTF_Node } from './node.js';
import { GLTF_Mesh } from './mesh';
import { Matrix4x4 } from '../../math/linear_algebra';
import { Slice } from '../../slice';

export class GLTF_Bone {
  id: number;
  name: string;
  gltf: GLTF;
  children: number[];
  position = [0, 0, 0];
  rotation = [0, 0, 0, 1];
  scale = [1, 1, 1];
  inverseBindMatrix = new Matrix4x4();

  constructor(node: GLTF_Node) {
    this.gltf = node.gltf;
    this.id = node.id;
    this.name = node.name;
    this.children = node.children;
    this.position = node.position;
    this.rotation = node.rotation;
    this.scale = node.scale;
  }
}

export class GLTF_Skin {
  id: number;
  name: string;
  gltf: GLTF;
  bones: GLTF_Bone[] = [];
  meshes: GLTF_Mesh[] = [];

  constructor(gltf: GLTF, props: any) {
    this.gltf = gltf;
    this.id = props.id;
    this.name = props.name || '';

    // Fill bones
    for (let i = 0; i < props.joints.length; i++) {
      this.bones.push(new GLTF_Bone(this.gltf.nodes[props.joints[i]]));
    }

    // Fill meshes
    for (let i = 0; i < this.gltf.nodes.length; i++) {
      const node = this.gltf.nodes[i];
      if (node.meshId >= 0 && node.skinId === this.id) {
        this.meshes.push(this.gltf.meshes[node.meshId]);
      }
    }

    // Fill inverse bind matrices
    const x = parseAccessor(this.gltf, props.inverseBindMatrices);
    if (x == null) return;
    const matrixList = Slice.chunk(x, 16);
    for (let i = 0; i < matrixList.length; i++) {
      this.bones[i].inverseBindMatrix = new Matrix4x4(matrixList[i] as Float32Array);
    }
  }
}
