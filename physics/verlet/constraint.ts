import { Vector3 } from '../../math/linear_algebra';
import { VerletPoint } from './point';

export interface IConstrain {
  from: VerletPoint;
  to: VerletPoint;
  debug: {
    isDraw: boolean;
  };
  apply();
}

export class DistanceConstraint {
  public from: VerletPoint;
  public to: VerletPoint;
  public length: number;
  public debug = {
    isDraw: true,
  };

  constructor(from: VerletPoint, to: VerletPoint, length: number = 0) {
    this.from = from;
    this.to = to;
    if (length <= 0) {
      length = Vector3.distance(from.position, to.position);
    }
    this.length = length;
  }

  public apply() {
    let deltaPosition = this.to.position.sub(this.from.position);
    let distance = Vector3.distance(this.from.position, this.to.position);
    let difference = this.length - distance;
    let percent = 0;

    if (this.from.isStatic || this.to.isStatic) {
      percent = difference / distance;
    } else {
      percent = difference / distance / 2;
    }

    let offset = deltaPosition.scale(percent);

    if (!this.from.isStatic) this.from.position.sub_(offset);
    if (!this.to.isStatic) this.to.position.add_(offset);
  }
}

export class SoftDistanceConstraint {
  public from: VerletPoint;
  public to: VerletPoint;
  public length: number;
  public stiffness: number; // Коэффициент жесткости
  public debug = {
    isDraw: true,
  };

  constructor(from: VerletPoint, to: VerletPoint, length: number = 0, stiffness: number = 0.5) {
    this.from = from;
    this.to = to;
    if (length <= 0) {
      length = Vector3.distance(from.position, to.position);
    }
    this.length = length;
    this.stiffness = stiffness; // Устанавливаем коэффициент жесткости
  }

  public apply() {
    let deltaPosition = this.to.position.sub(this.from.position);
    let distance = Vector3.distance(this.from.position, this.to.position);
    let difference = this.length - distance;
    let percent = 0;

    if (this.from.isStatic || this.to.isStatic) {
      percent = difference / distance;
    } else {
      percent = difference / distance / 2;
    }

    // Изменяем положение точек с учетом коэффициента жесткости
    let offset = deltaPosition.scale(percent * this.stiffness);

    if (!this.from.isStatic) this.from.position.sub_(offset);
    if (!this.to.isStatic) this.to.position.add_(offset);
  }
}

export class SpringConstraint {
  public from: VerletPoint;
  public to: VerletPoint;
  public length: number;
  // public restLength: number;
  public stiffness: number;
  public debug = {
    isDraw: true,
  };

  constructor(from: VerletPoint, to: VerletPoint, restLength: number = 0, stiffness: number = 1.0) {
    this.from = from;
    this.to = to;
    // this.restLength = restLength;
    this.length = Vector3.distance(from.position, to.position);
    this.stiffness = stiffness;
  }

  public apply() {
    let deltaPosition = this.to.position.sub(this.from.position);
    let currentLength = Vector3.distance(this.from.position, this.to.position);
    let displacement = currentLength - this.length;
    let force = deltaPosition.normalize().scale(displacement * this.stiffness);

    if (!this.from.isStatic) this.from.position.add_(force);
    if (!this.to.isStatic) this.to.position.sub_(force);
  }
}
