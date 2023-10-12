export class RGB8 {
  public r: number;
  public g: number;
  public b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public toNumber() {
    return (this.r << 16) | (this.g << 8) | this.b;
  }

  public static get red() {
    return new RGB8(255, 0, 0);
  }

  public static get green() {
    return new RGB8(0, 255, 0);
  }

  public static get blue() {
    return new RGB8(0, 0, 255);
  }
}

export class RGBA8 {
  public r: number;
  public g: number;
  public b: number;
  public a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public toNumber() {
    return (this.r << 24) | (this.g << 16) | (this.b << 8) | this.a;
  }

  public static get white() {
    return new RGBA8(255, 255, 255, 255);
  }

  public static get red() {
    return new RGBA8(255, 0, 0, 255);
  }

  public static get green() {
    return new RGBA8(0, 255, 0, 255);
  }

  public static get blue() {
    return new RGBA8(0, 0, 255, 255);
  }

  public static listFromArray(arr: Float32Array | number[]): RGBA8[] {
    let out: RGBA8[] = [];
    for (let i = 0; i < arr.length; i += 4) {
      out.push(new RGBA8(arr[i], arr[i + 1], arr[i + 2], arr[i + 3]));
    }
    return out;
  }
}
