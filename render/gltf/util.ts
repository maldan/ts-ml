import type { GLTF } from './index.js';

export function numberOfComponents(t: string): number {
  switch (t) {
    case 'SCALAR':
      return 1;
    case 'VEC2':
      return 2;
    case 'VEC3':
      return 3;
    case 'VEC4':
      return 4;
    case 'MAT2':
      return 4;
    case 'MAT3':
      return 9;
    case 'MAT4':
      return 16;
    default:
      return 0;
  }
}

const TYPE_INT8 = 5120;
const TYPE_UINT8 = 5121;
const TYPE_INT16 = 5122;
const TYPE_UINT16 = 5123;
const TYPE_UINT32 = 5125;
const TYPE_FLOAT = 5126;

export function byteLength(n: number): number {
  switch (n) {
    case 5120: // byte
      return 1;
    case 5121: // unsigned byte
      return 1;
    case 5122: // short
      return 2;
    case 5123: // unsigned short
      return 2;
    case 5125: // unsigned int
      return 4;
    case 5126: // float
      return 4;
  }
  return 0;
}

export function parseAccessor(gltf: GLTF, id: number) {
  let accessor = gltf.accessors[id];
  let finalView = gltf.bufferViews[accessor.bufferView];

  let componentAmount = numberOfComponents(accessor.type);
  let byteSize = byteLength(accessor.componentType);
  let offset = finalView.byteOffset;
  let buf = gltf.buffers[finalView.buffer].content;

  if (accessor.type == 'SCALAR') {
    if (accessor.componentType == TYPE_FLOAT) {
      let out = [];
      for (let i = 0; i < accessor.count; i++) {
        out.push(buf.getFloat32(offset, true));
        offset += byteSize * componentAmount;
      }
      return new Float32Array(out);
    } else {
      let out = [];
      for (let i = 0; i < accessor.count; i++) {
        if (byteSize == 2) out.push(buf.getUint16(offset, true));
        if (byteSize == 4) out.push(buf.getUint32(offset, true));
        offset += byteSize * componentAmount;
      }

      return new Uint32Array(out);
    }
  }
  if (accessor.type == 'VEC3') {
    let out = [];
    for (let i = 0; i < accessor.count; i++) {
      out.push(
        buf.getFloat32(offset, true),
        buf.getFloat32(offset + 4, true),
        buf.getFloat32(offset + 8, true),
      );
      offset += byteSize * componentAmount;
    }
    return new Float32Array(out);
  }
  if (accessor.type == 'VEC4') {
    // Unsigned bytes
    // console.log(accessor.componentType);
    if (accessor.componentType == TYPE_UINT16) {
      let out = [];
      for (let i = 0; i < accessor.count; i++) {
        out.push(
          buf.getUint16(offset + 3),
          buf.getUint16(offset + 2),
          buf.getUint16(offset + 1),
          buf.getUint16(offset),
        );
        offset += byteSize * componentAmount;
      }

      return new Uint16Array(out);
    } else if (accessor.componentType == TYPE_UINT8) {
      let out = [];
      for (let i = 0; i < accessor.count; i++) {
        out.push(
          buf.getUint8(offset + 3),
          buf.getUint8(offset + 2),
          buf.getUint8(offset + 1),
          buf.getUint8(offset),
        );
        offset += byteSize * componentAmount;
      }

      return new Uint32Array(new Uint8Array(out).buffer);
    } else {
      let out = [];
      for (let i = 0; i < accessor.count; i++) {
        out.push(
          buf.getFloat32(offset, true),
          buf.getFloat32(offset + 4, true),
          buf.getFloat32(offset + 8, true),
          buf.getFloat32(offset + 8 + 4, true),
        );
        offset += byteSize * componentAmount;
      }
      return new Float32Array(out);
    }
  }
  if (accessor.type == 'VEC2') {
    let out = [];
    for (let i = 0; i < accessor.count; i++) {
      out.push(buf.getFloat32(offset, true), buf.getFloat32(offset + 4, true));
      offset += byteSize * componentAmount;
    }
    return new Float32Array(out);
  }
  if (accessor.type == 'MAT4') {
    let out = [];
    for (let i = 0; i < accessor.count; i++) {
      for (let j = 0; j < 16 * 4; j += 4) {
        out.push(buf.getFloat32(offset + j, true));
      }
      offset += byteSize * componentAmount;
    }
    return new Float32Array(out);
  }

  return null;
}
