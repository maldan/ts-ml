import type { GLTF } from "./index.js";
import { byteLength, numberOfComponents, parseAccessor } from "./util.js";
import type { GLTF_Material } from "./material.js";

export class GLTF_MeshPrimitive {
  public gltf: GLTF;
  public attributes: {
    POSITION: number;
    NORMAL: number;
    TEXCOORD_0: number;
    WEIGHTS_0: number;
    JOINTS_0: number;
  };
  public indicesId: number;
  public materialId: number;

  constructor(gltf: GLTF, node: any) {
    this.gltf = gltf;
    this.attributes = node.attributes;
    this.indicesId = node.indices;
    this.materialId = node.material;
  }

  get vertices(): Float32Array {
    let p = this.attributes.POSITION;
    if (p === undefined) return new Float32Array([]);
    return parseAccessor(this.gltf, p) as Float32Array;
  }

  get normal(): Float32Array {
    let p = this.attributes.NORMAL;
    if (p === undefined) return new Float32Array([]);
    return parseAccessor(this.gltf, p) as Float32Array;
  }

  get uv(): Float32Array {
    let p = this.attributes.TEXCOORD_0;
    if (p === undefined) {
      return new Float32Array([]);
    }

    return parseAccessor(this.gltf, p) as Float32Array;
  }

  get indices(): Uint32Array {
    return parseAccessor(this.gltf, this.indicesId) as Uint32Array;
  }

  get boneWeight(): Float32Array {
    let p = this.attributes.WEIGHTS_0;
    if (p === undefined) return new Float32Array([]);
    return parseAccessor(this.gltf, p) as Float32Array;
  }

  get boneIndex(): Uint32Array {
    let p = this.attributes.JOINTS_0;
    if (p === undefined) return new Uint32Array([]);
    return parseAccessor(this.gltf, p) as Uint32Array;
  }

  get material(): GLTF_Material {
    return this.gltf.materials[this.materialId];
  }
}

export class GLTF_Mesh {
  public gltf: GLTF;
  public name: string;
  public primitives: GLTF_MeshPrimitive[] = [];

  constructor(gltf: GLTF, node: any) {
    this.gltf = gltf;
    this.name = node.name || "";
    for (let i = 0; i < node.primitives.length; i++) {
      this.primitives.push(new GLTF_MeshPrimitive(gltf, node.primitives[i]));
    }
  }
}
