import { Mesh } from './mesh';
import { Vector3 } from '../../math/linear_algebra';
import { Skeleton } from '../skeleton/skeleton';
import { Vector4 } from '../../math/linear_algebra/vec4';
import { GLTF_MeshPrimitive } from '../gltf/mesh';

export class SkinnedMesh extends Mesh {
  public boneWeight: Vector4[] = [];
  public boneIndex: number[] = [];
  public skeleton: Skeleton = new Skeleton();

  constructor() {
    super();
  }

  public get plainBoneWeight(): Float32Array {
    const out = [];
    for (let i = 0; i < this.boneWeight.length; i++) {
      out.push(
        this.boneWeight[i].x,
        this.boneWeight[i].y,
        this.boneWeight[i].z,
        this.boneWeight[i].w,
      );
    }
    return new Float32Array(out);
  }

  public get plainBoneIndex(): Uint32Array {
    const out = [];
    for (let i = 0; i < this.boneIndex.length; i++) {
      out.push(this.boneIndex[i]);
    }
    return new Uint32Array(out);
  }

  public set(primitive: GLTF_MeshPrimitive) {
    super.set(primitive);

    this.boneWeight = Vector4.listFromArray(primitive.boneWeight);
    this.boneIndex = Array.from(primitive.boneIndex);
    return this;
  }
}
