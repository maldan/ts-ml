export class Complex {
  public real: number = 0;
  public imag: number = 0;

  constructor(real: number = 0, imag: number = 0) {
    this.real = real;
    this.imag = imag;
  }

  public add(c: Complex): Complex {
    return new Complex(this.real + c.real, this.imag + c.imag);
  }

  public sub(c: Complex): Complex {
    return new Complex(this.real - c.real, this.imag - c.imag);
  }

  public mul(c: Complex): Complex {
    return new Complex(
      this.real * c.real - this.imag * c.imag,
      this.real * c.imag + this.imag * c.real,
    );
  }

  public conjugate(): Complex {
    return new Complex(this.real, -this.imag);
  }
}
