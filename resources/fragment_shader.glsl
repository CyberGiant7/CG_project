// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

// Passed in from the vertex shader.
varying vec4 v_color;

uniform vec4 u_colorMult;
 
void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting
  gl_FragColor = v_color * u_colorMult;
}