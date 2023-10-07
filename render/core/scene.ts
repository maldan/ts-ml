import { PerspectiveCamera } from '../camera';
import { LineLayer } from './layer/line';
import { Vector3 } from '../../math/linear_algebra';
import { Render } from './render';
import { IEye } from '../type';
import { GLTF } from '../gltf';
import { RenderElement } from './element';
import { Skeleton } from '../skeleton/skeleton';
import { SkinnedElement, SkinnedMeshLayer } from './layer/mesh/skinnedLayer';
import { SkinnedMesh } from '../primitive/skinnedMesh';

export class Scene extends RenderElement {
  public _render: Render;
  public camera: PerspectiveCamera;
  public layer!: {
    line: LineLayer;
    skinnedMesh: SkinnedMeshLayer;
  };

  constructor(render: Render) {
    super(render.gl);

    this._render = render;

    this.camera = new PerspectiveCamera(45, 1, 0.01, 32);
    this.camera.position = new Vector3(0, 0.7, 3.5);
    this.camera.isInversePositionX = true;
    this.camera.isInversePositionY = true;
    this.camera.isInversePositionZ = true;
    this.camera.calculateProjection();
    this.camera.calculateView();

    this.layer = {
      line: new LineLayer(this),
      skinnedMesh: new SkinnedMeshLayer(this),
    };
  }

  public update(delta: number) {
    this.camera.calculateProjection();
    this.camera.calculateView();

    this.layer.skinnedMesh.update(delta);
  }

  public render(eye: IEye = '') {
    this.layer.line.render(eye);
    this.layer.skinnedMesh.render(eye);
  }

  public addGLTF(scene: GLTF) {
    const gl = this._render.gl;
    const id = Math.random() + '_';

    // Bind textures
    if (scene.textures) {
      for (let i = 0; i < scene.textures.length; i++) {
        const name = `${id}_${scene.textures[i].source}`;
        this.createTexture(name, {});
        this.uploadImageInTexture(name, scene.textures[i].image.image);
      }
    } else {
      const name = `${id}_0`;
      this.createTexture(name, {});
    }

    // Parse skins
    for (let i = 0; i < scene.skins.length; i++) {
      const skin = scene.skins[i];
      const skeleton = new Skeleton().set(skin);

      for (let j = 0; j < skin.meshes.length; j++) {
        const mesh = skin.meshes[j];

        mesh.primitives.forEach((primitive) => {
          const skinnedMesh = new SkinnedMesh();
          skinnedMesh.skeleton = skeleton;
          skinnedMesh.set(primitive);

          // Create render element
          const element = new SkinnedElement(gl, skinnedMesh);

          // Assign textures
          try {
            element.textureMap['uTextureColor'] =
              this.textureMap[`${id}_${primitive.material.textureColorId}`];
          } catch {}
          try {
            element.textureMap['uTextureNormal'] =
              this.textureMap[`${id}_${primitive.material.textureNormalId}`];
          } catch {}

          this.layer.skinnedMesh.add(element);
        });
      }
    }
  }
}
