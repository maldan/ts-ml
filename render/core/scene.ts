import { PerspectiveCamera } from '../camera';
import { LineLayer } from './layer/line';
import { Quaternion, Vector3 } from '../../math/linear_algebra';
import { Render } from './render';
import { IEye } from '../type';
import { GLTF } from '../gltf';
import { RenderElement } from './element';
import { Skeleton } from '../skeleton/skeleton';
import { SkinnedElement, SkinnedMeshLayer } from './layer/mesh/skinnedLayer';
import { SkinnedMesh } from '../primitive/skinnedMesh';
import { Mesh } from '../primitive/mesh';
import { StaticElement, StaticMeshLayer } from './layer/mesh/staticLayer';
import { GLTF_Animation } from '../gltf/animation';

export class Scene extends RenderElement {
  public _render: Render;
  public camera: PerspectiveCamera;
  public layer!: {
    line: LineLayer;
    skinnedMesh: SkinnedMeshLayer;
    staticMesh: StaticMeshLayer;
  };
  public animationList: GLTF_Animation[] = [];

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
      staticMesh: new StaticMeshLayer(this),
    };
  }

  public update(delta: number) {
    this.camera.calculateProjection();
    this.camera.calculateView();
    this.animationList.forEach((animation) => {
      animation.tick(delta);
      animation.currentFrame.forEach((frame) => {
        this.layer.skinnedMesh.skeleton
          .filter((x) => x.groupId === animation.groupId)
          .forEach((skeleton) => {
            if (frame.type === 'translation') {
              skeleton.setBonePosition(frame.key, frame.value as Vector3);
            }
            if (frame.type === 'rotation') {
              skeleton.setBoneRotation(frame.key, frame.value as Quaternion);
            }
          });
      });
    });
    this.layer.skinnedMesh.update(delta);
  }

  public render(eye: IEye = '') {
    this.layer.skinnedMesh.render(eye);
    this.layer.staticMesh.render(eye);
    this.layer.line.render(eye);
  }

  public end() {
    this.layer.line.end();
  }

  public addMesh(mesh: Mesh) {
    const gl = this._render.gl;

    // Create render element
    const element = new StaticElement(gl, mesh);
    this.layer.staticMesh.add(element);
  }

  public addGLTF(scene: GLTF) {
    const gl = this._render.gl;
    const id = Math.random() + '_';

    // Bind textures
    if (scene.textures) {
      for (let i = 0; i < scene.textures.length; i++) {
        const name = `${id}_${scene.textures[i].source}`;
        this.createTexture(name, { filtration: 'linear', useMapMaps: true, wrap: 'repeat' });

        try {
          this.uploadImageInTexture(name, scene.textures[i].image.image);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      const name = `${id}_0`;
      this.createTexture(name, { filtration: 'linear', useMapMaps: true, wrap: 'repeat' });
    }

    // Parse skins
    for (let i = 0; i < scene.skins.length; i++) {
      const skin = scene.skins[i];
      const skeleton = new Skeleton().set(skin);
      skeleton.groupId = id;

      for (let j = 0; j < skin.meshes.length; j++) {
        const mesh = skin.meshes[j];

        mesh.primitives.forEach((primitive) => {
          const skinnedMesh = new SkinnedMesh();
          skinnedMesh.skeleton = skeleton;
          skinnedMesh.name = mesh.nodeName;
          skinnedMesh.set(primitive);

          primitive.targets.forEach((target, index) => {
            skinnedMesh.addTarget(mesh.extras.targetNames[index], primitive.targetVertices(index));
          });

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

    // Parse static
    for (let i = 0; i < scene.nodes.length; i++) {
      if (scene.nodes[i].skinId === -1 && scene.nodes[i].meshId >= 0) {
        const mesh = scene.meshes[scene.nodes[i].meshId];
        mesh.primitives.forEach((primitive) => {
          const staticMesh = new Mesh();
          staticMesh.name = mesh.nodeName;
          staticMesh.set(primitive);

          // Create render element
          const element = new StaticElement(gl, staticMesh);
          element.position = scene.nodes[i].position;
          element.rotation = scene.nodes[i].rotation;
          element.scale = scene.nodes[i].scale;
          element['__id'] = scene.nodes[i].id;
          element['__children'] = scene.nodes[i].children;

          // console.log(scene.nodes[i].children);

          // Assign textures
          try {
            element.textureMap['uTextureColor'] =
              this.textureMap[`${id}_${primitive.material.textureColorId}`];
          } catch {}
          try {
            element.textureMap['uTextureNormal'] =
              this.textureMap[`${id}_${primitive.material.textureNormalId}`];
          } catch {}

          this.layer.staticMesh.add(element);
        });
      }
    }

    // Set childrens
    this.layer.staticMesh.list.forEach((x) => {
      if (x['__children']?.length > 0) {
        let children = x['__children'];
        children.forEach((id) => {
          let y = this.layer.staticMesh.list.find((xx) => xx['__id'] === id);
          if (!y) return;
          y.parentMatrix = () => {
            return x.matrix;
          };
          y.calculateModelMatrix();
          x.calculateModelMatrix();
        });
      }
    });

    // Patch animations
    scene.animations.forEach((x) => {
      x.groupId = id;
    });

    this.animationList.push(...scene.animations);
  }
}
