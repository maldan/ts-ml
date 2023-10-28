export class RenderUtil {
  public static createShader(gl: WebGL2RenderingContext, main: string): WebGLProgram {
    main = main.replace(/\r\n/g, '\n');
    let shader = main.split('// Fragment\n');
    // console.log(shader);
    return this.createProgram(gl, shader[0], shader[1]);
  }

  public static createProgram(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string,
  ): WebGLProgram {
    let createShader = function (source: string, type: number) {
      let shader = gl.createShader(type);
      if (shader == null) throw new Error('Shader is null');
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    let program = gl.createProgram();
    if (program == null) throw new Error('Program is null');

    let vShader = createShader(vertexShaderSource, gl.VERTEX_SHADER);
    let fShader = createShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    gl.attachShader(program, vShader);
    gl.deleteShader(vShader);
    gl.attachShader(program, fShader);
    gl.deleteShader(fShader);
    gl.linkProgram(program);

    let log = gl.getProgramInfoLog(program);
    if (log) console.error(log);

    log = gl.getShaderInfoLog(vShader);
    if (log) console.error(log);

    log = gl.getShaderInfoLog(fShader);
    if (log) console.error(log);

    return program;
  }

  public static bindMatrix(
    gl: WebGL2RenderingContext,
    shader: WebGLProgram,
    varName: string,
    matrix: Float32Array,
  ) {
    const uniform = gl.getUniformLocation(shader, varName);
    gl.uniformMatrix4fv(uniform, false, matrix);
  }

  public static uploadBuffer(gl: WebGL2RenderingContext, buffer: WebGLBuffer, data: BufferSource) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  public static uploadElementBuffer(
    gl: WebGL2RenderingContext,
    buffer: WebGLBuffer,
    data: BufferSource,
  ) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  public static bindBuffer(gl: WebGL2RenderingContext, buffer: WebGLBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  }

  public static bindElementBuffer(gl: WebGL2RenderingContext, buffer: WebGLBuffer) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  }

  public static enableAttribute(
    gl: WebGL2RenderingContext,
    shader: WebGLShader,
    buffer: WebGLBuffer,
    attribute: string,
  ) {
    const tuple = attribute.split(':');
    const name = tuple[0];
    const type = tuple[1];
    let size = 0;
    const attributeLocation = gl.getAttribLocation(shader, name);

    switch (type) {
      case 'int':
      case 'uint':
      case 'float':
        size = 1;
        break;
      case 'uvec2':
      case 'ivec2':
      case 'vec2':
        size = 2;
        break;
      case 'uvec3':
      case 'ivec3':
      case 'vec3':
        size = 3;
        break;
      case 'uvec4':
      case 'ivec4':
      case 'vec4':
        size = 4;
        break;
      default:
        throw new Error(`unknown type ${type}`);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    switch (type) {
      case 'float':
      case 'vec2':
      case 'vec3':
      case 'vec4':
        gl.enableVertexAttribArray(attributeLocation);
        gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, false, 0, 0);
        break;
      case 'int':
      case 'ivec2':
      case 'ivec3':
      case 'ivec4':
        gl.enableVertexAttribArray(attributeLocation);
        gl.vertexAttribIPointer(attributeLocation, size, gl.INT, 0, 0);
        break;
      case 'uint':
      case 'uvec2':
      case 'uvec3':
      case 'uvec4':
        gl.enableVertexAttribArray(attributeLocation);
        gl.vertexAttribIPointer(attributeLocation, size, gl.UNSIGNED_INT, 0, 0);
        break;
      default:
        throw new Error(`unknown type ${type}`);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
