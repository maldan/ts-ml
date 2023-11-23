import { Bone } from './bone';
import { GLTF_Skin } from '../gltf/skin';
import { Matrix4x4, Quaternion, Vector3 } from '../../math/linear_algebra';

export class Skeleton {
  public boneHierarchy: Bone[] = [];
  public boneList: Bone[] = [];
  public boneNameMap: Record<string, Bone> = {};
  public groupId: string = '';
  public position: Vector3 = Vector3.zero;
  public rotation: Quaternion = Quaternion.identity;

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

  public getBoneByName(name: string): Bone | undefined {
    return this.boneNameMap[name];
  }

  public update() {
    let mx = Matrix4x4.identity;
    mx.translate_(this.position);
    mx.rotateQuaternion_(this.rotation);

    // Calculate bones with hierarchy
    for (let i = 0; i < this.boneHierarchy.length; i++) {
      this.boneHierarchy[i].update(mx);
    }
  }

  public renameBones(map: Record<string, string>) {
    this.boneList.forEach((bone) => {
      if (map[bone.name]) {
        // Delete old key
        delete this.boneNameMap[bone.name];
        bone.name = map[bone.name];
        // Set new
        this.boneNameMap[bone.name] = bone;
      }
    });
  }

  public difference(target: Skeleton) {
    const position: Record<string, Vector3> = {};
    const rotation: Record<string, Quaternion> = {};
    this.boneList.forEach((bone) => {
      const bone2 = target.getBoneByName(bone.name);
      if (bone2) {
        position[bone.name] = bone.position.sub(bone2.position);
        rotation[bone.name] = Quaternion.difference(bone2.rotation, bone.rotation);
      }
    });

    return { position, rotation };
  }
}
