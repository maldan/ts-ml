import { Bone } from './bone';
import { GLTF_Skin } from '../gltf/skin';
import { Matrix4x4, Quaternion, Vector3 } from '../../math/linear_algebra';

export class Skeleton {
  public boneHierarchy: Bone[] = [];
  public boneList: Bone[] = [];
  public boneNameMap: Record<string, Bone> = {};

  constructor() {}

  public set(skin: GLTF_Skin): Skeleton {
    const fillBoneRecursive = (bone: Bone, map: any) => {
      for (let i = 0; i < bone.childrenId.length; i++) {
        const child = map[bone.childrenId[i]];
        bone.children.push(child);
        fillBoneRecursive(child, map);
      }
    };

    // Fill bones
    const boneMap: Record<number, Bone> = {};
    for (let i = 0; i < skin.bones.length; i++) {
      boneMap[skin.bones[i].id] = new Bone(skin.bones[i]);
      this.boneList.push(boneMap[skin.bones[i].id]);
      this.boneNameMap[skin.bones[i].name] = boneMap[skin.bones[i].id];
    }
    const rootBone = boneMap[skin.bones[0].id];
    fillBoneRecursive(rootBone, boneMap);
    this.boneHierarchy.push(rootBone);

    return this;
  }

  public setBonePosition(name: string, position: Vector3) {
    if (!this.boneNameMap[name] || !position) return;
    this.boneNameMap[name].position = position;
  }

  public setBoneRotation(name: string, rotation: Quaternion) {
    if (!this.boneNameMap[name] || !rotation) return;
    this.boneNameMap[name].rotation = rotation;
  }

  public update() {
    // Calculate bones with hierarchy
    for (let i = 0; i < this.boneHierarchy.length; i++) {
      this.boneHierarchy[i].update(new Matrix4x4().identity());
    }
  }
}
