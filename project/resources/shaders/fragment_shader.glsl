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

      // If the normal map is enabled, we need to compute the normal from the normal map
      if(u_useNormalMap) {
            vec3 tangent = normalize(v_tangent); 
            vec3 bitangent = normalize(cross(normal, tangent)); // compute the bitangent from the normal and tangent
            mat3 tbn = mat3(tangent, bitangent, normal); // create the TBN matrix
            normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.; // get the normal from the normal map
            normal = normalize(tbn * normal);
      }

      float light; // define the light
      float specularLight; // define the specular light

      // If directional illumination is enabled, we need to compute the light and specular light from the light direction
      if(u_useDirectionalIllumination) {
            light = dot(normal, u_lightDirection) * .5 + .5; // compute the light 

            vec3 surfaceToViewDirection = normalize(v_surfaceToView); // compute the surface to view direction
            vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection); // compute the half vector. That is the vector between the light direction and the view direction

            specularLight = clamp(dot(normal, halfVector), 0.0, 1.0); // compute the specular light clamping it between 0 and 1
      } else {
            vec3 surfaceToLightDirection = normalize(v_surfaceToLight); // compute the surface to light direction
            vec3 surfaceToViewDirection = normalize(v_surfaceToView); // compute the surface to view direction

            vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection); // compute the half vector. That is the vector between the light direction and the view direction
            specularLight = clamp(dot(normal, halfVector), 0.0, 1.0); // compute the specular light clamping it between 0 and 1
            light = dot(normal, surfaceToLightDirection); // compute the light
      }

      vec3 effectiveSpecular; // define the effective specular

      // If the specular map is enabled, we need to compute the effective specular from the specular map
      if(u_useSpecularMap) {
            vec4 specularMapColor = texture2D(specularMap, v_texcoord); // get the specular map color
            effectiveSpecular = specular * specularMapColor.rgb; // compute the effective specular
      } else {
            effectiveSpecular = specular; // set the effective specular to the specular
      }

      vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord); // get the diffuse map color
      vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb; // compute the effective diffuse
      float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a; // compute the effective opacity

      // If the effective opacity is less than 0.3, we discard the fragment
      if(effectiveOpacity < 0.3){
            discard;
      }

      // Set the fragment color to sum of the emissive, ambient, effective diffuse, effective specular, and the light and specular light
      gl_FragColor = vec4(
            emissive +
            ambient * u_ambientLight +
            effectiveDiffuse * light * u_lightColor +
            effectiveSpecular * pow(specularLight, shininess), effectiveOpacity);
}