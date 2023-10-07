import { RenderUtil } from './util';

type ITextureOptions = {
  filtration: string;
  wrap: string;
  type: string;
  width: number;
  height: number;

  // Non set
  internalFormat: number;
  srcFormat: number;
  srcType: number;
};

type IDataOptions = {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export class RenderElement {
  public shaderMap: Record<string, WebGLProgram> = {};
  public bufferMap: Record<string, WebGLBuffer> = {};
  public textureMap: Record<string, WebGLTexture> = {};
  public textureOptions: Record<string, ITextureOptions> = {};
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

  public createTexture(name: string, options: Partial<ITextureOptions>) {
    const gl = this.gl;
    this.textureMap[name] = this.gl.createTexture() as WebGLTexture;

    if (!options) {
      options = {
        filtration: 'linear',
        wrap: 'clamp',
        type: 'rgba8',
        width: 1,
        height: 1,
      };
    }

    let internalFormat = gl.R32F;
    let srcFormat = gl.RED;
    let srcType = gl.FLOAT;
    let pixel: ArrayBufferView = new Uint8Array();
    options.width = options.width || 1;
    options.height = options.height || 1;
    options.type = options.type || 'rgba8';
    options.filtration = options.filtration || 'linear';
    options.wrap = options.wrap || 'clamp';

    switch (options.type) {
      case 'r32f':
        internalFormat = gl.R32F;
        srcFormat = gl.RED;
        srcType = gl.FLOAT;
        pixel = new Float32Array(options.width * options.height);
        break;
      case 'rgba32f':
        internalFormat = gl.RGBA32F;
        srcFormat = gl.RGBA;
        srcType = gl.FLOAT;
        pixel = new Float32Array(options.width * options.height * 4);
        break;
      case 'r32ui':
        internalFormat = gl.R32UI;
        srcFormat = gl.RED_INTEGER;
        srcType = gl.UNSIGNED_INT;
        pixel = new Uint32Array(options.width * options.height);
        break;
      case 'rgba8':
        internalFormat = gl.RGBA;
        srcFormat = gl.RGBA;
        srcType = gl.UNSIGNED_BYTE;
        pixel = new Uint8Array(options.width * options.height * 4);
        // @ts-ignore
        pixel[0] = 128;
        // @ts-ignore
        pixel[1] = 128;
        // @ts-ignore
        pixel[2] = 255;
        // @ts-ignore
        pixel[3] = 255;

        break;
      default:
        throw new Error(`Unknown texture type`);
    }

    // Init base texture
    gl.bindTexture(gl.TEXTURE_2D, this.getTexture(name));
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      options.width,
      options.height,
      0,
      srcFormat,
      srcType,
      pixel,
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Set filtration
    this.setTextureFiltration(name, options.filtration);
    this.setTextureWrap(name, options.wrap);

    // Save options
    options.internalFormat = internalFormat;
    options.srcFormat = srcFormat;
    options.srcType = srcType;
    this.textureOptions[name] = options as ITextureOptions;
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

  public getTextureOptions(name: string): ITextureOptions {
    if (!this.textureOptions[name]) throw new Error(`Texture options "${name}" not found`);
    return this.textureOptions[name];
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
    /*gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      2,
      2,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 255, 255]),
    );*/

    if (image) {
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, this.getTexture(name));
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.bindTexture(gl.TEXTURE_2D, null);
      };
    }

    // Set default filtration
    /*gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);*/

    // Unbind
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  public updateTexture(name: string, data: ArrayBufferView, area?: any) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.getTexture(name));

    const options = this.getTextureOptions(name);
    const srcFormat = options.srcFormat;
    const srcType = options.srcType;

    // Area
    let x = 0;
    let y = 0;
    let width = options.width;
    let height = options.height;

    if (area) {
      x = area.x;
      y = area.y;
      width = area.width;
      height = area.height;
    }

    // Default
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0, // level
      x, // x offset
      y, // y offset
      width, // width
      height, // height
      srcFormat,
      srcType,
      data,
    );

    // Unbind
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  public setTextureFiltration(name: string, type: string) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.getTexture(name));

    if (type === 'nearest') {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
    if (type === 'linear') {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    // Unbind
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  public setTextureWrap(name: string, type: string) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.getTexture(name));

    if (type === 'clamp') {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    if (type === 'repeat') {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }
    if (type === 'mirror') {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    }

    // Unbind
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  public bindTexture(name: string) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.getTexture(name));
  }

  public activateTexture(name: string, slot: number) {
    const gl = this.gl;

    gl.activeTexture(gl.TEXTURE0 + slot);
    this.bindTexture(name);
    gl.uniform1i(gl.getUniformLocation(this.getShader(this.currentShaderName), name), slot);
  }
}
