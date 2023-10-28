import type { GLTF } from './index.js';
import { parseAccessor } from './util.js';
import type { GLTF_Node } from './node.js';
import { GLTF_Mesh } from './mesh';
import { Matrix4x4, Quaternion, Vector3 } from '../../math/linear_algebra';
import { Slice } from '../../slice';

export class GLTF_Bone {
  public gltf: GLTF;

  public id: number;
  public name: string;
  public children: number[];
  public position: Vector3 = Vector3.zero;
  public rotation = Quaternion.identity;
  public scale = Vector3.one;
  public inverseBindMatrix = new Matrix4x4();

  constructor(node: GLTF_Node) {
    this.gltf = node.gltf;
    this.id = node.id;
    this.name = node.name;
    this.children = node.children;
    this.position = node.position.clone();
    this.rotation = node.rotation.clone();
    this.scale = node.scale.clone();
  }
}

export class GLTF_Skin {
  id: number;
  name: string;
  gltf: GLTF;
  bones: GLTF_Bone[] = [];
  meshes: GLTF_Mesh[] = [];
  boneMap: Record<string, GLTF_Bone> = {};

  constructor(gltf: GLTF, props: any) {
    this.gltf = gltf;
    this.id = props.id;
    this.name = props.name || '';

    // Fill bones
    for (let i = 0; i < props.joints.length; i++) {
      const bone = new GLTF_Bone(this.gltf.nodes[props.joints[i]]);
      this.bones.push(bone);
      this.boneMap[bone.name] = bone;
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

  public getBoneByName(name: string): GLTF_Bone | undefined {
    return this.boneMap[name];
  }
}
