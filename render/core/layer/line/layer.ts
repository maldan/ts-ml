import { RenderLayer } from '../../layer';
import { Line } from '../../../primitive/line';
import { Render } from '../../render';
import { IEye } from '../../../type';
import { lineShaderText } from './shader';
import { Scene } from '../../scene';

export class LineLayer extends RenderLayer {
  private _render: Render;
  public scene: Scene;
  public staticLines: Line[] = [];
  public dynamicLines: Line[] = [];
  public dynamicTopLines: Line[] = [];

  constructor(scene: Scene) {
    super(scene._render.gl);

    this.scene = scene;
    this._render = scene._render;

    this.createShader('line', lineShaderText);
    this.createBuffer(
      'static.vertex',
      'static.color',
      'dynamic.vertex',
      'dynamic.color',
      'dynamicTop.vertex',
      'dynamicTop.color',
    );
  }

  public draw(line: Line) {
    this.dynamicLines.push(line);
  }

  public drawTop(line: Line) {
    this.dynamicTopLines.push(line);
  }

  public add(line: Line) {
    this.staticLines.push(line);

    let vertexList = [];
    let colorList = [];
    for (let i = 0; i < this.staticLines.length; i++) {
      const line = this.staticLines[i];
      vertexList.push(line.from.x, line.from.y, line.from.z);
      vertexList.push(line.to.x, line.to.y, line.to.z);
      colorList.push(line.fromColor, line.toColor);
    }

    this.uploadBuffer('static.vertex', new Float32Array(vertexList));
    this.uploadBuffer('static.color', new Uint32Array(colorList));
  }

  private renderStatic() {
    const gl = this._render.gl;
    let size = this.staticLines.length * 2;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    this.enableAttribute('static.vertex', 'aVertex:vec3');
    this.enableAttribute('static.color', 'aColor:uint');

    this.bindBuffer('static.vertex');
    this.bindBuffer('static.color');

    gl.drawArrays(gl.LINES, 0, size);
  }

  private renderDynamic() {
    const gl = this._render.gl;
    let size = this.dynamicLines.length * 2;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    let vertexList = [];
    let colorList = [];
    for (let i = 0; i < this.dynamicLines.length; i++) {
      const line = this.dynamicLines[i];
      vertexList.push(line.from.x, line.from.y, line.from.z);
      vertexList.push(line.to.x, line.to.y, line.to.z);
      colorList.push(line.fromColor, line.toColor);
    }

    this.uploadBuffer('dynamic.vertex', new Float32Array(vertexList));
    this.uploadBuffer('dynamic.color', new Uint32Array(colorList));

    this.enableAttribute('dynamic.vertex', 'aVertex:vec3');
    this.enableAttribute('dynamic.color', 'aColor:uint');

    gl.drawArrays(gl.LINES, 0, size);

    // Clear lines
    this.dynamicLines.length = 0;
  }

  private renderDynamicTop() {
    const gl = this._render.gl;
    let size = this.dynamicTopLines.length * 2;

    gl.disable(gl.DEPTH_TEST);

    let vertexList = [];
    let colorList = [];
    for (let i = 0; i < this.dynamicTopLines.length; i++) {
      const line = this.dynamicTopLines[i];
      vertexList.push(line.from.x, line.from.y, line.from.z);
      vertexList.push(line.to.x, line.to.y, line.to.z);
      colorList.push(line.fromColor, line.toColor);
    }

    this.uploadBuffer('dynamicTop.vertex', new Float32Array(vertexList));
    this.uploadBuffer('dynamicTop.color', new Uint32Array(colorList));

    this.enableAttribute('dynamicTop.vertex', 'aVertex:vec3');
    this.enableAttribute('dynamicTop.color', 'aColor:uint');

    gl.drawArrays(gl.LINES, 0, size);

    // Clear lines
    this.dynamicTopLines.length = 0;
  }

  public render(eye: IEye) {
    const gl = this._render.gl;

    this.useShader('line');

    // Preparations
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Bind matrix
    if (eye) {
      this.bindMatrix('uProjectionMatrix', this._render.vrHeadset[eye].projectionMatrix.raw);
      this.bindMatrix('uViewMatrix', this._render.vrHeadset[eye].viewMatrix.raw);
    } else {
      this.bindMatrix('uProjectionMatrix', this.scene.camera.projectionMatrix.raw);
      this.bindMatrix('uViewMatrix', this.scene.camera.viewMatrix.raw);
    }

    this.renderStatic();
    this.renderDynamic();
    this.renderDynamicTop();
  }
}
