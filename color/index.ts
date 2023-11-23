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

  public static fromNumber(rgba: number): RGB8 {
    let r = (rgba >> 16) & 0xff;
    let g = (rgba >> 8) & 0xff;
    let b = rgba & 0xff;
    return new RGB8(r, g, b);
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

  public static fromNumber(rgba: number): RGBA8 {
    let r = (rgba >> 24) & 0xff;
    let g = (rgba >> 16) & 0xff;
    let b = (rgba >> 8) & 0xff;
    let a = rgba & 0xff;
    return new RGBA8(r, g, b, a);
  }

  public get isWhite() {
    return this.r === 255 && this.g === 255 && this.b === 255;
  }

  public get isBlack() {
    return this.r === 0 && this.g === 0 && this.b === 0;
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

  public static get black() {
    return new RGBA8(0, 0, 0, 255);
  }

  public clone(): RGBA8 {
    return new RGBA8(this.r, this.g, this.b, this.a);
  }

  public static listFromArray(arr: Float32Array | number[]): RGBA8[] {
    let out: RGBA8[] = [];
    for (let i = 0; i < arr.length; i += 4) {
      out.push(new RGBA8(arr[i], arr[i + 1], arr[i + 2], arr[i + 3]));
    }
    return out;
  }
}
