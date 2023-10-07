// language=GLSL
export const lineShaderText = `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
precision highp sampler2D;

layout (location = 0) in vec3 aVertex;
layout (location = 1) in uint aColor;

out vec4 vColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aVertex.xyz, 1.0);
    vColor.r = float(aColor >> 24) / 255.0;
    vColor.g = float(aColor >> 16 & uint(0xFF)) / 255.0;
    vColor.b = float(aColor >> 8 & uint(0xFF)) / 255.0;
    vColor.a = float(aColor & uint(0xFF)) / 255.0;

    vColor = vec4(
        vColor.r - gl_Position.z / 20.0,
        vColor.g - gl_Position.z / 20.0,
        vColor.b - gl_Position.z / 20.0,
        1.0
    );
}

// Fragment
#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

in vec4 vColor;
out vec4 color;

void main()
{
    color = vec4(vColor.rgb, 1.0);
}
`;
