import { IEye } from '../type';
import { Render } from '../core/render';
import { Matrix4x4 } from '../../math/linear_algebra';

export class VR_Render {
  private _render: Render;
  refSpace: XRReferenceSpace;
  session: XRSession;
  isActive: boolean = false;
  onTick: (delta: number) => void = () => {};
  lastTime: number = 0;

  renderTask: any = {
    glLayer: undefined,
    left: {},
    right: {},
  };

  constructor(render: Render) {
    this._render = render;
  }

  init() {
    const el = document.querySelector('#request-vr');
    el?.addEventListener('click', async () => {
      this.session = (await navigator.xr?.requestSession('immersive-vr')) as XRSession;
      if (!this.session) return;

      console.log(this.session);
      await this.session.updateRenderState({
        baseLayer: new XRWebGLLayer(this.session, this._render.gl),
      });

      this.refSpace = await this.session.requestReferenceSpace('local');
      console.log(this.refSpace);

      this.session.requestAnimationFrame(this.step.bind(this));
    });
  }

  step(timestamp: DOMHighResTimeStamp, frame: XRFrame) {
    let delta = (timestamp - this.lastTime) / 1000;
    if (delta < 0.016 / 4) delta = 0.016 / 4;
    if (delta > 0.016 * 4) delta = 0.016 * 4;

    this.isActive = true;

    frame.session.requestAnimationFrame(this.step.bind(this));
    let pose = frame.getViewerPose(this.refSpace);
    if (pose == undefined) return;

    let glLayer = frame.session.renderState.baseLayer;
    if (glLayer == undefined) return;

    // Bind buffer
    this.renderTask.glLayer = glLayer;

    // Write head transform
    this._render.vrHeadset.headTransform = new Matrix4x4(pose.transform.matrix);

    // Check controllers
    for (let inputSource of frame.session.inputSources) {
      if (inputSource.gripSpace) {
        let gripPose = frame.getPose(inputSource.gripSpace, this.refSpace);
        if (!gripPose) continue;
        let gamepad = inputSource.gamepad;
        if (!gamepad) continue;

        if (inputSource.handedness == 'left') {
          // Left trigger
          this._render.vrHeadset.left.controller.trigger = gamepad.buttons[0].pressed;

          // Axis
          this._render.vrHeadset.left.controller.axis.x = inputSource.gamepad?.axes[2] || 0;
          this._render.vrHeadset.left.controller.axis.y = inputSource.gamepad?.axes[3] || 0;

          // Left controller transform
          this._render.vrHeadset.left.controller.matrix = new Matrix4x4(gripPose.transform.matrix);
        }

        if (inputSource.handedness == 'right') {
          // Right trigger
          this._render.vrHeadset.right.controller.trigger = gamepad.buttons[0].pressed;

          // Axis
          this._render.vrHeadset.right.controller.axis.x = inputSource.gamepad?.axes[2] || 0;
          this._render.vrHeadset.right.controller.axis.y = inputSource.gamepad?.axes[3] || 0;

          // Right controller transform
          this._render.vrHeadset.right.controller.matrix = new Matrix4x4(gripPose.transform.matrix);
        }
      }
    }

    for (let view of pose.views) {
      let viewport = glLayer.getViewport(view);
      if (!viewport) continue;

      this.renderTask[view.eye]['viewport'] = {
        x: viewport.x,
        y: viewport.y,
        width: viewport.width,
        height: viewport.height,
      };

      // Change near far
      let new_far = 64;
      let new_near = 0.01;
      let a = (new_far + new_near) / (new_near - new_far);
      let b = (2 * new_far * new_near) / (new_near - new_far);
      view.projectionMatrix[10] = a;
      view.projectionMatrix[14] = b;

      this.renderTask[view.eye]['projectionMatrix'] = view.projectionMatrix;
      this.renderTask[view.eye]['viewMatrix'] = view.transform.inverse.matrix;

      // Set projection matrix
      if (view.eye == 'left' || view.eye == 'right') {
        this._render.vrHeadset[view.eye].projectionMatrix = new Matrix4x4(view.projectionMatrix);
        this._render.vrHeadset[view.eye].viewMatrix = new Matrix4x4(view.transform.inverse.matrix);
      }
    }

    // On each step
    this.onTick(delta);

    this.lastTime = timestamp;
  }

  render() {
    // Bind buffer
    this._render.gl.bindFramebuffer(
      this._render.gl.FRAMEBUFFER,
      this.renderTask.glLayer.framebuffer,
    );
    this._render.clear();

    // Left
    ['left', 'right'].forEach((eye: IEye) => {
      this._render.gl.viewport(
        this.renderTask[eye].viewport.x,
        this.renderTask[eye].viewport.y,
        this.renderTask[eye].viewport.width,
        this.renderTask[eye].viewport.height,
      );

      this._render.render(eye);
    });
  }
}
