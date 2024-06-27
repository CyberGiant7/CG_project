import { Scene } from "./Scene.js";
import { SceneObject } from "./SceneObject.js";

/**
 * The main function that initializes the scene and renders it.
 */
function main() {
	// Create the scene
	var scene = new Scene("canvas", "./resources/shaders/vertex_shader.glsl", "./resources/shaders/fragment_shader.glsl");

	// Add objects to the scene
	let light_position = [scene.controls.light_x, scene.controls.light_y, scene.controls.light_z];
	new SceneObject("light", scene, "data/light_bulb/Light_Bulb_Low_Poly.obj", "data/light_bulb/Light_Bulb_Low_Poly.mtl", light_position, [90, 0, 0], [2, 2, 2]);
	new SceneObject("room", scene, "data/room/room.obj", "data/room/room.mtl");
	new SceneObject("custom_pic", scene, "data/custom_pic/custom_pic.obj", "data/custom_pic/custom_pic.mtl");

  console.log(scene);
	/**
	 * Renders the scene on the canvas.
	 */
	function render() {
		webglUtils.resizeCanvasToDisplaySize(scene.gl.canvas); // Resize the canvas to the display size
		scene.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height); // Set the viewport

		scene.gl.enable(scene.gl.DEPTH_TEST); // Enable depth testing
		scene.gl.enable(scene.gl.CULL_FACE); // Enable back face culling

		scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT); // Clear the canvas

		for (const [id, sceneObj] of Object.entries(scene.objects)) { // Draw all the objects in the scene
			if (id == "light") {
				sceneObj.position = [scene.controls.light_x, scene.controls.light_y, scene.controls.light_z - 5]; // Update the light position
			}
			sceneObj.draw(); // Draw the object
		}

		requestAnimationFrame(render); // Request the next frame
	}
	render();
}

main();
