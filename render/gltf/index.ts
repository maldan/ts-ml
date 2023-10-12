import { GLTF_Skin } from './skin.js';
import { GLTF_Mesh } from './mesh.js';
import { GLTF_Material } from './material.js';
import { GLTF_Image } from './image.js';
import { GLTF_Node } from './node.js';
import { GLTF_Texture } from './texture';
import { GLTF_Animation } from './animation';
import { Binary } from '../../binary';

export class GLTF {
  baseURL: string = '';
  struct: any = {};
  images: GLTF_Image[] = [];
  materials: GLTF_Material[] = [];
  meshes: GLTF_Mesh[] = [];
  nodes: GLTF_Node[] = [];
  skins: GLTF_Skin[] = [];
  textures: GLTF_Texture[] = [];
  animations: GLTF_Animation[] = [];

  static async fromURL(url: string): Promise<GLTF> {
    const model = new GLTF();
    model.baseURL = url.split('/').slice(0, -1).join('/') + '/';
    const text = await (await fetch(url)).text();
    await model.fromJSON(text);
    return model;
  }

  async fromJSON(str: string) {
    this.struct = JSON.parse(str);

    for (let i = 0; i < this.struct.buffers.length; i++) {
      // Embed buffer
      if (this.struct.buffers[i].uri.includes('data:')) {
        this.buffers[i].content = new DataView(
          Binary.fromBase64(this.struct.buffers[i].uri.split(',')[1]).buffer,
        );
      } else {
        // Load from url
        console.log(this.baseURL + this.struct.buffers[i].uri);
        this.buffers[i].content = new DataView(
          await (await fetch(this.baseURL + this.struct.buffers[i].uri)).arrayBuffer(),
        );
      }
    }

    // Create images
    this.images =
      this.struct.images?.map((x: any) => {
        return new GLTF_Image(this, x);
        // return new GLTF_Image(this, x.name, x.mimeType, x.bufferView);
      }) || [];

    for (let i = 0; i < this.images.length; i++) {
      // Not embed
      if (this.images[i].uri) {
        this.images[i].image = new Image();
        this.images[i].image.width = 2;
        this.images[i].image.height = 2;
        this.images[i].image.src = this.baseURL + this.images[i].uri;
      } else {
        const blob = new Blob([this.images[i].bytes], {
          type: this.images[i].mimeType,
        });
        const url = URL.createObjectURL(blob);
        this.images[i].image = new Image();
        this.images[i].image.width = 2;
        this.images[i].image.height = 2;
        this.images[i].image.src = url;
      }
    }

    // Create materials
    this.materials =
      this.struct.materials?.map((x: any) => {
        return new GLTF_Material(this, x);
        /*return new GLTF_Material(
          this,
          x.name,
          x.doubleSided,
          x.pbrMetallicRoughness
        );*/
      }) || [];

    // Create meshes
    this.meshes =
      this.struct.meshes?.map((x: any) => {
        return new GLTF_Mesh(this, x);
      }) || [];

    // Nodes
    this.nodes = this.struct.nodes.map((x: any, index: number) => {
      x.id = index;
      return new GLTF_Node(this, x);
    });

    // Skins
    this.skins =
      this.struct.skins?.map((x: any, id: number) => {
        x.id = id;
        return new GLTF_Skin(this, x);
      }) || [];

    // Textures
    this.textures =
      this.struct.textures?.map((x: any) => {
        return new GLTF_Texture(this, x);
      }) || [];

    // Animations
    this.animations =
      this.struct.animations?.map((x: any) => {
        return new GLTF_Animation(this, x);
      }) || [];

    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].meshId !== -1) {
        this.meshes[this.nodes[i].meshId].nodeName = this.nodes[i].name;
      }
    }
  }

  get buffers(): {
    content: DataView;
  }[] {
    return this.struct.bufferViews;
  }

  get bufferViews(): {
    buffer: number;
    byteLength: number;
    byteOffset: number;
    target: number;
  }[] {
    return this.struct.bufferViews;
  }

  get accessors(): {
    bufferView: number;
    componentType: number;
    count: number;
    type: string;
  }[] {
    return this.struct.accessors;
  }
}
