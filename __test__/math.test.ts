import { Matrix4x4, Quaternion, Vector3 } from '../math/linear_algebra';

test('vec3', () => {
  const v = new Vector3();
  expect(v).toBeTruthy();
  console.log(v);
});

test('quaternion', () => {
  const x = 45;
  const y = 45;
  const z = 45;

  const q = Quaternion.fromEulerXYZ(x, y, z, 'deg');
  const deg = q.toEuler().toDeg();
  expect(Math.abs(deg.x - x)).toBeLessThan(0.001);
  expect(Math.abs(deg.y - y)).toBeLessThan(0.001);
  expect(Math.abs(deg.z - z)).toBeLessThan(0.001);
});

test('quaternion mul', () => {
  let q1 = Quaternion.fromEulerXYZ(10, 0, 0, 'deg');
  let q2 = Quaternion.fromEulerXYZ(10, 0, 0, 'deg');
  expect(q1.mul(q2).toEuler().toDeg().x).toBe(20);

  q1 = Quaternion.fromEulerXYZ(10, 0, 0, 'deg');
  q2 = Quaternion.fromEulerXYZ(-10, 0, 0, 'deg');
  expect(q1.mul(q2).toEuler().toDeg().x).toBe(0);
  expect(q2.mul(q1).toEuler().toDeg().x).toBe(0);

  q1 = Quaternion.fromEulerXYZ(Math.PI, 0, 0, 'rad');
  expect(q1.toEuler().toDeg().x).toBe(180);
});

test('quaternion direction', () => {
  let q = Quaternion.fromDirection(new Vector3(1, 0, -1));
  console.log(q.toEuler().toDeg());
});

test('matrix', () => {
  let mx = Matrix4x4.identity();
  mx = mx.targetTo(Vector3.zero, Vector3.up, Vector3.up);
  console.log(mx.getPosition(), mx.getRotation(), mx.getScale());
  console.log(mx.toString());
});
