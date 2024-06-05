class Scene {
  constructor(canvas_id, vertex_shader_id, fragment_shader_id) {
    this.objects = [];
    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById(canvas_id, vertex_shader_id, fragment_shader_id);
    this.gl = this.canvas.getContext("webgl");

    if (!this.gl) {
      console.error("Unable to initialize WebGL. Your browser may not support it.");
      return;
    }

    this.gl.enable(this.gl.DEPTH_TEST);
    // enabling alpha blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.programInfo = webglUtils.createProgramInfo(this.gl, ["3d-vertex-shader", "3d-fragment-shader"]);
    this.gl.useProgram(this.programInfo.program);

    this.canvas.onmousedown = mouseDown;
    this.canvas.onmouseup = mouseUp;
    this.canvas.mouseout = mouseUp;
    this.canvas.onmousemove = mouseMove;
    this.canvas.onwheel = mouseWheel;
  }
}
drag = false;
middle = false;

var mouseDown = function (e) {
  drag = true;
  (old_x = e.pageX), (old_y = e.pageY);
  e.preventDefault();

  if (e.button == 1) {
    middle = true;
  }

  return false;
};

var mouseUp = function (e) {
  drag = false;
  middle = false;
};

var mouseMove = function (e) {
  if (middle) {
    controls.x += (e.pageX - old_x) / 100;
    controls.y -= (e.pageY - old_y) / 100;
    old_x = e.pageX;
    old_y = e.pageY;
    e.preventDefault();
    gui.updateDisplay();
    return;
  }
  if (!drag) return false;
  dX = (-(e.pageX - old_x) * 2 * Math.PI) / canvas.width;
  dY = (-(e.pageY - old_y) * 2 * Math.PI) / canvas.height;

  dX = radToDeg(dX);
  dY = radToDeg(dY);

  controls.theta = (controls.theta + dX) % 360;
  if (controls.phi + dY >= 0 && controls.phi + dY <= 180) {
    controls.phi += dY;
  }

  old_x = e.pageX;
  old_y = e.pageY;
  e.preventDefault();
  gui.updateDisplay();
};

var mouseWheel = function (e) {
  var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
  if (controls.distance - delta > 0) {
    controls.distance -= delta;
  }
  e.preventDefault();
  gui.updateDisplay();
};
