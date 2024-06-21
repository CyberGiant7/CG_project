import { Scene } from "./Scene.js";
import { SceneObject } from "./SceneObject.js";

async function main() {
  var scene = new Scene("canvas", "./resources/shaders/vertex_shader.glsl", "./resources/shaders/fragment_shader.glsl");
  console.log(scene);
  // new SceneObject(scene, "data/computer/computer.obj", "data/computer/computer.mtl", [10,10,100]);
  new SceneObject(scene, "data/room/room.obj", "data/room/room.mtl");
  function render() {
    webglUtils.resizeCanvasToDisplaySize(scene.gl.canvas);
    scene.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);

    scene.gl.enable(scene.gl.DEPTH_TEST);
    scene.gl.enable(scene.gl.CULL_FACE);

    scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);

    scene.objects.forEach((object) => {
      object.draw();
    });

    requestAnimationFrame(render);
  }
  render();
}

main();
