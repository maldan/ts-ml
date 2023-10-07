import { GLTF } from "./index.js";
import type { GLTF_Image } from "./image.js";
import { GLTF_Texture } from "./texture";

export class GLTF_Material {
  public gltf: GLTF;
  public name: string;
  public doubleSided: boolean;
  public pbrMetallicRoughness: {
    baseColorTexture: {
      index: number;
    };
  };
  public normalTexture: {
    index: number;
  };

  constructor(gltf: GLTF, node: any) {
    this.gltf = gltf;
    this.name = node.name;
    this.doubleSided = node.doubleSided;
    this.pbrMetallicRoughness = node.pbrMetallicRoughness;
    this.normalTexture = node.normalTexture;
  }

  /*get texture(): Uint8Array {
    let texture =
      this.gltf.textures[this.pbrMetallicRoughness.baseColorTexture.index];
    return this.gltf.images[texture.source].bytes;
  }*/

  /*get imageColor(): GLTF_Image {
    let texture =
      this.gltf.textures[this.pbrMetallicRoughness.baseColorTexture.index];
    return this.gltf.images[texture.source];
  }*/

  get textureColor(): GLTF_Texture {
    return this.gltf.textures[this.pbrMetallicRoughness.baseColorTexture.index];
  }

  get textureColorId(): number {
    return this.gltf.textures[this.pbrMetallicRoughness.baseColorTexture.index]
      .source;
  }

  get textureNormalId(): number {
    return this.gltf.textures[this.normalTexture.index].source;
  }
}
