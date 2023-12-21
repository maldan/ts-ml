import type { GLTF } from './index';
import { GLTF_Image } from './image';

export class GLTF_Texture {
  public gltf: GLTF;
  public sampler: number;
  public source: number;

  constructor(gltf: GLTF, texture: any) {
    this.gltf = gltf;
    this.sampler = texture.sampler;
    this.source = texture.source;

    // Webp hack
    if (texture.extensions) {
      if (texture.extensions.EXT_texture_webp) {
        this.source = texture.extensions.EXT_texture_webp.source;
      }
    }
  }

  get image(): GLTF_Image {
    return this.gltf.images[this.source];
  }

  get minFilter(): number {
    return;
  }
}
