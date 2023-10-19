import { VR_Headset } from '../../io';
import { IEye } from '../type';
import { VR_Render } from '../vr/vr';
import { Scene } from './scene';
import { Slice } from '../../slice';
import { Vector3 } from '../../math/linear_algebra';

export class RenderStats {
  public frame: number = 0;
  public time: number = 0;
  public deltaTime: number[] = [];
  public updateTime: number[] = [];
  public renderTime: number[] = [];
  public lastTime: number = 0;

  public avgDeltaTime: number = 0;
  public avgUpdateTime: number = 0;
  public avgRenderTime: number = 0;

  public onAvg = (stats: RenderStats) => {};
}

export class Render {
  public canvas!: HTMLCanvasElement;
  public gl!: WebGL2RenderingContext;
  public vrHeadset: VR_Headset = new VR_Headset();
  public vr: VR_Render;
  private _scene: Scene;
  public stats: RenderStats = new RenderStats();
  public onTick = (delta: number) => {};

  constructor(canvasId: string) {
    // Init canvas
    this.canvas = document.querySelector(canvasId) as HTMLCanvasElement;
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

    // Start
    requestAnimationFrame(this.tick.bind(this));

    // Vr mode
    this.vr.onTick = this.vrTick.bind(this);
  }

  private vrTick(delta: number) {
    // Calculate delta
    this.stats.deltaTime.push(delta);

    // Control
    const left = this.vrHeadset.left.controller;
    const right = this.vrHeadset.right.controller;
    this.vrHeadset.offsetPosition(new Vector3(delta * left.axis.x, 0.0, delta * left.axis.y));
    this.vrHeadset.offsetRotation(new Vector3(0.0, delta * right.axis.x, 0.0));
    this.vrHeadset.calculateOffset();

    // Update
    let p = performance.now();
    this.onTick(delta);
    this.update(delta);
    this.stats.updateTime.push(performance.now() - p);

    // Draw
    p = performance.now();
    this.vr.render();
    this.end();
    this.stats.renderTime.push(performance.now() - p);

    // Count frames
    this.stats.frame += 1;
  }

  private tick(currentTime: number) {
    if (this.vr.isActive) return;

    // Start
    requestAnimationFrame(this.tick.bind(this));

    // Calculate delta
    let delta = (currentTime - this.stats.lastTime) / 1000;
    this.stats.deltaTime.push(delta);
    if (delta < 0.016 / 4) delta = 0.016 / 4;
    if (delta > 0.016 * 4) delta = 0.016 * 4;

    // Update
    let p = performance.now();
    this.onTick(delta);
    this.update(delta);
    this.stats.updateTime.push(performance.now() - p);

    // Draw
    p = performance.now();
    this.clear();
    this.render();
    this.end();
    this.stats.renderTime.push(performance.now() - p);

    // Count frames
    this.stats.frame += 1;

    // Last time
    this.stats.lastTime = currentTime;
  }

  public set scene(scene: Scene) {
    this._scene = scene;
  }

  public get scene() {
    return this._scene;
  }

  public update(delta: number) {
    this.scene.update(delta);

    // Count time
    this.stats.time += delta;

    // Calculate avg
    if (this.stats.frame % 30 == 0) {
      this.stats.avgDeltaTime = Slice.avg(this.stats.deltaTime);
      this.stats.avgUpdateTime = Slice.avg(this.stats.updateTime);
      this.stats.avgRenderTime = Slice.avg(this.stats.renderTime);

      // Clear stats
      this.stats.deltaTime.length = 0;
      this.stats.updateTime.length = 0;
      this.stats.renderTime.length = 0;

      // Avg is complete
      this.stats.onAvg(this.stats);
    }
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
