import { RenderElement } from './element';
import { RenderUtil } from './util';

export class RenderLayer extends RenderElement {
  public async createShaderFromURL(name: string, url: string) {
    const loadText = await (await fetch(`./shader/${name}.glsl?r=${Math.random()}`)).text();

    // Upload shaders
    this.shaderMap[name] = RenderUtil.createShader(this.gl, loadText);
  }

  public createShader(name: string, text: string) {
    // Upload shaders
    this.shaderMap[name] = RenderUtil.createShader(this.gl, text);
  }

  public useShader(name: string) {
    if (!this.shaderMap[name]) throw new Error(`Shader "${name}" not found`);
    this.gl.useProgram(this.shaderMap[name]);
    this.currentShaderName = name;
  }
}
