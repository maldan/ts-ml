import { Mesh } from '../../render/primitive/mesh';
import { VerletMesh } from './mesh';
import { Matrix4x4, Vector3 } from '../../math/linear_algebra';
import { VerletRope } from './rope';

export class VerletHair {
  public mesh: Mesh;
  //public verletMesh: VerletMesh;
  private readonly _parentMatrix: Matrix4x4 | (() => Matrix4x4);
  private _localPoints: Vector3[] = [];
  public verletRopes: VerletRope[] = [];

  constructor(mesh: Mesh, parentMatrix: Matrix4x4 | (() => Matrix4x4)) {
    this.mesh = mesh;
    //this.verletMesh = new VerletMesh(mesh, 4);
    this._parentMatrix = parentMatrix;

    // this._localPoints.length = this.mesh.vertices.length;
    const mxPosition = this.parentMatrix.getPosition();

    for (let i = 0; i < this.mesh.vertices.length; i++) {
      for (let j = 0; j < 3; j++) {
        const offset = new Vector3(Math.random(), Math.random(), Math.random()).scale(0.02);
        const rope = new VerletRope(
          this.mesh.vertices[i].add(offset),
          this.mesh.vertices[i].add(this.mesh.normal[i].normalize().scale(0.5)),
          8,
          3,
        );
        rope.points.forEach((x) => {
          x.force.setXYZ(0, -9.8, 0);
        });
        rope.end.isStatic = false;

        // Local points
        this._localPoints.push(rope.start.position.sub(mxPosition));

        this.verletRopes.push(rope);
      }
    }

    // Make roots static
    /*this._localPoints.length = this.verletMesh.points.length;
    const mxPosition = this.parentMatrix.getPosition();
    console.log(mxPosition);

    for (let i = 0; i < mesh.color.length; i++) {
      // White
      if (mesh.color[i].r === 255 && mesh.color[i].g === 255 && mesh.color[i].b === 255) {
        this.verletMesh.points[i].isStatic = true;

        // Local points
        this._localPoints[i] = this.verletMesh.points[i].position.sub(mxPosition);
      }
    }*/

    // Update mesh links
    /*for (let i = 0; i < this.verletMesh.points.length; i++) {
      this.mesh.vertices[i] = this.verletMesh.points[i].position;
    }
    this.mesh.isLiveUpdateVertexInGPU = true;

    for (let i = 0; i < this.verletMesh.points.length; i++) {
      this.verletMesh.points[i].mass = 1.0;
    }*/
  }

  /* public updatePhysics(delta: number) {
    // Update points with matrix
    for (let i = 0; i < this.verletMesh.points.length; i++) {
      if (!this.verletMesh.points[i].isStatic) continue;

      this.verletMesh.points[i].position.set(
        this._localPoints[i].toVector4(1.0).multiplyMatrix(this.parentMatrix).toVector3(),
      );
    }

    this.verletMesh.updatePhysics(delta);
  }

  public applyConstraint() {
    this.verletMesh.applyConstraint();
  }*/

  public updatePhysics(delta: number) {
    // Update points with matrix
    for (let i = 0; i < this.verletRopes.length; i++) {
      this.verletRopes[i].start.position.set(
        this._localPoints[i].toVector4(1.0).multiplyMatrix(this.parentMatrix).toVector3(),
      );
    }

    this.verletRopes.forEach((x) => {
      x.updatePhysics(delta);
    });
  }

  public applyConstraint() {
    this.verletRopes.forEach((x) => {
      x.applyConstraint();
    });
  }

  public get parentMatrix(): Matrix4x4 {
    if (this._parentMatrix instanceof Matrix4x4) {
      return this._parentMatrix;
    }
    return this._parentMatrix();
  }
}
