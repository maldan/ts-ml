import { RenderLayer } from '../../layer';

export class StaticMeshLayer extends RenderLayer {
  constructor(gl: WebGL2RenderingContext) {
    super(gl);
  }
}
