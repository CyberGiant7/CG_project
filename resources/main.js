import { Scene } from "./Scene.js";
import { SceneObject } from "./SceneObject.js";

async function main() {
  var scene = new Scene("canvas", "./resources/shaders/vertex_shader.glsl", "./resources/shaders/fragment_shader.glsl");
  console.log(scene);
  // new SceneObject("computer", scene, "data/computer/computer.obj", "data/computer/computer.mtl", [10,10,100]);
  let light_position = [scene.controls.light_x, scene.controls.light_y, scene.controls.light_z];
  new SceneObject("light", scene, "data/light_bulb/Light_Bulb_Low_Poly.obj", "data/light_bulb/Light_Bulb_Low_Poly.mtl", light_position, [90,0,0], [2,2,2]);
  new SceneObject("room", scene, "data/room/room.obj", "data/room/room.mtl");
  new SceneObject("custom_pic", scene, "data/custom_pic/custom_pic.obj", "data/custom_pic/custom_pic.mtl");

  function render() {
    webglUtils.resizeCanvasToDisplaySize(scene.gl.canvas);
    scene.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);

    scene.gl.enable(scene.gl.DEPTH_TEST);
    scene.gl.enable(scene.gl.CULL_FACE);

    scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);

    for (const [id, sceneObj] of Object.entries(scene.objects)) {
      if (id == "light") {
        sceneObj.position = [scene.controls.light_x, scene.controls.light_y, scene.controls.light_z];
      }
      sceneObj.draw();
    };

    requestAnimationFrame(render);
  }
  render();
}

main();
