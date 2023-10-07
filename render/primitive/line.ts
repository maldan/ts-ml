import { Vector3 } from '../../math/linear_algebra';

export class Line {
  public from: Vector3;
  public to: Vector3;
  public fromColor: number;
  public toColor: number;

  constructor(from: Vector3, to: Vector3, fromColor?: number, toColor?: number) {
    this.from = from;
    this.to = to;
    this.fromColor = fromColor ?? 0xffffffff;
    this.toColor = toColor ?? this.fromColor;
  }
}
