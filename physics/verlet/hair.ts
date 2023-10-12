import { Mesh } from '../../render/primitive/mesh';
import { VerletMesh } from './mesh';
import { Matrix4x4, Vector3 } from '../../math/linear_algebra';

export class VerletHair {
  public mesh: Mesh;
  public verletMesh: VerletMesh;
  private readonly _parentMatrix: Matrix4x4 | (() => Matrix4x4);
  private _localPoints: Vector3[] = [];

  constructor(mesh: Mesh, parentMatrix: Matrix4x4 | (() => Matrix4x4)) {
    this.mesh = mesh;
    this.verletMesh = new VerletMesh(mesh, 4);
    this._parentMatrix = parentMatrix;

    // Make roots static
    this._localPoints.length = this.verletMesh.points.length;
    const mxPosition = this.parentMatrix.getPosition();
    console.log(mxPosition);

    for (let i = 0; i < mesh.color.length; i++) {
      // White
      if (mesh.color[i].r === 255 && mesh.color[i].g === 255 && mesh.color[i].b === 255) {
        this.verletMesh.points[i].isStatic = true;

        // Local points
        this._localPoints[i] = this.verletMesh.points[i].position.sub(mxPosition);
      }
    }

    // Update mesh links
    for (let i = 0; i < this.verletMesh.points.length; i++) {
      this.mesh.vertices[i] = this.verletMesh.points[i].position;
    }
    this.mesh.isLiveUpdateVertexInGPU = true;

    for (let i = 0; i < this.verletMesh.points.length; i++) {
      this.verletMesh.points[i].mass = 1.0;
    }
  }

  public updatePhysics(delta: number) {
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
  }

  public get parentMatrix(): Matrix4x4 {
    if (this._parentMatrix instanceof Matrix4x4) {
      return this._parentMatrix;
    }
    return this._parentMatrix();
  }
}
