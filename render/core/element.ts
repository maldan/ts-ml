import { RenderUtil } from './util';

export class RenderElement {
  public shaderMap: Record<string, WebGLProgram> = {};
  public bufferMap: Record<string, WebGLBuffer> = {};
  public textureMap: Record<string, WebGLTexture> = {};
  public gl: WebGL2RenderingContext;
  public currentShaderName: string = '';

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  public createBuffer(...names: string[]) {
    names.forEach((name) => {
      this.bufferMap[name] = this.gl.createBuffer() as WebGLBuffer;
    });
  }

  public createTexture(...names: string[]) {
    names.forEach((name) => {
      this.textureMap[name] = this.gl.createTexture() as WebGLTexture;
    });
  }

  public uploadBuffer(name: string, data: BufferSource) {
    if (!this.bufferMap[name]) throw new Error(`Buffer "${name}" not found`);
    RenderUtil.uploadBuffer(this.gl, this.bufferMap[name], data);
  }

  public uploadElementBuffer(name: string, data: BufferSource) {
    if (!this.bufferMap[name]) throw new Error(`Buffer "${name}" not found`);
    RenderUtil.uploadElementBuffer(this.gl, this.bufferMap[name], data);
  }

  public enableAttribute(bufferName: string, attribute: string) {
    RenderUtil.enableAttribute(
      this.gl,
      this.getShader(this.currentShaderName),
      this.getBuffer(bufferName),
      attribute,
    );
  }

  public drawElements(size: number) {
    this.gl.drawElements(this.gl.TRIANGLES, size, this.gl.UNSIGNED_INT, 0);
  }

  public getBuffer(name: string): WebGLBuffer {
    if (!this.bufferMap[name]) throw new Error(`Buffer "${name}" not found`);
    return this.bufferMap[name];
  }

  public getShader(name: string): WebGLProgram {
    if (!this.shaderMap[name]) throw new Error(`Shader "${name}" not found`);
    return this.shaderMap[name];
  }

  public getTexture(name: string): WebGLTexture {
    if (!this.textureMap[name]) throw new Error(`Texture "${name}" not found`);
    return this.textureMap[name];
  }

  public bindBuffer(name: string) {
    RenderUtil.bindBuffer(this.gl, this.getBuffer(name));
  }

  public bindElementBuffer(name: string) {
    RenderUtil.bindElementBuffer(this.gl, this.getBuffer(name));
  }

  public bindMatrix(varName: string, data: Float32Array) {
    RenderUtil.bindMatrix(this.gl, this.getShader(this.currentShaderName), varName, data);
  }

  public uploadImageInTexture(name: string, image: HTMLImageElement) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.getTexture(name));

    // Default
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      2,
      2,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 255, 255]),
    );

    if (image) {
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, this.getTexture(name));
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Unbind
        gl.bindTexture(gl.TEXTURE_2D, null);
      };
    }

    // Set default filtration
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Unbind
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
