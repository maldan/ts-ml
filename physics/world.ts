import { Ray } from '../math/geometry';
import { VR_Headset } from '../io';
import { Vector3 } from '../math/linear_algebra';
import { BaseCollider } from './collider/base';
import { VerletHair, VerletPoint, VerletRope } from './verlet';
import { VerletMesh } from './verlet/mesh';

export class World {
  public colliderList: BaseCollider[] = [];
  public ray: Ray;
  public vrHeadset: VR_Headset = new VR_Headset();
  public eventState = {
    isRayOver: new Set(),
    rayRightTrigger: new Set(),
    rayRightTriggerUp: new Set(),
  };
  public ropeList: VerletRope[] = [];
  public verletMeshList: VerletMesh[] = [];
  public verletHairList: VerletHair[] = [];

  constructor() {}

  public update(delta: number) {
    this.colliderList.forEach((x) => {
      x.update();
    });
    this.ropeList.forEach((x) => {
      x.updatePhysics(delta);

      // Collision with colliders
      x.points.forEach((p: VerletPoint) => {
        this.colliderList.forEach((c) => {
          const intersection = c.primitive.pointIntersection(p.position);
          if (!intersection) return;
          p.position = intersection;
        });
      });

      x.applyConstraint();
    });
    this.verletMeshList.forEach((x) => {
      x.updatePhysics(delta);

      // Collision with colliders
      x.points.forEach((p: VerletPoint) => {
        this.colliderList.forEach((c) => {
          const intersection = c.primitive.pointIntersection(p.position);
          if (!intersection) return;
          p.position = intersection;
        });
      });

      x.applyConstraint();
    });

    this.verletHairList.forEach((x) => {
      x.updatePhysics(delta);

      // Collision with colliders
      x.verletMesh.points.forEach((p: VerletPoint) => {
        this.colliderList.forEach((c) => {
          const intersection = c.primitive.pointIntersection(p.position);
          if (!intersection) return;
          p.position.set(intersection);
        });
      });

      x.applyConstraint();
    });

    this.checkRayCollision();
  }

  public checkRayCollision() {
    if (!this.ray) return;

    const rightController = this.vrHeadset.right.controller;
    const rightPosition = rightController.absoluteMatrix.getPosition();

    // Sort by distance
    this.colliderList.sort((a, b) => {
      return a.worldPosition.distanceTo(rightPosition) - b.worldPosition.distanceTo(rightPosition);
    });

    for (let i = 0; i < this.colliderList.length; i++) {
      const collider = this.colliderList[i];

      // Up events
      if (this.eventState.rayRightTrigger.has(collider) && !rightController.trigger) {
        collider.event.emit('ray.right.trigger.up', { collider, ray: this.ray });
        this.eventState.rayRightTrigger.delete(collider);
        // this.eventState.rayRightTriggerUp.delete(collider);
      }

      const point = collider.primitive.rayIntersection(this.ray);
      const event = { collider, ray: this.ray } as any;

      // Reset over, cast out
      if (!point && this.eventState.isRayOver.has(collider)) {
        this.eventState.isRayOver.delete(collider);
        collider.event.emit('ray.exit', event);
        // this.eventState.rayRightTriggerUp.delete(collider);
      }

      // Cast over
      if (point && !this.eventState.isRayOver.has(collider)) {
        event.point = point;
        collider.event.emit('ray.enter', event);
        this.eventState.isRayOver.add(collider);

        // Ray over collider, and trigger wasn't click
        if (!rightController.trigger) this.eventState.rayRightTriggerUp.add(collider);
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
          !this.eventState.rayRightTrigger.has(collider) &&
          rightController.trigger &&
          this.eventState.rayRightTriggerUp.has(collider)
        ) {
          collider.event.emit('ray.right.trigger.down', event);
          this.eventState.rayRightTrigger.add(collider);
          this.eventState.rayRightTriggerUp.delete(collider);
        }
      }
    }
  }

  public addCollider(collider: BaseCollider) {
    this.colliderList.push(collider);
  }
}
