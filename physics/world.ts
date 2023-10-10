import { BoxCollider, ICollider } from './collider';
import { Ray } from '../math/geometry';
import { VR_Headset } from '../io';
import { Vector3 } from '../math/linear_algebra';

export class World {
  public colliderList: ICollider[] = [];
  public ray: Ray;
  public vrHeadset: VR_Headset = new VR_Headset();
  public eventState = {
    isRayOver: new Set(),
    isRayRightTrigger: new Set(),
  };

  constructor() {}

  public update(delta: number) {
    this.colliderList.forEach((x) => {
      x.update();
    });
    this.checkRayCollision();
  }

  public checkRayCollision() {
    if (!this.ray) return;
    for (let i = 0; i < this.colliderList.length; i++) {
      const collider = this.colliderList[i];
      if (collider instanceof BoxCollider) {
        const point = collider.cube.rayIntersection(this.ray);
        const event = { collider, ray: this.ray } as any;

        // Reset over, cast out
        if (!point && this.eventState.isRayOver.has(collider)) {
          this.eventState.isRayOver.delete(collider);
          if (this.eventState.isRayRightTrigger) {
            collider.event.emit('ray.right.trigger.up', event);
          }
          this.eventState.isRayRightTrigger.delete(collider);
          collider.event.emit('ray.exit', event);
          continue;
        }

        // Cast over
        if (point && !this.eventState.isRayOver.has(collider)) {
          event.point = point;
          collider.event.emit('ray.enter', event);
          this.eventState.isRayOver.add(collider);
        }

        // Update ray length
        if (point) {
          event.point = point;
          this.ray.length = Math.min(this.ray.length, Vector3.distance(this.ray.position, point));
          if (this.eventState.isRayOver.has(collider)) {
            collider.event.emit('ray.stay', event);
          }
        }

        // On click
        if (point && this.eventState.isRayOver.has(collider)) {
          if (
            !this.eventState.isRayRightTrigger.has(collider) &&
            this.vrHeadset.right.controller.trigger
          ) {
            collider.event.emit('ray.right.trigger.down', event);
            this.eventState.isRayRightTrigger.add(collider);
            continue;
          }

          if (
            this.eventState.isRayRightTrigger.has(collider) &&
            !this.vrHeadset.right.controller.trigger
          ) {
            collider.event.emit('ray.right.trigger.up', event);
            this.eventState.isRayRightTrigger.delete(collider);
            continue;
          }
        }
      }
    }
  }

  public addCollider(collider: ICollider) {
    this.colliderList.push(collider);
  }
}
