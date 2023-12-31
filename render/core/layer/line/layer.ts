import { RenderLayer } from '../../layer';
import { Line } from '../../../primitive/line';
import { Render } from '../../render';
import { IEye } from '../../../type';
import { lineShaderText } from './shader';
import { Scene } from '../../scene';
import { Vector3, Vector4 } from '../../../../math/linear_algebra';
import { Triangle, Cube, Sphere } from '../../../../math/geometry';
import { Skeleton } from '../../../skeleton/skeleton';
import { Bone } from '../../../skeleton/bone';
import { VerletMesh } from '../../../../physics/verlet/mesh';
import { VerletRope } from '../../../../physics/verlet';

export class LineLayer extends RenderLayer {
  private _render: Render;
  public scene: Scene;
  public staticLines: Line[] = [];
  public dynamicLines: Line[] = [];
  public dynamicTopLines: Line[] = [];

  constructor(scene: Scene) {
    super(scene._render.gl);

    this.scene = scene;
    this._render = scene._render;

    this.createShader('line', lineShaderText);
    this.createBuffer(
      'static.vertex',
      'static.color',
      'dynamic.vertex',
      'dynamic.color',
      'dynamicTop.vertex',
      'dynamicTop.color',
    );
  }

  public initGrid() {
    // Lines
    for (let i = 0; i < 8; i++) {
      this.add(new Line(new Vector3(i - 3.5, 0, -4), new Vector3(i - 3.5, 0, 4), 0xffffffff));
      this.add(new Line(new Vector3(i - 3.5, 4, -4), new Vector3(i - 3.5, 4, 4), 0xffffffff));
    }
    for (let i = 0; i < 8; i++) {
      this.add(new Line(new Vector3(-4, 0, i - 3.5), new Vector3(4, 0, i - 3.5), 0xffffffff));
      this.add(new Line(new Vector3(-4, 4, i - 3.5), new Vector3(4, 4, i - 3.5), 0xffffffff));
    }
  }

  public drawBone(bone: Bone, color: number) {
    bone.children.forEach((children) => {
      this.drawTop(
        new Line(
          bone.matrix.getPosition(),
          children.matrix.getPosition(),
          //new Vector4(0, 0, 0, 1).multiplyMatrix(bone.matrix).toVector3(),
          //new Vector4(0, 0, 0, 1).multiplyMatrix(children.matrix).toVector3(),
          color,
        ),
      );
      this.drawBone(children, color);
    });
  }

  public drawSkeleton(skeleton: Skeleton, color: number) {
    if (!skeleton) return;
    skeleton.boneHierarchy.forEach((bone) => {
      this.drawBone(bone, color);
    });
  }

  public drawTriangle(triangle: Triangle, color: number) {
    this.draw(new Line(triangle.a, triangle.b, color));
    this.draw(new Line(triangle.b, triangle.c, color));
    this.draw(new Line(triangle.c, triangle.a, color));
  }

  /* public drawVerlet(list: VerletLine[], color: number) {
    list.forEach((line) => {
      this.draw(new Line(line.fromPosition, line.toPosition, color));
    });
  }*/
  public drawFromPoints(points: Vector3[], color: number) {
    for (let i = 0; i < points.length - 1; i++) {
      this.draw(new Line(points[i], points[i + 1], color));
    }
  }

  public drawVerlet(args: {
    verlet: VerletMesh | VerletRope;
    color: number;
    staticColor?: number;
    isTop?: boolean;
  }) {
    let draw = args.isTop ? this.drawTop.bind(this) : this.draw.bind(this);
    let verlet = args.verlet;
    let staticColor = args.staticColor;
    let color = args.color;

    if (staticColor === undefined) staticColor = color;

    for (let i = 0; i < verlet.constraints.length; i++) {
      if (!verlet.constraints[i].debug.isDraw) continue;

      // From static to static
      if (verlet.constraints[i].from.isStatic && verlet.constraints[i].to.isStatic) {
        draw(
          new Line(
            verlet.constraints[i].from.position,
            verlet.constraints[i].to.position,
            staticColor,
            staticColor,
          ),
        );
        continue;
      }

      if (!verlet.constraints[i].from.isStatic && verlet.constraints[i].to.isStatic) {
        draw(
          new Line(
            verlet.constraints[i].from.position,
            verlet.constraints[i].to.position,
            color,
            staticColor,
          ),
        );
        continue;
      }

      if (verlet.constraints[i].from.isStatic && !verlet.constraints[i].to.isStatic) {
        draw(
          new Line(
            verlet.constraints[i].from.position,
            verlet.constraints[i].to.position,
            staticColor,
            color,
          ),
        );
        continue;
      }

      draw(
        new Line(
          verlet.constraints[i].from.position,
          verlet.constraints[i].to.position,
          color,
          color,
        ),
      );
    }
  }

  public drawCube(cube: Cube, color: number) {
    this.draw(new Line(cube.vertices[0], cube.vertices[1], color));
    this.draw(new Line(cube.vertices[1], cube.vertices[2], color));
    this.draw(new Line(cube.vertices[2], cube.vertices[3], color));
    this.draw(new Line(cube.vertices[3], cube.vertices[0], color));

    this.draw(new Line(cube.vertices[4], cube.vertices[5], color));
    this.draw(new Line(cube.vertices[5], cube.vertices[6], color));
    this.draw(new Line(cube.vertices[6], cube.vertices[7], color));
    this.draw(new Line(cube.vertices[7], cube.vertices[4], color));

    this.draw(new Line(cube.vertices[0], cube.vertices[4], color));
    this.draw(new Line(cube.vertices[1], cube.vertices[5], color));
    this.draw(new Line(cube.vertices[2], cube.vertices[6], color));
    this.draw(new Line(cube.vertices[3], cube.vertices[7], color));
  }

  public drawSphere(sphere: Sphere, color: number) {
    let num_segments = 8;

    let position = Vector3.zero;
    let radius = sphere.radius;

    // Рисуем окружности вдоль каждой из трех координатных плоскостей
    for (let i = 0; i < num_segments; i++) {
      let angle = (i / num_segments) * 2.0 * Math.PI;

      // Рисуем окружность в плоскости XY
      let x0 = position.x + radius * Math.cos(angle);
      let y0 = position.y + radius * Math.sin(angle);
      let z0 = position.z;
      let x1 = position.x + radius * Math.cos(angle + (2.0 * Math.PI) / num_segments);
      let y1 = position.y + radius * Math.sin(angle + (2.0 * Math.PI) / num_segments);
      let z1 = position.z;
      let p1 = new Vector4(x0, y0, z0, 1.0).multiplyMatrix(sphere.matrix).toVector3();
      let p2 = new Vector4(x1, y1, z1, 1.0).multiplyMatrix(sphere.matrix).toVector3();
      this.draw(new Line(p1, p2, color));

      // Рисуем окружность в плоскости XZ
      x0 = position.x + radius * Math.cos(angle);
      y0 = position.y;
      z0 = position.z + radius * Math.sin(angle);
      x1 = position.x + radius * Math.cos(angle + (2.0 * Math.PI) / num_segments);
      y1 = position.y;
      z1 = position.z + radius * Math.sin(angle + (2.0 * Math.PI) / num_segments);
      p1 = new Vector4(x0, y0, z0, 1.0).multiplyMatrix(sphere.matrix).toVector3();
      p2 = new Vector4(x1, y1, z1, 1.0).multiplyMatrix(sphere.matrix).toVector3();
      this.draw(new Line(p1, p2, color));

      // Рисуем окружность в плоскости YZ
      x0 = position.x;
      y0 = position.y + radius * Math.cos(angle);
      z0 = position.z + radius * Math.sin(angle);
      x1 = position.x;
      y1 = position.y + radius * Math.cos(angle + (2.0 * Math.PI) / num_segments);
      z1 = position.z + radius * Math.sin(angle + (2.0 * Math.PI) / num_segments);
      p1 = new Vector4(x0, y0, z0, 1.0).multiplyMatrix(sphere.matrix).toVector3();
      p2 = new Vector4(x1, y1, z1, 1.0).multiplyMatrix(sphere.matrix).toVector3();
      this.draw(new Line(p1, p2, color));
    }
  }

  public draw(line: Line) {
    this.dynamicLines.push(line);
  }

  public drawTop(line: Line) {
    this.dynamicTopLines.push(line);
  }

  public add(line: Line) {
    this.staticLines.push(line);

    let vertexList = [];
    let colorList = [];
    for (let i = 0; i < this.staticLines.length; i++) {
      const line = this.staticLines[i];
      vertexList.push(line.from.x, line.from.y, line.from.z);
      vertexList.push(line.to.x, line.to.y, line.to.z);
      colorList.push(line.fromColor, line.toColor);
    }

    this.uploadBuffer('static.vertex', new Float32Array(vertexList));
    this.uploadBuffer('static.color', new Uint32Array(colorList));
  }

  private renderStatic() {
    const gl = this._render.gl;
    let size = this.staticLines.length * 2;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    this.enableAttribute('static.vertex', 'aVertex:vec3');
    this.enableAttribute('static.color', 'aColor:uint');

    this.bindBuffer('static.vertex');
    this.bindBuffer('static.color');

    gl.drawArrays(gl.LINES, 0, size);
  }

  private renderDynamic() {
    const gl = this._render.gl;
    let size = this.dynamicLines.length * 2;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    let vertexList = [];
    let colorList = [];
    for (let i = 0; i < this.dynamicLines.length; i++) {
      const line = this.dynamicLines[i];
      vertexList.push(line.from.x, line.from.y, line.from.z);
      vertexList.push(line.to.x, line.to.y, line.to.z);
      colorList.push(line.fromColor, line.toColor);
    }

    this.uploadBuffer('dynamic.vertex', new Float32Array(vertexList));
    this.uploadBuffer('dynamic.color', new Uint32Array(colorList));

    this.enableAttribute('dynamic.vertex', 'aVertex:vec3');
    this.enableAttribute('dynamic.color', 'aColor:uint');

    gl.drawArrays(gl.LINES, 0, size);
  }

  private renderDynamicTop() {
    const gl = this._render.gl;
    let size = this.dynamicTopLines.length * 2;

    gl.disable(gl.DEPTH_TEST);

    let vertexList = [];
    let colorList = [];
    for (let i = 0; i < this.dynamicTopLines.length; i++) {
      const line = this.dynamicTopLines[i];
      vertexList.push(line.from.x, line.from.y, line.from.z);
      vertexList.push(line.to.x, line.to.y, line.to.z);
      colorList.push(line.fromColor, line.toColor);
    }

    this.uploadBuffer('dynamicTop.vertex', new Float32Array(vertexList));
    this.uploadBuffer('dynamicTop.color', new Uint32Array(colorList));

    this.enableAttribute('dynamicTop.vertex', 'aVertex:vec3');
    this.enableAttribute('dynamicTop.color', 'aColor:uint');

    gl.drawArrays(gl.LINES, 0, size);
  }

  public end() {
    // Clear lines
    this.dynamicLines.length = 0;

    // Clear lines
    this.dynamicTopLines.length = 0;
  }

  public render(eye: IEye) {
    const gl = this._render.gl;

    this.useShader('line');

    // Preparations
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.lineWidth(2);

    // Bind matrix
    if (eye) {
      this.bindMatrix('uProjectionMatrix', this._render.vrHeadset[eye].projectionMatrix.raw);
      this.bindMatrix('uViewMatrix', this._render.vrHeadset[eye].viewMatrix.raw);
    } else {
      this.bindMatrix('uProjectionMatrix', this.scene.camera.projectionMatrix.raw);
      this.bindMatrix('uViewMatrix', this.scene.camera.viewMatrix.raw);
    }

    this.renderStatic();
    this.renderDynamic();
    this.renderDynamicTop();
  }
}
