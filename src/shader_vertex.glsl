
attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform float given_point_size;

varying vec4 vColor;

uniform vec2 u_resolution;

void main(void) {

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

    vColor = aVertexColor;

    // gl_PointSize = 0.8;  // minute
    // gl_PointSize = 50.0;    // OK for 2X2
    // gl_PointSize = 20.0;
    // gl_PointSize = 3.0;
    gl_PointSize = given_point_size;     // OK for board size 400
    // gl_PointSize = 0.50;     // OK for board size 400

}
