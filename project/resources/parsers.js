/**
 * Parses an OBJ file and returns the geometries and material libraries.
 *
 * @param {string} text - The text content of the OBJ file.
 * @returns {Object} An object containing the parsed geometries and material libraries.
 * @property {Array} geometries - An array of geometries parsed from the OBJ file.
 * @property {Array} materialLibs - An array of material libraries referenced in the OBJ file.
 */
function parseOBJ(text) {
	// because indices are base 1 let's just fill in the 0th data
	const objPositions = [[0, 0, 0]];
	const objTexcoords = [[0, 0]];
	const objNormals = [[0, 0, 0]];
	const objColors = [[0, 0, 0]];

	// same order as `f` indices
	const objVertexData = [objPositions, objTexcoords, objNormals, objColors];

	// same order as `f` indices
	let webglVertexData = [
		[], // positions
		[], // texcoords
		[], // normals
		[], // colors
	];

	const materialLibs = []; // mtl files to load
	const geometries = []; // contains geometry objects that hold vertex data arrays
	let geometry; // the current geometry in the file
	let groups = ["default"]; // 0th group is the default group
	let material = "default"; // 0th material is the default material
	let object = "default"; // 0th object is the default object

	const noop = () => {};

	/**
	 * Creates a new geometry.
	 * If there is an existing geometry and it's not empty, then start a new one.
	 */
	function newGeometry() {
		if (geometry && geometry.data.position.length) {
			geometry = undefined;
		}
	}

	/**
	 * Sets the geometry data for the object.
	 */
	function setGeometry() {
		if (!geometry) {
			const position = [];
			const texcoord = [];
			const normal = [];
			const color = [];
			webglVertexData = [position, texcoord, normal, color];
			geometry = {
				object,
				groups,
				material,
				data: {
					position,
					texcoord,
					normal,
					color,
				},
			};
			geometries.push(geometry);
		}
	}

	/**
	 * Adds a vertex to the webgl vertex data.
	 * @param {string} vert - The vertex string to be added.
	 */
	function addVertex(vert) {
		const ptn = vert.split("/");
		ptn.forEach((objIndexStr, i) => {
			if (!objIndexStr) {
				return;
			}
			const objIndex = parseInt(objIndexStr);
			const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
			webglVertexData[i].push(...objVertexData[i][index]);
			// if this is the position index (index 0) and we parsed
			// vertex colors then copy the vertex colors to the webgl vertex color data
			if (i === 0 && objColors.length > 1) {
				geometry.data.color.push(...objColors[index]);
			}
		});
	}

	/** @type {Object} keywords - Object containing parsing functions for different keywords. */
	const keywords = {
		v(parts) {
			// vertex positions
			// if there are more than 3 values here they are vertex colors
			if (parts.length > 3) {
				objPositions.push(parts.slice(0, 3).map(parseFloat));
				objColors.push(parts.slice(3).map(parseFloat));
			} else {
				objPositions.push(parts.map(parseFloat));
			}
		},
		vn(parts) {
			// normal vectors
			objNormals.push(parts.map(parseFloat));
		},
		vt(parts) {
			// texcoords
			// should check for missing v and extra w?
			objTexcoords.push(parts.map(parseFloat));
		},
		f(parts) {
			// face
			setGeometry();
			const numTriangles = parts.length - 2;
			for (let tri = 0; tri < numTriangles; ++tri) {
				addVertex(parts[0]);
				addVertex(parts[tri + 1]);
				addVertex(parts[tri + 2]);
			}
		},
		s: noop, // smoothing group
		mtllib(parts, unparsedArgs) {
			// the spec says there can be multiple filenames here
			// but many exist with spaces in a single filename
			materialLibs.push(unparsedArgs);
		},
		usemtl(parts, unparsedArgs) {
			material = unparsedArgs;
			newGeometry();
		},
		g(parts) {
			// group
			groups = parts;
			newGeometry();
		},
		o(parts, unparsedArgs) {
			// object
			object = unparsedArgs;
			newGeometry();
		},
	};

	const keywordRE = /(\w*)(?: )*(.*)/; // match a keyword and its parameters
	const lines = text.split("\n"); // split the text into lines
	for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
		// iterate over each line
		const line = lines[lineNo].trim(); // get the current line and remove leading/trailing whitespace
		if (line === "" || line.startsWith("#")) {
			// if the line is empty or a comment
			continue;
		}
		const m = keywordRE.exec(line); // match the keyword and its parameters
		if (!m) {
			continue;
		}
		const [, keyword, unparsedArgs] = m; // get the keyword and its parameters
		const parts = line.split(/\s+/).slice(1); // split the line into parts
		const handler = keywords[keyword]; // get the handler for the keyword
		if (!handler) {
			// if there is no handler
			console.warn("unhandled keyword:", keyword); // eslint-disable-line no-console
			continue;
		}
		handler(parts, unparsedArgs); // call the handler with the parts and unparsed arguments
	}
	// remove any arrays that have no entries.
	for (const geometry of geometries) {
		// iterate over the geometries
		geometry.data = Object.fromEntries(Object.entries(geometry.data).filter(([, array]) => array.length > 0)); // remove empty arrays
	}

	return {
		geometries, // return the geometries
		materialLibs, // return the material libraries
	};
}

function parseMapArgs(unparsedArgs) {
	// TODO: handle options
	return unparsedArgs;
}

/**
 * Parses the contents of an MTL (Material Template Library) file and returns an object
 * containing the parsed materials.
 *
 * @param {string} text - The text content of the MTL file.
 * @returns {Object} - An object containing the parsed materials.
 */
function parseMTL(text) {
	const materials = {};
	let material;

	const keywords = {
		// object containing parsing functions for different keywords
		newmtl(parts, unparsedArgs) {
			material = {};
			materials[unparsedArgs] = material;
		},
		/* eslint brace-style:0 */
		Ns(parts) {
			material.shininess = parseFloat(parts[0]);
		},
		Ka(parts) {
			material.ambient = parts.map(parseFloat);
		},
		Kd(parts) {
			material.diffuse = parts.map(parseFloat);
		},
		Ks(parts) {
			material.specular = parts.map(parseFloat);
		},
		Ke(parts) {
			material.emissive = parts.map(parseFloat);
		},
		map_Kd(parts, unparsedArgs) {
			material.diffuseMap = parseMapArgs(unparsedArgs);
		},
		map_Ns(parts, unparsedArgs) {
			material.specularMap = parseMapArgs(unparsedArgs);
		},
		map_Bump(parts, unparsedArgs) {
			material.normalMap = parseMapArgs(unparsedArgs);
		},
		Ni(parts) {
			material.opticalDensity = parseFloat(parts[0]);
		},
		d(parts) {
			material.opacity = parseFloat(parts[0]);
		},
		illum(parts) {
			material.illum = parseInt(parts[0]);
		},
	};

	const keywordRE = /(\w*)(?: )*(.*)/; // match a keyword and its parameters
	const lines = text.split("\n"); // split the text into lines
	for (let lineNo = 0; lineNo < lines.length; ++lineNo) { // iterate over each line
		const line = lines[lineNo].trim(); // get the current line and remove leading/trailing whitespace
		if (line === "" || line.startsWith("#")) { // if the line is empty or a comment
			continue;
		}
		const m = keywordRE.exec(line); // match the keyword and its parameters
		if (!m) {
			continue;
		}
		const [, keyword, unparsedArgs] = m; // get the keyword and its parameters
		const parts = line.split(/\s+/).slice(1); // split the line into parts
		const handler = keywords[keyword]; // get the handler for the keyword
		if (!handler) {
			console.warn("unhandled keyword:", keyword); // eslint-disable-line no-console
			continue;
		}
		handler(parts, unparsedArgs); // call the handler with the parts and unparsed arguments
	}

	return materials; // return the materials
}

export { parseOBJ, parseMTL };
