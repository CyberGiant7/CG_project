import { InputHandler } from "./InputHandler.js";

/**
 * Represents a scene in the 3D WebGL environment.
 */
class Scene {
  /**
   * @param {string} canvas_id - The ID of the canvas element.
   * @param {string} vertex_shader_src - The source file of the vertex shader.
   * @param {string} fragment_shader_src - The source file of the fragment shader.
   */
  constructor(canvas_id, vertex_shader_src, fragment_shader_src) {
    /** @property {Object.<string, SceneObject>} objects - A dictionary of objects in the scene. */
    this.objects = {};

    /** @property {HTMLCanvasElement} canvas - The canvas element. */
    this.canvas = document.getElementById(canvas_id);

    /** @property {WebGLRenderingContext} gl - The WebGL rendering context. */
    this.gl = this.canvas.getContext("webgl");

    // Check if the browser supports WebGL
    if (!this.gl) {
      console.error("Unable to initialize WebGL. Your browser may not support it.");
      return;
    }

    // Set the default controls for the scene
    this.controls = {
      x: 0, // The x-coordinate of the camera
      y: 0, // The y-coordinate of the camera
      z: 0, // The z-coordinate of the camera
      light_x: -10, // The x-coordinate of the light
      light_y: 1, // The y-coordinate of the light
      light_z: 22, // The z-coordinate of the light
      light_color: [255, 255, 255], // The color of the light

      directional_light_x: 0, // The x component of the direction vector of the directional light
      directional_light_y: 0, // The y component of the direction vector of the directional light
      directional_light_z: -1, // The z component of the direction vector of the directional light

      light_intensity: 1.0, // The intensity of the light
      phi: 30, // The phi angle of the camera
      theta: 180, // The theta angle of the camera
      distance: 100, // The distance of the camera from the origin
      fov: 60, // The field of view of the camera
      useNormalMap: true, // Whether to use the normal map
      useSpecularMap: true, // Whether to use the specular map
      useDirectionalLight: false, // Whether to use the directional light
    };

    // enabling depth testing
    this.gl.enable(this.gl.DEPTH_TEST);

    // enabling alpha blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA); // Additive blending

    // setting the viewport
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // getting the source code of the shaders from the files
    let vertex_shader = getSourceSynch(vertex_shader_src);
    let fragment_shader = getSourceSynch(fragment_shader_src);

    // creation of the shader program. ProgramInfo contains the program and the locations of the attributes and uniforms
    this.programInfo = webglUtils.createProgramInfo(this.gl, [vertex_shader, fragment_shader]);
    this.gl.useProgram(this.programInfo.program);

    // creation of the gui
    this.gui = this.createGui();

    // creation of the input handler
    this.inputHandler = new InputHandler(this.canvas, this.controls, this.gui);
  }

  /**
   * Create the GUI for the scene.
   * @returns {dat.GUI} - The dat.GUI object.
   */
  createGui() {
    let gui = new dat.GUI();
    let scene_controls = gui.addFolder("Scene Controls");
    scene_controls.open();
    scene_controls.add(this.controls, "x", -20, 20, 1);
    scene_controls.add(this.controls, "y", -20, 20, 1);
    scene_controls.add(this.controls, "z", -20, 20, 1);
    scene_controls.add(this.controls, "phi", 0, 180, 0.1);
    scene_controls.add(this.controls, "theta", 0, 360, 1);
    scene_controls.add(this.controls, "distance", 1, 100, 1);
    scene_controls.add(this.controls, "fov", 1, 170);

    let light_controls = gui.addFolder("Light Controls");
    light_controls.open();

    light_controls.add(this.controls, "light_intensity", 0.1, 5.0, 0.1);
    light_controls.addColor(this.controls, "light_color");

    let spotlight_controls = light_controls.addFolder("Spotlight Controls");
    spotlight_controls.add(this.controls, "light_x", -30, 30);
    spotlight_controls.add(this.controls, "light_y", -30, 30);
    spotlight_controls.add(this.controls, "light_z", -10, 30);
    spotlight_controls.open();

    let directional_light_controls = light_controls.addFolder("Directional Light Controls");
    directional_light_controls.add(this.controls, "useDirectionalLight");
    directional_light_controls.add(this.controls, "directional_light_x", -1, 1);
    directional_light_controls.add(this.controls, "directional_light_y", -1, 1);
    directional_light_controls.add(this.controls, "directional_light_z", -1, 1);

    let advanced_rendering = gui.addFolder("Advanced Rendering");
    advanced_rendering.open();
    advanced_rendering.c;
    advanced_rendering.add(this.controls, "useNormalMap");
    advanced_rendering.add(this.controls, "useSpecularMap");

    return gui;
  }
}

/**
 * Get the source code of a file synchronously.
 * @param {string} url - The URL of the source file.
 * @returns 
 */
var getSourceSynch = function (url) {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send(null);
  return req.status == 200 ? req.responseText : null;
};

export { Scene };
