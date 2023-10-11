import { Matrix4x4, Quaternion, Vector3 } from '../linear_algebra';
import { Ray } from './ray';
import { Triangle } from './triangle';
import { Primitive } from './primitive';

export class Cube extends Primitive {
  public size: Vector3;
  private _vertices: Vector3[] = new Array(8).fill(Vector3.zero);
  public vertices: Vector3[] = new Array(8).fill(Vector3.zero);

  constructor(position: Vector3, size: Vector3) {
    super();

    this.position = position;
    this.size = size;

    const sizeX = size.x / 2;
    const sizeY = size.y / 2;
    const sizeZ = size.z / 2;

    this._vertices[0] = new Vector3(-sizeX, -sizeY, sizeZ);
    this._vertices[1] = new Vector3(sizeX, -sizeY, sizeZ);
    this._vertices[2] = new Vector3(sizeX, sizeY, sizeZ);
    this._vertices[3] = new Vector3(-sizeX, sizeY, sizeZ);

    this._vertices[4] = new Vector3(-sizeX, -sizeY, -sizeZ);
    this._vertices[5] = new Vector3(sizeX, -sizeY, -sizeZ);
    this._vertices[6] = new Vector3(sizeX, sizeY, -sizeZ);
    this._vertices[7] = new Vector3(-sizeX, sizeY, -sizeZ);
  }

  public calculateVertices() {
    for (let i = 0; i < this._vertices.length; i++) {
      this.vertices[i] = this._vertices[i].toVector4(1.0).multiplyMatrix(this.matrix).toVector3();
    }
  }

  public rayIntersection(ray: Ray): Vector3 | null {
    // Front
    const t1 = new Triangle(this.vertices[0], this.vertices[1], this.vertices[2]);
    const t2 = new Triangle(this.vertices[0], this.vertices[2], this.vertices[3]);

    // Back
    const t3 = new Triangle(this.vertices[4], this.vertices[5], this.vertices[6]);
    const t4 = new Triangle(this.vertices[4], this.vertices[6], this.vertices[7]);

    // Top
    const t5 = new Triangle(this.vertices[3], this.vertices[2], this.vertices[6]);
    const t6 = new Triangle(this.vertices[3], this.vertices[6], this.vertices[7]);

    // Bottom
    const t7 = new Triangle(this.vertices[0], this.vertices[1], this.vertices[5]);
    const t8 = new Triangle(this.vertices[0], this.vertices[5], this.vertices[4]);

    // Left
    const t9 = new Triangle(this.vertices[0], this.vertices[4], this.vertices[7]);
    const t10 = new Triangle(this.vertices[0], this.vertices[7], this.vertices[3]);

    // Right
    const t11 = new Triangle(this.vertices[1], this.vertices[5], this.vertices[6]);
    const t12 = new Triangle(this.vertices[1], this.vertices[6], this.vertices[2]);

    let pts = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12]
      .map((x) => {
        return x.rayIntersection(ray);
      })
      .filter(Boolean)
      .sort((a: Vector3, b: Vector3) => {
        return a.distanceTo(ray.start) - b.distanceTo(ray.start);
      });

    return pts[0];
  }
}
