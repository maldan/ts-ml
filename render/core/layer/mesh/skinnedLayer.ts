import { RenderLayer } from '../../layer';
import { RenderElement } from '../../element';
import { IEye } from '../../../type';
import { SkinnedMesh } from '../../../primitive/skinnedMesh';
import { Render } from '../../render';
import { Scene } from '../../scene';
import { skinnedMeshShaderText } from './shader';

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
  }

  render() {
    this.enableAttribute('vertex', 'aPosition:vec3');
    this.enableAttribute('tangent', 'aTangent:vec3');
    this.enableAttribute('biTangent', 'aBiTangent:vec3');
    this.enableAttribute('normal', 'normal:vec3');
    this.enableAttribute('uv', 'uv:vec2');
    this.enableAttribute('boneWeight', 'boneWeight:vec4');
    this.enableAttribute('boneIndex', 'boneWeight:uint');

    this.bindElementBuffer('index');

    // Draw
    this.drawElements(this.mesh.indices.length);
  }
}

export class SkinnedMeshLayer extends RenderLayer {
  private _render: Render;
  public scene: Scene;
  public list: SkinnedElement[] = [];

  constructor(scene: Scene) {
    super(scene._render.gl);
    this._render = scene._render;
    this.scene = scene;

    this.createShader('skinnedMesh', skinnedMeshShaderText);
  }

  public add(element: SkinnedElement) {
    element.shaderMap = this.shaderMap;
    element.textureMap = this.textureMap;
    this.list.push(element);
  }

  update(delta: number) {
    this.list.forEach((element) => {
      element.mesh.skeleton.update();
    });
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
