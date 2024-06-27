import { degToRad } from "./mathUtils.js";
import { loadMeshAndMaterials } from "./meshLoader.js";
import { Scene } from "./Scene.js";

/**
 * Represents a scene object in the 3D WebGL environment.
 */
class SceneObject {
	/**
	 *
	 * @param {string} id - The ID of the object.
	 * @param {Scene} scene - The scene object.
	 * @param {string} sourceMesh - The source file of the mesh.
	 * @param {string} sourceMTL - The source file of the material.
	 * @param {number[]} position - The position of the object.
	 * @param {number[]} rotation - The rotation of the object.
	 * @param {number[]} scale - The scale of the object.
	 */
	constructor(id, scene, sourceMesh, sourceMTL, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
		/** @property {string} id - The ID of the object. */
		this.id = id;

		/** @property {Scene} scene - The scene object. */
		this.scene = scene;

		/** @property {WebGLRenderingContext} gl - The WebGL rendering context. */
		this.gl = scene.gl;

		/** @property {Object[]} mesh - The mesh object. */
		this.mesh = [];

		/** @property {string} sourceMesh - The source file of the mesh. */
		this.mesh.sourceMesh = sourceMesh;

		/** @property {string} fileMTL - The source file of the material. */
		this.mesh.fileMTL = sourceMTL;

		/** @property {number[]} position - The position of the object. */
		this.position = position;

		/** @property {number[]} rotation - The rotation of the object. */
		this.rotation = rotation;

		/** @property {number[]} scale - The scale of the object. */
		this.scale = scale;

		// Load the mesh and materials
		this.loadMeshAndMaterials().then(() => {
			this.scene.objects[this.id] = this; // Add the object to the scene
		});
	}

	/**
	 * Loads the mesh and materials of the object from the source files.
	 */
	async loadMeshAndMaterials() {
		this.mesh = await loadMeshAndMaterials(this.gl, this.mesh.sourceMesh, this.mesh.fileMTL);
	}

	/**
	 * Draws the scene object using the specified program information.
	 */
	draw() {
		let gl = this.gl;
		let scene = this.scene;

		const fieldOfViewRadians = degToRad(scene.controls.fov); // set the field of view
		const aspect = scene.gl.canvas.clientWidth / scene.gl.canvas.clientHeight; // set the aspect ratio
		const zmin = 0.1; // set the near clipping plane
		const zmax = 10000; // set the far clipping plane
		const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, zmax); // set the projection matrix

		//////////////////////////////////////// CAMERA CONTROLS ////////////////////////////////////////

		// set the camera position based on the spherical coordinates of the camera relative to the target
		let cameraPosition = [
			scene.controls.distance * Math.sin(degToRad(scene.controls.phi)) * Math.cos(degToRad(scene.controls.theta)),
			scene.controls.distance * Math.sin(degToRad(scene.controls.phi)) * Math.sin(degToRad(scene.controls.theta)),
			scene.controls.distance * Math.cos(degToRad(scene.controls.phi)),
		];
		const up = [0, 0, 1]; // set the up vector for the camera
		const target = [0, 0, 0]; // set the target for the camera

		let cameraMatrix = m4.identity(); // initialize the camera matrix
		cameraMatrix = m4.lookAt(cameraPosition, target, up); // set the camera matrix looking at the target from the camera position
		cameraMatrix = m4.translate(cameraMatrix, scene.controls.x, scene.controls.y, scene.controls.z); // translate the camera matrix by the camera position controls

		cameraPosition = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]]; // get the world position of the camera after translation

		//////////////////////////////////////// OBJECT TRANSFORMATIONS ////////////////////////////////////////
		let viewMatrix = m4.inverse(cameraMatrix); // initialize the view matrix as the inverse of the camera matrix
		viewMatrix = m4.translate(viewMatrix, this.position[0], this.position[1], this.position[2]); // translate the view matrix by the object position
		viewMatrix = m4.xRotate(viewMatrix, degToRad(this.rotation[0])); // rotate the view matrix around the x-axis by the x rotation of the object
		viewMatrix = m4.yRotate(viewMatrix, degToRad(this.rotation[1])); // rotate the view matrix around the y-axis by the y rotation of the object
		viewMatrix = m4.zRotate(viewMatrix, degToRad(this.rotation[2])); // rotate the view matrix around the z-axis by the z rotation of the object
		viewMatrix = m4.scale(viewMatrix, this.scale[0], this.scale[1], this.scale[2]); // scale the view matrix by the scale of the object

		//////////////////////////////////////// LIGHTING //////////////////////////////////////////
		const ambientLight = [0, 0, 0]; // set the ambient light to zero
		var colorLight = [scene.controls.light_color[0] / 255, scene.controls.light_color[1] / 255, scene.controls.light_color[2] / 255]; // set the color of the light

		colorLight = colorLight.map((c) => c * scene.controls.light_intensity); // scale the light color by the light intensity

		//////////////////////////////////////// DRAWING //////////////////////////////////////////
		gl.useProgram(scene.programInfo.program); // use the shader program

		// compute the world matrix once since all parts are at the same space.
		let u_world = m4.identity(); // initialize the world matrix
		u_world = m4.scale(u_world, 10, 10, 10); // scale the world matrix by 10

		// set the shared uniforms
		const sharedUniforms = {
			u_lightDirection: m4.normalize([scene.controls.directional_light_x, scene.controls.directional_light_y, scene.controls.directional_light_z]), // set the light direction
			u_view: viewMatrix, // set the view matrix
			u_projection: projectionMatrix, // set the projection matrix
			u_viewWorldPosition: cameraPosition, // set the world position of the camera
			u_lightWorldPosition: [scene.controls.light_x, scene.controls.light_y, scene.controls.light_z], // set the world position of the light
			u_lightColor: colorLight, // set the color of the light
			u_useNormalMap: scene.controls.useNormalMap, // set whether to use the normal map
			u_useDirectionalIllumination: scene.controls.useDirectionalLight, // set whether to use the directional light
			u_useSpecularMap: scene.controls.useSpecularMap, // set whether to use the specular map
			u_world: u_world, // set the world matrix
		};

		// equivalent to calling gl.uniform(uniformLocation, value) for each uniform
		webglUtils.setUniforms(scene.programInfo, sharedUniforms);

		// draw each part of the object
		for (const { bufferInfo, material } of this.mesh) {
			// bufferInfo: contains the buffer data

			// calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
			webglUtils.setBuffersAndAttributes(gl, scene.programInfo, bufferInfo);

			// calls gl.uniform for each uniform in the material
			webglUtils.setUniforms(scene.programInfo, material); // set the material uniforms

			// calls gl.drawArrays or gl.drawElements depending on the bufferInfo
			webglUtils.drawBufferInfo(gl, bufferInfo);
		}
	}
}

export { SceneObject };
