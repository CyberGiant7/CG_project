attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec3 a_tangent;
attribute vec2 a_texcoord;
attribute vec4 a_color;

uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

varying vec3 v_normal;
varying vec3 v_tangent;
varying vec2 v_texcoord;
varying vec4 v_color;

varying vec3 v_surfaceToView;
varying vec3 v_surfaceToLight;

void main() {
  vec4 worldPosition = u_world * a_position; // compute the world position of the vertex
  gl_Position = u_projection * u_view * worldPosition; // compute the clip space position of the vertex

  mat3 normalMat = mat3(u_world); // compute the normal matrix
  v_normal = normalize(normalMat * a_normal); // compute the normal in world space
  v_tangent = normalize(normalMat * a_tangent); // compute the tangent in world space

  v_texcoord = a_texcoord; // pass the texture coordinates to the fragment shader
  v_color = a_color; // pass the color to the fragment shader

  // compute the world position of the surface
  vec3 surfaceWorldPosition = (u_world * a_position).xyz; 

  // compute the vector of the surface to the light and pass it to the fragment shader
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

  // compute the vector of the surface to the view/camera and pass it to the fragment shader
  v_surfaceToView = normalize(u_viewWorldPosition - surfaceWorldPosition);

}