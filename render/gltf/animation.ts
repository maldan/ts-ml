import type { GLTF } from './index';
import { parseAccessor } from './util';
import { Quaternion, Vector3 } from '../../math/linear_algebra';

export class GLTF_AnimationSequence {
  public key: string = '';
  public type: string = '';
  public prevFrame: number = 0;
  public nextFrame: number = 0;
  public timeList: Float32Array = new Float32Array();
  public valueList: (Vector3 | Quaternion)[] = [];

  public calculateFrames(time: number) {
    this.prevFrame = this.timeList.length - 1;
    this.nextFrame = 0;

    for (let i = 0; i < this.timeList.length - 1; i++) {
      if (time >= this.timeList[i] && time <= this.timeList[i + 1]) {
        this.prevFrame = i;
        this.nextFrame = i + 1;
      }
    }
  }

  public calculateFrameValue(time: number): Vector3 | Quaternion {
    let t =
      (time - this.timeList[this.prevFrame]) /
      (this.timeList[this.nextFrame] - this.timeList[this.prevFrame]);

    if (this.type == 'translation' || this.type == 'scale') {
      if (!this.valueList[this.prevFrame] || !this.valueList[this.nextFrame])
        return new Vector3(0, 0, 0);
      return Vector3.lerp(
        this.valueList[this.prevFrame] as Vector3,
        this.valueList[this.nextFrame] as Vector3,
        t,
      );
    }
    if (this.type == 'rotation') {
      if (!this.valueList[this.prevFrame] || !this.valueList[this.nextFrame])
        return new Quaternion(0, 0, 0, 1);

      return Quaternion.lerp(
        this.valueList[this.prevFrame] as Quaternion,
        this.valueList[this.nextFrame] as Quaternion,
        t,
      );
    }

    return new Vector3(0, 0, 0);
  }
}

export class GLTF_Animation {
  public gltf: GLTF;
  public name: string;
  public currentTime: number = 0;
  public duration: number = 0;
  public sequenceList: GLTF_AnimationSequence[] = [];
  public currentFrame: {
    key: string;
    type: string;
    value: Vector3 | Quaternion;
  }[] = [];

  constructor(gltf: GLTF, animation: any) {
    this.gltf = gltf;
    this.name = animation.name || '';

    for (let i = 0; i < animation.channels.length; i++) {
      const node = this.gltf.nodes[animation.channels[i].target.node];
      const sampler = animation.samplers[animation.channels[i].sampler];
      let keyframes = parseAccessor(this.gltf, sampler.input);
      let values = parseAccessor(this.gltf, sampler.output);
      if (!keyframes || !values) continue;

      this.duration = Math.max(this.duration, ...keyframes);

      let sequence = new GLTF_AnimationSequence();
      sequence.key = node.name;
      sequence.type = animation.channels[i].target.path;
      sequence.timeList = keyframes as Float32Array;

      if (sequence.type === 'translation') {
        for (let j = 0; j < values.length; j += 3) {
          sequence.valueList.push(new Vector3(values[j], values[j + 1], values[j + 2]));
        }
      }
      if (sequence.type === 'rotation') {
        for (let j = 0; j < values.length; j += 4) {
          sequence.valueList.push(
            new Quaternion(values[j], values[j + 1], values[j + 2], values[j + 3]),
          );
        }
      }

      this.sequenceList.push(sequence);
    }
  }

  public tick(delta: number) {
    this.currentTime += delta;
    if (this.currentTime > this.duration) {
      this.currentTime %= this.duration;
    }

    this.currentFrame.length = 0;
    for (let i = 0; i < this.sequenceList.length; i++) {
      this.sequenceList[i].calculateFrames(this.currentTime);
      this.currentFrame.push({
        key: this.sequenceList[i].key,
        type: this.sequenceList[i].type,
        value: this.sequenceList[i].calculateFrameValue(this.currentTime),
      });
    }
  }
}
