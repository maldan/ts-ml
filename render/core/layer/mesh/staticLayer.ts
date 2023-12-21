import { RenderLayer } from '../../layer';
import { RenderElement } from '../../element';
import { SkinnedMesh } from '../../../primitive/skinnedMesh';
import { Render } from '../../render';
import { Scene } from '../../scene';
import { skinnedMeshShaderText, staticMeshShaderText } from './shader';
import { IEye } from '../../../type';
import { Mesh } from '../../../primitive/mesh';
import { SkinnedElement } from './skinnedLayer';
import { Matrix4x4, Quaternion, Vector3 } from '../../../../math/linear_algebra';

export class StaticElement extends RenderElement {
  public mesh: Mesh;

  private _position: Vector3 = new Vector3();
  private _rotation: Quaternion = new Quaternion();
  private _scale: Vector3 = new Vector3(1, 1, 1);
  private _modelMatrix: Matrix4x4 = Matrix4x4.identity;
  private _parentMatrix: Matrix4x4 | (() => Matrix4x4) | undefined = undefined;

  constructor(gl: WebGL2RenderingContext, mesh: Mesh) {
    super(gl);

    this.mesh = mesh;
    this.mesh.calculateTangent();

    this.createBuffer('index', 'vertex', 'tangent', 'biTangent', 'normal', 'uv');

    this.uploadElementBuffer('index', this.mesh.plainIndices);
    this.uploadBuffer('vertex', this.mesh.plainVertices);
    this.uploadBuffer('tangent', this.mesh.plainTangent);
    this.uploadBuffer('biTangent', this.mesh.plainBiTangent);
    this.uploadBuffer('normal', this.mesh.plainNormal);
    this.uploadBuffer('uv', this.mesh.plainUV);

    this.createTexture('uTextureColor', { filtration: 'linear', useMapMaps: true, wrap: 'repeat' });
    this.createTexture('uTextureNormal', {
      filtration: 'linear',
      useMapMaps: true,
      wrap: 'repeat',
    });
  }

  public get matrix() {
    return this._modelMatrix;
  }

  public set parentMatrix(m: Matrix4x4 | (() => Matrix4x4) | undefined) {
    this._parentMatrix = m;
  }

  public get parentMatrix(): Matrix4x4 | undefined {
    if (this._parentMatrix instanceof Matrix4x4) {
      return this._parentMatrix;
    }
    if (this._parentMatrix instanceof Function) {
      return this._parentMatrix();
    }
    return undefined;
  }

  render() {
    if (this.mesh.isLiveUpdateVertexInGPU) {
      this.mesh.calculateTangent();
      this.uploadBuffer('vertex', this.mesh.plainVertices);
      this.uploadBuffer('tangent', this.mesh.plainTangent);
      this.uploadBuffer('biTangent', this.mesh.plainBiTangent);
    }

    this.enableAttribute('vertex', 'aPosition:vec3');
    this.enableAttribute('tangent', 'aTangent:vec3');
    this.enableAttribute('biTangent', 'aBiTangent:vec3');
    this.enableAttribute('normal', 'aNormal:vec3');
    this.enableAttribute('uv', 'aUV:vec2');

    this.bindElementBuffer('index');

    this.activateTexture('uTextureColor', 0);
    this.activateTexture('uTextureNormal', 1);

    this.bindMatrix('uModelMatrix', this._modelMatrix.raw);

    // Draw
    this.drawElements(this.mesh.indices.length);
  }

  public calculateModelMatrix() {
    this._modelMatrix
      .identity_()
      .translate_(this._position)
      .rotateQuaternion_(this._rotation)
      .scale_(this._scale);

    if (this.parentMatrix) {
      // @ts-ignore
      this._modelMatrix = this.parentMatrix.mul(this._modelMatrix);
    }
  }

  public set position(v: Vector3) {
    this._position = v;
    this.calculateModelMatrix();
  }
  public set rotation(v: Quaternion) {
    this._rotation = v;
    this.calculateModelMatrix();
  }
  public set scale(v: Vector3) {
    this._scale = v;
    this.calculateModelMatrix();
  }
  public get position() {
    return this._position;
  }
  public get rotation() {
    return this._rotation;
  }
  public get scale() {
    return this._scale;
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
    gl.disable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);

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
      if (!element.isVisible) return;

      element.currentShaderName = this.currentShaderName;
      element.render();
    });
  }
}
