import { GLTF } from './index.js';

export class GLTF_Image {
  public gltf: GLTF;
  public name: string;
  public mimeType: string;
  public bufferView: number;
  public uri: string;
  public image: HTMLImageElement = new Image();

  constructor(gltf: GLTF, node: any) {
    this.gltf = gltf;
    this.name = node.name;
    this.mimeType = node.mimeType;
    this.bufferView = node.bufferView;
    this.uri = node.uri;
  }

  get bytes(): Uint8Array {
    let view = this.gltf.bufferViews[this.bufferView];

    return new Uint8Array(
      this.gltf.buffers[view.buffer].content.buffer.slice(
        view.byteOffset,
        view.byteOffset + view.byteLength,
      ),
    );
  }
}
