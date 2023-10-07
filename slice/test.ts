import { assertEquals } from 'https://deno.land/std@0.202.0/assert/mod.ts';
import { Slice } from './index.ts';

Deno.test('url test', () => {
  const url = new URL('./foo.js', 'https://deno.land/');
  assertEquals(url.href, 'https://deno.land/foo.js');
});

Deno.test('slice test', () => {
  let arr = [1, 2, 3];
  console.log(Slice.chunk(arr, 1));
  let arr2 = new Float32Array([1, 2, 3]);
  console.log(Slice.chunk(arr2, 1));
});
