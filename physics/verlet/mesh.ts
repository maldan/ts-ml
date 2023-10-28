import { VerletPoint } from './point';
import { DistanceConstraint } from './constraint';
import { Mesh } from '../../render/primitive/mesh';
import { Vector3 } from '../../math/linear_algebra';

export class VerletMesh {
  public points: VerletPoint[] = [];
  public constraints: DistanceConstraint[] = [];
  public constraintIterations: number = 1;

  constructor(mesh: Mesh, iterations: number = 1) {
    this.constraintIterations = iterations;

    for (let i = 0; i < mesh.vertices.length; i++) {
      this.points.push(new VerletPoint(mesh.vertices[i]));
    }
    for (let i = 0; i < mesh.indices.length; i += 3) {
      this.constraints.push(
        new DistanceConstraint(this.points[mesh.indices[i]], this.points[mesh.indices[i + 1]]),
      );
      this.constraints.push(
        new DistanceConstraint(this.points[mesh.indices[i + 1]], this.points[mesh.indices[i + 2]]),
      );
      this.constraints.push(
        new DistanceConstraint(this.points[mesh.indices[i + 2]], this.points[mesh.indices[i]]),
      );
    }
  }

  public addForce(v: Vector3) {
    this.points.forEach((point) => {
      point.force.set(v);
    });
  }

  public updatePhysics(delta: number) {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].update(delta);
    }
  }

  public applyConstraint() {
    for (let k = 0; k < this.constraintIterations; k++) {
      for (let i = 0; i < this.constraints.length; i++) {
        this.constraints[i].apply();
      }
    }
  }
}