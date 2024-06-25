precision highp float;

varying vec3 v_normal;
varying vec3 v_tangent;
varying vec2 v_texcoord;
varying vec4 v_color;

varying vec3 v_surfaceToView;
varying vec3 v_surfaceToLight;

uniform vec3 diffuse;
uniform sampler2D diffuseMap;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform sampler2D specularMap;
uniform float shininess;
uniform sampler2D normalMap;
uniform float opacity;
uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;

uniform bool u_useDirectionalIllumination;
uniform bool u_useNormalMap;
uniform bool u_useSpecularMap;

uniform vec3 u_lightColor;

void main() {

      vec3 normal = normalize(v_normal);

      if(u_useNormalMap) {
            vec3 tangent = normalize(v_tangent);
            vec3 bitangent = normalize(cross(normal, tangent));
            mat3 tbn = mat3(tangent, bitangent, normal);
            normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;
            normal = normalize(tbn * normal);
      }

      float light;
      float specularLight;

      if(u_useDirectionalIllumination) {
            light = dot(normal, u_lightDirection) * .5 + .5;

            vec3 surfaceToViewDirection = normalize(v_surfaceToView);
            vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);

            specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);
      } else {
            vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
            vec3 surfaceToViewDirection = normalize(v_surfaceToView);

            vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
            specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);
            light = dot(normal, surfaceToLightDirection);
      }

      vec3 effectiveSpecular;

      if(u_useSpecularMap) {
            vec4 specularMapColor = texture2D(specularMap, v_texcoord);
            effectiveSpecular = specular * specularMapColor.rgb;
      } else {
            effectiveSpecular = specular;
      }

      vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);
      vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;
      float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;

      if(effectiveOpacity < 0.3){
            discard;
      }

      gl_FragColor = vec4(emissive +
            ambient * u_ambientLight +
            effectiveDiffuse * light * u_lightColor +
            effectiveSpecular * pow(specularLight, shininess), effectiveOpacity);
}