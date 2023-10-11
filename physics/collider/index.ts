import { Vector3 } from '../../math/linear_algebra';
import { Ray } from '../../math/geometry';

import { BaseCollider } from './base';

export interface IColliderEvent {
  ray: Ray;
  collider: BaseCollider;
  point?: Vector3;
}

export { BoxCollider } from './box';
export { SphereCollider } from './sphere';
