export class MMath {
  public static degToRad(d: number): number {
    return d * (Math.PI / 180.0);
  }

  public static radToDeg(r: number): number {
    return r * (180.0 / Math.PI);
  }

  public static lerp(start: number, end: number, t: number): number {
    return (1 - t) * start + t * end;
  }

  public static remap(value: number, fromRangeStart: number, fromRangeEnd: number, toRangeStart: number, toRangeEnd: number) {
    return ((value - fromRangeStart) * (toRangeEnd - toRangeStart)) / (fromRangeEnd - fromRangeStart) + toRangeStart;
  }
}
// export { Complex } from './complex';
