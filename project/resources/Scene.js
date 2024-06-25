import { InputHandler } from "./InputHandler.js";

class Scene {
  constructor(canvas_id, vertex_shader_id, fragment_shader_id) {
    /** @type {Object} */
    this.objects = {};
    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById(canvas_id);
    /** @type {WebGLRenderingContext} */
    this.gl = this.canvas.getContext("webgl");

    if (!this.gl) {
      console.error("Unable to initialize WebGL. Your browser may not support it.");
      return;
    }

    this.controls = {
      x: 0,
      y: 0,
      z: 0,
      light_x: -10,
      light_y: 1,
      light_z: 22,
      light_color: [255, 255, 255],

      directional_light_x: 0,
      directional_light_y: 0,
      directional_light_z: -1,

      light_intensity: 1.0,
      phi: 30,
      theta: 180,
      distance: 100,
      fov: 60,
      useNormalMap: true,
      useSpecularMap: true,
      useDirectionalLight: false,
    };

    this.gl.enable(this.gl.DEPTH_TEST);

    // enabling alpha blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    let vertex_shader = getSourceSynch(vertex_shader_id);
    let fragment_shader = getSourceSynch(fragment_shader_id);

    this.programInfo = webglUtils.createProgramInfo(this.gl, [vertex_shader, fragment_shader]);
    this.gl.useProgram(this.programInfo.program);

    this.gui = this.createGui();

    this.inputHandler = new InputHandler(this.canvas, this.controls, this.gui);
  }

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
    light_controls.addColor(this.controls, "light_color")

    let spotlight_controls = light_controls.addFolder("Spotlight Controls");
    spotlight_controls.add(this.controls, "light_x", -30, 30);
    spotlight_controls.add(this.controls, "light_y", -30, 30);
    spotlight_controls.add(this.controls, "light_z", -10, 30);
    

    let directional_light_controls = light_controls.addFolder("Directional Light Controls");
    directional_light_controls.add(this.controls, "useDirectionalLight");
    directional_light_controls.add(this.controls, "directional_light_x", -1, 1);
    directional_light_controls.add(this.controls, "directional_light_y", -1, 1);
    directional_light_controls.add(this.controls, "directional_light_z", -1, 1);

    let advanced_rendering = gui.addFolder("Advanced Rendering");
    advanced_rendering.open();
    advanced_rendering.c
    advanced_rendering.add(this.controls, "useNormalMap");
    advanced_rendering.add(this.controls, "useSpecularMap");

    return gui;
  }
}

var getSourceSynch = function (url) {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send(null);
  return req.status == 200 ? req.responseText : null;
};

export { Scene };
