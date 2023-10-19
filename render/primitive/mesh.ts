import { Quaternion, Vector2, Vector3 } from '../../math/linear_algebra';
import { GLTF_Mesh, GLTF_MeshPrimitive } from '../gltf/mesh';
import { RGBA8 } from '../../color';

export class Mesh {
  public name: string = '';

  public position: Vector3 = new Vector3();
  public rotation: Quaternion = new Quaternion();
  public scale: Vector3 = new Vector3(1, 1, 1);

  public vertices: Vector3[] = [];
  public tangent: Vector3[] = [];
  public biTangent: Vector3[] = [];
  public indices: number[] = [];
  public uv: Vector2[] = [];
  public normal: Vector3[] = [];
  public color: RGBA8[] = [];

  public isLiveUpdateVertexInGPU: boolean = false;

  constructor() {}

  public calculateTangent() {
    const tangentList = new Array(this.vertices.length).fill(new Vector3());
    const biTangentList = new Array(this.vertices.length).fill(new Vector3());

    for (let i = 0; i < this.indices.length; i += 3) {
      const i0 = this.indices[i];
      const i1 = this.indices[i + 1];
      const i2 = this.indices[i + 2];

      const v0 = this.vertices[i0];
      const v1 = this.vertices[i1];
      const v2 = this.vertices[i2];

      const uv0 = this.uv[i0];
      const uv1 = this.uv[i1];
      const uv2 = this.uv[i2];

      const deltaPos1 = v1.sub(v0);
      const deltaPos2 = v2.sub(v0);

      const deltaUV1 = uv1.sub(uv0);
      const deltaUV2 = uv2.sub(uv0);

      const r = 1.0 / (deltaUV1.x * deltaUV2.y - deltaUV1.y * deltaUV2.x);

      let a = deltaPos1.scale(deltaUV2.y);
      let b = deltaPos2.scale(deltaUV1.x);
      let a1 = deltaPos2.scale(deltaUV1.y);
      let b1 = deltaPos1.scale(deltaUV2.x);

      const tangent = a1.sub(a).scale(r);
      const biTangent = b1.sub(b).scale(r);

      tangentList[i0] = tangent;
      tangentList[i1] = tangent;
      tangentList[i2] = tangent;

      biTangentList[i0] = biTangent;
      biTangentList[i1] = biTangent;
      biTangentList[i2] = biTangent;
    }

    this.tangent = tangentList;
    this.biTangent = biTangentList;

    // Calculate tangent and biTangent
    /*for (let i = 0; i < this.vertices.length; i++) {
      // Получите вершины, нормали и текстурные координаты для текущей тройки вершин
      const v0 = this.vertices[i];
      const v1 = this.vertices[i + 1];
      const v2 = this.vertices[i + 2];

      const uv0 = this.uv[i];
      const uv1 = this.uv[i + 1];
      const uv2 = this.uv[i + 2];

      // Вычислите ребра треугольника
      const edge0 = v1.sub(v0);
      const edge1 = v2.sub(v0);

      // Вычислите разницу нормалей в вершинах
      const deltaUV0 = uv1.sub(uv0);
      const deltaUV1 = uv2.sub(uv0);

      const r = 1.0 / (deltaUV0.x * deltaUV1.y - deltaUV0.y * deltaUV1.x);

      const tangent = edge0.scale(deltaUV1.y).sub(edge1.scale(deltaUV0.y)).scale(r);
      const biTangent = edge1.scale(deltaUV0.x).sub(edge0.scale(deltaUV1.x)).scale(r);

      // Добавьте результаты в массивы
      tangentList.push(tangent);
      biTangentList.push(biTangent);

      i += 2;
    }

    */
  }

  public get plainVertices(): Float32Array {
    const out = [];
    for (let i = 0; i < this.vertices.length; i++) {
      out.push(this.vertices[i].x, this.vertices[i].y, this.vertices[i].z);
    }
    return new Float32Array(out);
  }

  public get plainTangent(): Float32Array {
    const out = [];
    for (let i = 0; i < this.tangent.length; i++) {
      out.push(this.tangent[i].x, this.tangent[i].y, this.tangent[i].z);
    }
    return new Float32Array(out);
  }

  public get plainBiTangent(): Float32Array {
    const out = [];
    for (let i = 0; i < this.biTangent.length; i++) {
      out.push(this.biTangent[i].x, this.biTangent[i].y, this.biTangent[i].z);
    }
    return new Float32Array(out);
  }

  public get plainIndices(): Uint32Array {
    const out = [];
    for (let i = 0; i < this.indices.length; i++) {
      out.push(this.indices[i]);
    }
    return new Uint32Array(out);
  }

  public get plainUV(): Float32Array {
    const out = [];
    for (let i = 0; i < this.uv.length; i++) {
      out.push(this.uv[i].x, this.uv[i].y);
    }
    return new Float32Array(out);
  }

  public get plainNormal(): Float32Array {
    const out = [];
    for (let i = 0; i < this.normal.length; i++) {
      out.push(this.normal[i].x, this.normal[i].y, this.normal[i].z);
    }
    return new Float32Array(out);
  }

  public set(primitive: GLTF_MeshPrimitive): Mesh {
    this.indices = Array.from(primitive.indices);
    this.vertices = Vector3.listFromArray(primitive.vertices);
    this.uv = Vector2.listFromArray(primitive.uv);
    this.normal = Vector3.listFromArray(primitive.normal);
    this.color = RGBA8.listFromArray(primitive.color);
    return this;
  }
}
