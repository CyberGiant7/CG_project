var controls = {
  x: 0,
  y: 0,
  z: 0,
  light_x: 0,
  light_y: 0,
  light_z: -1,
  phi: 20,
  theta: 80,
  distance: 100,
  fov: 60,
};

var getSourceSynch = function (url) {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send(null);
  return req.status == 200 ? req.responseText : null;
};

function radToDeg(r) {
  return (r * 180) / Math.PI;
}

function degToRad(d) {
  return (d * Math.PI) / 180;
}

function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
  var matrix = m4.translate(viewProjectionMatrix, translation[0], translation[1], translation[2]);
  matrix = m4.xRotate(matrix, xRotation);
  return m4.yRotate(matrix, yRotation);
}

var scene;
var gui;

async function main() {
  createGui();
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  scene = new Scene("canvas", "3d-vertex-shader", "3d-fragment-shader");

  // sas = new SceneObject(gl, "data/computer/computer.obj", "data/computer/computer.mtl");
  sas = new SceneObject(gl, "data/room/room.obj", "data/room/room.mtl");
  console.log(sas);
  function render() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    scene.objects.forEach((object) => {
      object.draw(scene.programInfo);
    });

    requestAnimationFrame(render);
  }
  render();
}

main();

function createGui() {
  gui = new dat.GUI();
  gui.add(controls, "x", -10, 10, 0.1);
  gui.add(controls, "y", -10, 10, 1);
  gui.add(controls, "z", -10, 10, 1);
  gui.add(controls, "light_x", -20, 20);
  gui.add(controls, "light_y", -20, 20);
  gui.add(controls, "light_z", -20, 20);

  gui.add(controls, "phi", 0, 180, 0.1);
  gui.add(controls, "theta", 0, 360, 1);
  gui.add(controls, "distance", 0, 20, 1);

  gui.add(controls, "fov", 0, 180);

  // // call drawScene function on change of any control
  // gui.__controllers.forEach(function (controller) {
  //   controller.onChange(() => {
  //     requestAnimationFrame(drawScene);
  //   });
  // });
}
