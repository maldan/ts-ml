import { RenderLayer } from '../../layer';
import { RenderElement } from '../../element';
import { SkinnedMesh } from '../../../primitive/skinnedMesh';
import { Render } from '../../render';
import { Scene } from '../../scene';
import { skinnedMeshShaderText, staticMeshShaderText } from './shader';
import { IEye } from '../../../type';
import { Mesh } from '../../../primitive/mesh';
import { SkinnedElement } from './skinnedLayer';

export class StaticElement extends RenderElement {
  public mesh: Mesh;

  constructor(gl: WebGL2RenderingContext, mesh: Mesh) {
    super(gl);

    this.mesh = mesh;
    this.mesh.calculateTangent();

    console.log(this.mesh);

    this.createBuffer('index', 'vertex', 'tangent', 'biTangent', 'normal', 'uv');

    this.uploadElementBuffer('index', this.mesh.plainIndices);
    this.uploadBuffer('vertex', this.mesh.plainVertices);
    this.uploadBuffer('tangent', this.mesh.plainTangent);
    this.uploadBuffer('biTangent', this.mesh.plainBiTangent);
    this.uploadBuffer('normal', this.mesh.plainNormal);
    this.uploadBuffer('uv', this.mesh.plainUV);

    this.createTexture('uTextureColor', { filtration: 'linear', useMapMaps: true });
    this.createTexture('uTextureNormal', { filtration: 'linear', useMapMaps: true });
  }

  render() {
    this.enableAttribute('vertex', 'aPosition:vec3');
    this.enableAttribute('tangent', 'aTangent:vec3');
    this.enableAttribute('biTangent', 'aBiTangent:vec3');
    this.enableAttribute('normal', 'aNormal:vec3');
    this.enableAttribute('uv', 'aUV:vec2');

    this.bindElementBuffer('index');

    this.activateTexture('uTextureColor', 0);
    this.activateTexture('uTextureNormal', 1);

    // Draw
    this.drawElements(this.mesh.indices.length);
  }
}

export class StaticMeshLayer extends RenderLayer {
  private _render: Render;
  public scene: Scene;
  public list: StaticElement[] = [];

  constructor(scene: Scene) {
    super(scene._render.gl);
    this._render = scene._render;
    this.scene = scene;

    this.createShader('staticMesh', staticMeshShaderText);
  }

  public add(element: StaticElement) {
    element.shaderMap = this.shaderMap;
    this.list.push(element);
  }

  update(delta: number) {}

  render(eye: IEye) {
    const gl = this.gl;

    // Preparations
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    this.useShader('staticMesh');

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
