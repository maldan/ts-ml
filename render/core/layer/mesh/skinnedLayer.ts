import { RenderLayer } from '../../layer';
import { RenderElement } from '../../element';
import { IEye } from '../../../type';
import { SkinnedMesh } from '../../../primitive/skinnedMesh';
import { Render } from '../../render';
import { Scene } from '../../scene';
import { skinnedMeshShaderText } from './shader';
import { Skeleton } from '../../../skeleton/skeleton';

export class SkinnedElement extends RenderElement {
  public mesh: SkinnedMesh;

  constructor(gl: WebGL2RenderingContext, mesh: SkinnedMesh) {
    super(gl);

    this.mesh = mesh;
    this.mesh.calculateTangent();

    console.log(this.mesh);

    this.createBuffer(
      'index',
      'vertex',
      'tangent',
      'biTangent',
      'normal',
      'uv',
      'boneWeight',
      'boneIndex',
    );

    this.uploadElementBuffer('index', this.mesh.plainIndices);
    this.uploadBuffer('vertex', this.mesh.plainVertices);
    this.uploadBuffer('tangent', this.mesh.plainTangent);
    this.uploadBuffer('biTangent', this.mesh.plainBiTangent);
    this.uploadBuffer('normal', this.mesh.plainNormal);
    this.uploadBuffer('uv', this.mesh.plainUV);
    this.uploadBuffer('boneWeight', this.mesh.plainBoneWeight);
    this.uploadBuffer('boneIndex', this.mesh.plainBoneIndex);

    this.createTexture('uTextureColor', { filtration: 'linear', useMapMaps: true });
    this.createTexture('uTextureNormal', { filtration: 'linear', useMapMaps: true });
    this.createTexture('uBone', { filtration: 'nearest', type: 'r32f', width: 64, height: 64 });
  }

  updateBoneTexture() {
    // Fill each bone matrix
    const pixels = new Float32Array(64 * 64);
    let id = 0;
    this.mesh.skeleton.boneList.forEach((bone) => {
      let mx = bone.matrix.multiply(bone.inverseBindMatrix);
      for (let i = 0; i < mx.raw.length; i++) {
        pixels[id] = mx.raw[i];
        id++;
      }
    });

    this.updateTexture('uBone', pixels);
  }

  render() {
    this.updateBoneTexture();

    this.enableAttribute('vertex', 'aPosition:vec3');
    this.enableAttribute('tangent', 'aTangent:vec3');
    this.enableAttribute('biTangent', 'aBiTangent:vec3');
    this.enableAttribute('normal', 'aNormal:vec3');
    this.enableAttribute('uv', 'aUV:vec2');
    this.enableAttribute('boneWeight', 'aBoneWeight:vec4');
    this.enableAttribute('boneIndex', 'aBoneIndex:uint');

    this.bindElementBuffer('index');

    this.activateTexture('uBone', 0);
    this.activateTexture('uTextureColor', 1);
    this.activateTexture('uTextureNormal', 2);

    // Draw
    this.drawElements(this.mesh.indices.length);
  }
}

export class SkinnedMeshLayer extends RenderLayer {
  private _render: Render;
  public scene: Scene;
  public list: SkinnedElement[] = [];
  public skeleton: Set<Skeleton> = new Set();

  constructor(scene: Scene) {
    super(scene._render.gl);
    this._render = scene._render;
    this.scene = scene;

    this.createShader('skinnedMesh', skinnedMeshShaderText);
  }

  public add(element: SkinnedElement) {
    element.shaderMap = this.shaderMap;
    this.list.push(element);
    this.skeleton.add(element.mesh.skeleton);
  }

  update(delta: number) {
    this.skeleton.forEach((element) => {
      element.update();
    });
    /*this.list.forEach((element) => {
      element.mesh.skeleton.update();
    });*/
  }

  render(eye: IEye) {
    const gl = this.gl;

    // Preparations
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    this.useShader('skinnedMesh');

    if (eye) {
      this.bindMatrix('uProjectionMatrix', this._render.vrHeadset[eye].projectionMatrix.raw);
      this.bindMatrix('uViewMatrix', this._render.vrHeadset[eye].viewMatrix.raw);
    } else {
      this.bindMatrix('uProjectionMatrix', this.scene.camera.projectionMatrix.raw);
      this.bindMatrix('uViewMatrix', this.scene.camera.viewMatrix.raw);
    }

    this.list.forEach((element) => {
      element.currentShaderName = this.currentShaderName;
      element.render();
    });
  }
}
