import { VR_Headset } from '../../io/vr';
import { IEye } from '../type';
import { VR_Render } from '../vr/vr';
import { Scene } from './scene';

export class Render {
  public canvas!: HTMLCanvasElement;
  public gl!: WebGL2RenderingContext;
  public vrHeadset: VR_Headset = new VR_Headset();
  public vr: VR_Render;
  public scene: Scene;

  constructor() {
    // Init canvas
    this.canvas = document.querySelector('#glcanvas') as HTMLCanvasElement;
    if (!this.canvas) throw new Error(`Canvas not found`);

    // Init gl
    this.gl = this.canvas.getContext('webgl2', {
      antialias: true,
      premultipliedAlpha: false,
      xrCompatible: true,
    }) as WebGL2RenderingContext;
    if (this.gl === null) throw new Error('WebGL is not supported');

    // Init vr
    this.vr = new VR_Render(this);
    this.vr.init();

    // Init scene
    this.scene = new Scene(this);
  }

  public update(delta: number) {
    this.scene.update(delta);
  }

  public render(eye: IEye = '') {
    this.scene.render(eye);
  }

  public end() {
    this.scene.end();
  }

  public clear() {
    let gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}
