import { Ray } from '../math/geometry';
import { VR_Headset } from '../io';
import { Vector3 } from '../math/linear_algebra';
import { BaseCollider } from './collider/base';
import { VerletRope } from './verlet';

export class World {
  public colliderList: BaseCollider[] = [];
  public ray: Ray;
  public vrHeadset: VR_Headset = new VR_Headset();
  public eventState = {
    isRayOver: new Set(),
    rayRightTrigger: new Set(),
  };
  public ropeList: VerletRope[] = [];

  constructor() {}

  public update(delta: number) {
    this.colliderList.forEach((x) => {
      x.update();
    });
    this.ropeList.forEach((x) => {
      // Collision with colliders
      x.points.forEach((p) => {
        this.colliderList.forEach((c) => {
          const intersection = c.primitive.pointIntersection(p.position);
          if (!intersection) return;
          p.position = intersection;
        });
      });

      x.updatePhysics(delta);
      x.applyConstraint();
    });
    this.checkRayCollision();
  }

  public checkRayCollision() {
    if (!this.ray) return;
    for (let i = 0; i < this.colliderList.length; i++) {
      const collider = this.colliderList[i];
      const rightController = this.vrHeadset.right.controller;

      // Up events
      if (this.eventState.rayRightTrigger.has(collider) && !rightController.trigger) {
        collider.event.emit('ray.right.trigger.up', { collider, ray: this.ray });
        this.eventState.rayRightTrigger.delete(collider);
      }

      const point = collider.primitive.rayIntersection(this.ray);
      const event = { collider, ray: this.ray } as any;

      // Reset over, cast out
      if (!point && this.eventState.isRayOver.has(collider)) {
        this.eventState.isRayOver.delete(collider);
        collider.event.emit('ray.exit', event);
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
        if (!this.eventState.rayRightTrigger.has(collider) && rightController.trigger) {
          collider.event.emit('ray.right.trigger.down', event);
          this.eventState.rayRightTrigger.add(collider);
        }
      }
    }
  }

  public addCollider(collider: BaseCollider) {
    this.colliderList.push(collider);
  }
}
