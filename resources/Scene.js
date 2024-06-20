import { InputHandler } from "./InputHandler.js";

class Scene {
  constructor(canvas_id, vertex_shader_id, fragment_shader_id) {
    /** @type {SceneObject[]} */
    this.objects = [];
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
      light_x: 0,
      light_y: 0,
      light_z: -1,
      light_intensity: 1.0,
      phi: 20,
      theta: 80,
      distance: 100,
      fov: 60,
    };

    this.gl.enable(this.gl.DEPTH_TEST);
    // enabling alpha blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

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
    gui.add(this.controls, "x", -10, 10, 0.1);
    gui.add(this.controls, "y", -10, 10, 1);
    gui.add(this.controls, "z", -10, 10, 1);
    gui.add(this.controls, "light_x", -20, 20);
    gui.add(this.controls, "light_y", -20, 20);
    gui.add(this.controls, "light_z", -20, 20);
    gui.add(this.controls, "light_intensity", 0.1, 5.0, 0.1);


    gui.add(this.controls, "phi", 0, 180, 0.1);
    gui.add(this.controls, "theta", 0, 360, 1);
    gui.add(this.controls, "distance", 0, 20, 1);

    gui.add(this.controls, "fov", 0, 180);
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
