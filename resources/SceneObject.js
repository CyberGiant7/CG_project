import { degToRad } from "./mathUtils.js";
import { loadMeshAndMaterials } from "./meshLoader.js";

/**
 * Represents a scene object in a 3D scene.
 */
class SceneObject {
  constructor(id, scene, sourceMesh, sourceMTL, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
    /** @type {Scene} */
    this.scene = scene;
    /** @type {WebGLRenderingContext} */
    this.gl = scene.gl;

    this.mesh = [];
    this.mesh.sourceMesh = sourceMesh;
    this.mesh.fileMTL = sourceMTL;

    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.id = id;

    this.loadMeshAndMaterials().then(() => {
      this.scene.objects[this.id] = this;
    });
  }
  async loadMeshAndMaterials() {
    this.mesh = await loadMeshAndMaterials(this.gl, this.mesh.sourceMesh, this.mesh.fileMTL);
    console.log(this.mesh);
  }

  /**
   * Draws the scene object using the specified program information.
   */
  draw() {
    const gl = this.gl;
    const scene = this.scene;

    const fieldOfViewRadians = degToRad(scene.controls.fov);
    const aspect = scene.gl.canvas.clientWidth / scene.gl.canvas.clientHeight;
    const zmin = 0.1;
    let projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, 10000);

    const up = [0, 0, 1];
    const target = [0, 0, 0];
    let cameraMatrix = m4.identity();

    projectionMatrix = m4.translate(projectionMatrix, scene.controls.x, scene.controls.y, scene.controls.z);

    const cameraPosition = [
      scene.controls.distance * Math.sin(degToRad(scene.controls.phi)) * Math.cos(degToRad(scene.controls.theta)),
      scene.controls.distance * Math.sin(degToRad(scene.controls.phi)) * Math.sin(degToRad(scene.controls.theta)),
      scene.controls.distance * Math.cos(degToRad(scene.controls.phi)),
    ];

    cameraMatrix = m4.lookAt(cameraPosition, target, up);
    let viewMatrix = m4.inverse(cameraMatrix);
    viewMatrix = m4.translate(viewMatrix, this.position[0], this.position[1], this.position[2]);
    viewMatrix = m4.xRotate(viewMatrix, degToRad(this.rotation[0]));
    viewMatrix = m4.yRotate(viewMatrix, degToRad(this.rotation[1]));
    viewMatrix = m4.zRotate(viewMatrix, degToRad(this.rotation[2]));
    viewMatrix = m4.scale(viewMatrix, this.scale[0], this.scale[1], this.scale[2]);

    const ambientLight = [0, 0, 0];
    var colorLight = [1.0, 1.0, 1.0];

    colorLight = colorLight.map((c) => c * scene.controls.light_intensity);

    gl.useProgram(scene.programInfo.program);

    const sharedUniforms = {
      u_lightDirection: m4.normalize([scene.controls.light_x, scene.controls.light_y, scene.controls.light_z]),
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_viewWorldPosition: cameraPosition,
      u_lightWorldPosition: [scene.controls.light_x, scene.controls.light_y, scene.controls.light_z],
      u_lightColor: colorLight,
      u_useNormalMap: scene.controls.useNormalMap,
      u_useGlobalIllumination: scene.controls.useGlobalLight,
      u_useSpecularMap: scene.controls.useSpecularMap,
    };

    webglUtils.setUniforms(scene.programInfo, sharedUniforms);

    let u_world = m4.identity();
    u_world = m4.scale(u_world, 10, 10, 10);

    for (const { bufferInfo, material } of this.mesh) {
      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      webglUtils.setBuffersAndAttributes(gl, scene.programInfo, bufferInfo);
      // calls gl.uniform
      webglUtils.setUniforms(
        scene.programInfo,
        {
          u_world: u_world,
          u_ambientLight: ambientLight,
        },
        material
      );
      // calls gl.drawArrays or gl.drawElements
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }
  }
}

export { SceneObject };
