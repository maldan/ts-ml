type ITypedArray = Float32Array | Uint8Array | Uint32Array | any[];

export class Slice {
  public static avg(l: number[]): number {
    const sum = l.reduce((a, b) => a + b, 0);
    return sum / l.length || 0;
  }

  public static sum(l: number[]): number {
    return l.reduce((a, b) => a + b, 0);
  }

  public static chunk<T extends ITypedArray>(array: ITypedArray, n: number): ITypedArray[] {
    if (array instanceof Array) {
      const result: ITypedArray[] = [];
      for (let i = 0; i < array.length; i += n) {
        result.push(array.slice(i, i + n));
      }
      return result;
    }

    const result: ITypedArray[] = [];
    for (let i = 0; i < array.length; i += n) {
      result.push(array.subarray(i, i + n));
    }
    return result;
  }
}
