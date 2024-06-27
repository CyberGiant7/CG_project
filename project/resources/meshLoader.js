import { create1PixelTexture, createTexture } from "./textureUtils.js";
import { parseOBJ, parseMTL } from "./parsers.js";
import { generateTangents } from "./mathUtils.js";

/**
 * Loads a mesh and its associated materials.
 * @param {WebGLRenderingContext} gl - The WebGL rendering context.
 * @param {string} sourceMesh - The URL or file path of the mesh file.
 * @param {string} sourceMTL - The URL or file path of the material file.
 * @returns {Promise<Array<{ material: Object, bufferInfo: Object }>>} - A promise that resolves to an array of objects containing the loaded materials and buffer information.
 */
async function loadMeshAndMaterials(gl, sourceMesh, sourceMTL) {
	const objText = await fetch(sourceMesh).then((response) => response.text()); // fetch the mesh file
	const obj = parseOBJ(objText); // parse the mesh file

	const baseHref = new URL(sourceMesh, window.location.href); // get the base URL of the mesh file
	const mtlTexts = await Promise.all(
		// fetch the material files
		obj.materialLibs.map(async (filename) => {
			// for each material file
			const mtlHref = new URL(filename, baseHref).href; // get the full URL of the material file
			const response = await fetch(mtlHref); // fetch the material file
			return await response.text(); // return the text content of the material file
		})
	);
	const materials = parseMTL(mtlTexts.join("\n")); // parse the material files

	const textures = {
		defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]), // create a default white texture
		defaultNormal: create1PixelTexture(gl, [127, 127, 255, 0]), // create a default normal texture
	};

	// load texture for materials
	for (const material of Object.values(materials)) {
		// for each material
		Object.entries(material) // get the key-value pairs of the material
			.filter(([key]) => key.endsWith("Map")) // filter the key-value pairs to get only the ones that end with "Map"
			.forEach(([key, filename]) => {
				// for each key-value pair
				let texture = textures[filename]; // get the texture from the textures object
				if (!texture) {
					// if the texture does not exist
					const textureHref = new URL(filename, baseHref).href; // get the full URL of the texture file
					texture = createTexture(gl, textureHref); // create the texture
					textures[filename] = texture; // add the texture to the textures object
				}
				material[key] = texture; // set the material key to the texture
			});
	}

	// Default material properties
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
		// for each geometry
		if (data.color) {
			// if the geometry has color data
			if (data.position.length === data.color.length) {
				// if the color data has the same length as the position data
				// it's 3. The our helper library assumes 4 so we need to tell it there are only 3.
				data.color = { numComponents: 3, data: data.color }; // set the color data to have 3 components
			}
		} else {
			// there are no vertex colors so just use constant white
			data.color = { value: [1, 1, 1, 1] };
		}
		// generate tangents if we have the data to do so.
		if (data.texcoord && data.normal) {
			// if the geometry has texcoord and normal data
			data.tangent = generateTangents(data.position, data.texcoord); // generate the tangents
		} else {
			// There are no tangents
			data.tangent = { value: [1, 0, 0] }; // set the tangent data to a default value
		}

		if (!data.texcoord) {
			data.texcoord = { value: [0, 0] }; // set the texcoord data to a default value
		}

		if (!data.normal) {
			// we probably want to generate normals if there are none
			data.normal = { value: [0, 0, 1] }; // set the normal data to a default value
		}

		// Data contains the arrays for position, normal, texcoord, color, and tangent
		// create a buffer for each array by calling
		// gl.createBuffer, gl.bindBuffer, gl.bufferData
		const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data); 
		return {
			material: { ...defaultMaterial, ...materials[material] }, // set the material properties
			bufferInfo, // set the buffer information
		};
	});
}

export { loadMeshAndMaterials };
