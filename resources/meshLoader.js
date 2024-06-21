import { create1PixelTexture, createTexture } from "./textureUtils.js";
import { parseOBJ, parseMTL } from "./parsers.js";
import { generateTangents } from "./mathUtils.js";

async function loadMeshAndMaterials(gl, sourceMesh, sourceMTL) {
  const objText = await fetch(sourceMesh).then((response) => response.text());
  const obj = parseOBJ(objText);

  const baseHref = new URL(sourceMesh, window.location.href);
  const mtlTexts = await Promise.all(
    obj.materialLibs.map(async (filename) => {
      const mtlHref = new URL(filename, baseHref).href;
      const response = await fetch(mtlHref);
      return await response.text();
    })
  );
  const materials = parseMTL(mtlTexts.join("\n"));

  const textures = {
    defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
    defaultNormal: create1PixelTexture(gl, [127, 127, 255, 0]),
  };

  // load texture for materials
  for (const material of Object.values(materials)) {
    Object.entries(material)
      .filter(([key]) => key.endsWith("Map"))
      .forEach(([key, filename]) => {
        let texture = textures[filename];
        if (!texture) {
          const textureHref = new URL(filename, baseHref).href;
          texture = createTexture(gl, textureHref);
          textures[filename] = texture;
        }
        material[key] = texture;
      });
  }

  // hack the materials so we can see the specular map
  // Object.values(materials).forEach((m) => {
  //   m.shininess = 25;
  //   m.specular = [3, 2, 1];
  // });

  const defaultMaterial = {
    diffuse: [1, 1, 1],
    diffuseMap: textures.defaultWhite,
    normalMap: textures.defaultNormal,
    ambient: [0, 0, 0],
    specular: [1, 1, 1],
    specularMap: textures.defaultWhite,
    shininess: 400,
    opacity: 1,
  };

  return obj.geometries.map(({ material, data }) => {
    if (data.color) {
      if (data.position.length === data.color.length) {
        // it's 3. The our helper library assumes 4 so we need
        // to tell it there are only 3.
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      // there are no vertex colors so just use constant white
      data.color = { value: [1, 1, 1, 1] };
    }
    // generate tangents if we have the data to do so.
    if (data.texcoord && data.normal) {
      data.tangent = generateTangents(data.position, data.texcoord);
    } else {
      // There are no tangents
      data.tangent = { value: [1, 0, 0] };
    }

    if (!data.texcoord) {
      data.texcoord = { value: [0, 0] };
    }

    if (!data.normal) {
      // we probably want to generate normals if there are none
      data.normal = { value: [0, 0, 1] };
    }
 
    // Data contains the arrays for position, normal, texcoord, color, and tangent
    // create a buffer for each array by calling
    // gl.createBuffer, gl.bindBuffer, gl.bufferData
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return {
      material: { ...defaultMaterial, ...materials[material] },
      bufferInfo,
    };
  });
}

export { loadMeshAndMaterials };
