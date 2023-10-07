// language=GLSL
export const skinnedMeshShaderText = `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
precision highp sampler2D;

in vec3 aPosition;
in vec3 aTangent;
in vec3 aBiTangent;
in vec3 aNormal;
in vec2 aUV;
in vec4 aBoneWeight;
in uint aBoneIndex;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform sampler2D uBone;

out vec3 vPosition;
out mat3 vTBN;
out vec2 vUV;

ivec2 getObjectTexelById(uint id, int ch) {
    int pixel = (int(id)*10+ch);
    return ivec2(pixel % 512, pixel / 512);
}

ivec2 getBoneTexelById(uint id, int ch) {
    int pixel = (int(id)*16+ch);
    return ivec2(pixel % 64, pixel / 64);
}

uvec4 unpackIndex(uint id) {
    uint r = uint((id >> 24u) & 0xFFu);
    uint g = uint((id >> 16u) & 0xFFu);
    uint b = uint((id >> 8u) & 0xFFu);
    uint a = uint(id & 0xFFu);
    return uvec4(r, g, b, a);
}

mat4 getInverseBindMatrix(uint id) {
    vec4 m1 = texelFetch(uBone, getBoneTexelById(id, 0), 0);
    vec4 m2 = texelFetch(uBone, getBoneTexelById(id, 1), 0);
    vec4 m3 = texelFetch(uBone, getBoneTexelById(id, 2), 0);
  
    vec4 m5 = texelFetch(uBone, getBoneTexelById(id, 4), 0);
    vec4 m6 = texelFetch(uBone, getBoneTexelById(id, 5), 0);
    vec4 m7 = texelFetch(uBone, getBoneTexelById(id, 6), 0);
  
    vec4 m9 = texelFetch(uBone, getBoneTexelById(id, 8), 0);
    vec4 m10 = texelFetch(uBone, getBoneTexelById(id, 9), 0);
    vec4 m11 = texelFetch(uBone, getBoneTexelById(id, 10), 0);
  
    vec4 m13 = texelFetch(uBone, getBoneTexelById(id, 12), 0);
    vec4 m14 = texelFetch(uBone, getBoneTexelById(id, 13), 0);
    vec4 m15 = texelFetch(uBone, getBoneTexelById(id, 14), 0);
  
    return mat4(
        m1.r, m2.r, m3.r, 0.0,
        m5.r, m6.r, m7.r, 0.0,
        m9.r, m10.r, m11.r, 0.0,
        m13.r, m14.r, m15.r, 1.0
    );
}

mat4 identity() {
    return mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    );
}

void main() {
    // Apply bone matrix
    uvec4 boneIndex = unpackIndex(aBoneIndex);
    mat4 bone1Matrix = getInverseBindMatrix(boneIndex.r);
    mat4 bone2Matrix = getInverseBindMatrix(boneIndex.g);
    mat4 bone3Matrix = getInverseBindMatrix(boneIndex.b);
    mat4 bone4Matrix = getInverseBindMatrix(boneIndex.a);
    
    // Make skin matrix
    mat4 skinMatrix = aBoneWeight.r * bone1Matrix +
    aBoneWeight.g * bone2Matrix +
    aBoneWeight.b * bone3Matrix +
    aBoneWeight.a * bone4Matrix;
    
    gl_Position = uProjectionMatrix * uViewMatrix * skinMatrix * vec4(aPosition.xyz, 1.0);
    vPosition = (vec4(aPosition.xyz, 1.0) * skinMatrix).xyz;
    vUV = aUV;
    
    // TBN Matrix
    mat4 modelMatrix = skinMatrix;
    vec3 T = normalize(vec3(modelMatrix * vec4(aTangent,   1.0)));
    vec3 B = normalize(vec3(modelMatrix * vec4(aBiTangent, 1.0)));
    vec3 N = normalize(vec3(modelMatrix * vec4(aNormal,    1.0)));
    vTBN = mat3(T, B, N);
}

// Fragment
#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
precision highp sampler2D;

in vec3 vPosition;
in vec2 vUV;
in mat3 vTBN;

out vec4 color;

uniform sampler2D uBone;
uniform sampler2D uTextureColor;
uniform sampler2D uTextureNormal;

void main()
{
    // if (int(gl_FragCoord.y) % 2 == 0) discard;
    
    // Считываем нормали из normal map
    vec3 normal = texture(uTextureNormal, vUV).xyz * 2.0 - 1.0;
    normal = normalize(vTBN * normal);
    
    // Const
    vec3 vLightDirection = normalize(vec3(0.0, 1.0, 1.0));
    vec3 vAmbientColor = vec3(0.3, 0.3, 0.3);
    vec3 directionalLightColor = vec3(1.0, 1.0, 1.0);
    
    // Light
    float lightDot = dot(normalize(normal.xyz), normalize(vLightDirection));
    float lightPower = max(lightDot, 0.0);
    if (lightDot < 0.0) {
        vAmbientColor = mix(vAmbientColor, vec3(0.0, 0.0, 0.0), -lightDot);
    }
    
    vec4 texelColor = texture(uTextureColor, vUV);
    vec3 lighting = vAmbientColor + (directionalLightColor * lightPower);
    color = vec4(texelColor.rgb * lighting.rgb, 1.0);
}
`;

// language=GLSL
export const staticMeshShaderText = `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
precision highp sampler2D;

in vec3 aPosition;
in vec3 aTangent;
in vec3 aBiTangent;
in vec3 aNormal;
in vec2 aUV;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

out vec3 vPosition;
out mat3 vTBN;
out vec2 vUV;

mat4 identity() {
   return mat4(
       1.0, 0.0, 0.0, 0.0,
       0.0, 1.0, 0.0, 0.0,
       0.0, 0.0, 1.0, 0.0,
       0.0, 0.0, 0.0, 1.0
   );
}

void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition.xyz, 1.0);
    vPosition = (vec4(aPosition.xyz, 1.0)).xyz;
    vUV = aUV;
    
    // TBN Matrix
    mat4 modelMatrix = identity();
    vec3 T = normalize(vec3(modelMatrix * vec4(aTangent,   1.0)));
    vec3 B = normalize(vec3(modelMatrix * vec4(aBiTangent, 1.0)));
    vec3 N = normalize(vec3(modelMatrix * vec4(aNormal,    1.0)));
    vTBN = mat3(T, B, N);
}

// Fragment
#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
precision highp sampler2D;

in vec3 vPosition;
in vec2 vUV;
in mat3 vTBN;

out vec4 color;
                                     
uniform sampler2D uTextureColor;
uniform sampler2D uTextureNormal;

void main()
{
    // if (int(gl_FragCoord.y) % 2 == 0) discard;
    
    // Считываем нормали из normal map
    vec3 normal = texture(uTextureNormal, vUV).xyz * 2.0 - 1.0;
    normal = normalize(vTBN * normal);
    
    // Const
    vec3 vLightDirection = normalize(vec3(0.0, 1.0, 1.0));
    vec3 vAmbientColor = vec3(0.3, 0.3, 0.3);
    vec3 directionalLightColor = vec3(1.0, 1.0, 1.0);
    
    // Light
    float lightDot = dot(normalize(normal.xyz), normalize(vLightDirection));
    float lightPower = max(lightDot, 0.0);
    if (lightDot < 0.0) {
        vAmbientColor = mix(vAmbientColor, vec3(0.0, 0.0, 0.0), -lightDot);
    }
    
    vec4 texelColor = texture(uTextureColor, vUV);
    vec3 lighting = vAmbientColor + (directionalLightColor * lightPower);
    color = vec4(texelColor.rgb * lighting.rgb, 1.0);
}
`;
