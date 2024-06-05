var controls = {
  x: 0,
  y: 0,
  z: 0,
  rotate_x: 0,
  rotate_y: 0,
  rotate_z: 0,
  scale_x: 1,
  scale_y: 1,
  scale_z: 1,
  phi: 20,
  theta: 80,
  distance: 10,
  fov: 60
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

// function main() {
//   createGui();

//   /** @type {HTMLCanvasElement} */
//   var canvas = document.getElementById("canvas");
//   var gl = canvas.getContext("webgl");
//   if (!gl) {
//     return;
//   }
//   // creates buffers with position, normal, texcoord, and vertex color
//   // data for primitives by calling gl.createBuffer, gl.bindBuffer,
//   // and gl.bufferData
//   const sphereBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 10, 12, 6);
//   const cubeBufferInfo = primitives.createCubeWithVertexColorsBufferInfo(gl, 20);
//   const coneBufferInfo = primitives.createTruncatedConeWithVertexColorsBufferInfo(gl, 10, 0, 20, 12, 1, true, false);

//   var vertexShaderSource = getSourceSynch("./resources/vertex_shader.glsl");
//   var fragmentShaderSource = getSourceSynch("./resources/fragment_shader.glsl");

//   var programInfo = webglUtils.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource]);

//   var cameraAngleRadians = degToRad(0);
//   var fieldOfViewRadians = degToRad(60);
//   var cameraHeight = 50;

//   // Uniforms for each object.
//   var sphereUniforms = {
//     u_colorMult: [0.5, 1, 0.5, 1],
//     u_matrix: m4.identity(),
//   };
//   var cubeUniforms = {
//     u_colorMult: [1, 0.5, 0.5, 1],
//     u_matrix: m4.identity(),
//   };
//   var coneUniforms = {
//     u_colorMult: [0.5, 0.5, 1, 1],
//     u_matrix: m4.identity(),
//   };

//   var sphereTranslation = [0, 0, 0];
//   var cubeTranslation = [controls.x, controls.y, controls.z];
//   var coneTranslation = [40, 0, 0];

//   var objectsToDraw = [
//     {
//       programInfo: programInfo,
//       bufferInfo: sphereBufferInfo,
//       uniforms: sphereUniforms,
//     },
//     {
//       programInfo: programInfo,
//       bufferInfo: cubeBufferInfo,
//       uniforms: cubeUniforms,
//     },
//     {
//       programInfo: programInfo,
//       bufferInfo: coneBufferInfo,
//       uniforms: coneUniforms,
//     },
//   ];

//   requestAnimationFrame(drawScene);

//   // Draw the scene.
//   function drawScene(time) {
//     time *= 0.0005;

//     webglUtils.resizeCanvasToDisplaySize(gl.canvas);

//     // Tell WebGL how to convert from clip space to pixels
//     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

//     gl.enable(gl.CULL_FACE);
//     gl.enable(gl.DEPTH_TEST);

//     // Clear the canvas AND the depth buffer.
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//     // Compute the projection matrix
//     var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
//     var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

//     // Compute the camera's matrix using look at.
//     var cameraPosition = [0, 0, 100];
//     var target = [0, 0, 0];
//     var up = [0, 1, 0];
//     var cameraMatrix = m4.lookAt(cameraPosition, target, up);

//     // Make a view matrix from the camera matrix.
//     var viewMatrix = m4.inverse(cameraMatrix);

//     var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

//     var sphereXRotation = time;
//     var sphereYRotation = time;
//     var cubeXRotation = -time;
//     var cubeYRotation = time;
//     var coneXRotation = time;
//     var coneYRotation = -time;

//     var sphereXRotation = time;
//     var sphereYRotation = time;
//     var cubeXRotation = -time;
//     var cubeYRotation = time;
//     var coneXRotation = time;
//     var coneYRotation = -time;

//     // Compute the matrices for each object.
//     sphereUniforms.u_matrix = computeMatrix(viewProjectionMatrix, sphereTranslation, sphereXRotation, sphereYRotation);

//     cubeUniforms.u_matrix = computeMatrix(viewProjectionMatrix, [controls.x, controls.y, controls.z], cubeXRotation, cubeYRotation);

//     coneUniforms.u_matrix = computeMatrix(viewProjectionMatrix, coneTranslation, coneXRotation, coneYRotation);

//     // ------ Draw the objects --------

//     var lastUsedProgramInfo = null;
//     var lastUsedBufferInfo = null;

//     objectsToDraw.forEach(function (object) {
//       var programInfo = object.programInfo;
//       var bufferInfo = object.bufferInfo;
//       var bindBuffers = false;

//       if (programInfo !== lastUsedProgramInfo) {
//         lastUsedProgramInfo = programInfo;
//         gl.useProgram(programInfo.program);

//         // We have to rebind buffers when changing programs because we
//         // only bind buffers the program uses. So if 2 programs use the same
//         // bufferInfo but the 1st one uses only positions then when
//         // we switch to the 2nd one some of the attributes will not be on.
//         bindBuffers = true;
//       }

//       // Setup all the needed attributes.
//       if (bindBuffers || bufferInfo != lastUsedBufferInfo) {
//         lastUsedBufferInfo = bufferInfo;
//         webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
//       }

//       // Set the uniforms.
//       webglUtils.setUniforms(programInfo, object.uniforms);

//       // Draw
//       gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
//     });

//     requestAnimationFrame(drawScene);
//   }

//   // // look up where the vertex data needs to go.
//   // var positionLocation = gl.getAttribLocation(program, "a_position");
//   // var colorLocation = gl.getAttribLocation(program, "a_color");

//   // // lookup uniforms
//   // var matrixLocation = gl.getUniformLocation(program, "u_matrix");

//   // // Create a buffer to put positions in
//   // var positionBuffer = gl.createBuffer();
//   // // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
//   // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//   // // Put geometry data into buffer
//   // setGeometry(gl);

//   // // Create a buffer to put colors in
//   // var colorBuffer = gl.createBuffer();
//   // // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
//   // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//   // // Put color data into buffer
//   // setColors(gl);

//   // var cameraAngleRadians = degToRad(0);
//   // var fieldOfViewRadians = degToRad(60);

//   // drawScene();

//   // // Draw the scene.
//   // function drawScene() {
//   //   webglUtils.resizeCanvasToDisplaySize(gl.canvas);

//   //   // Tell WebGL how to convert from clip space to pixels
//   //   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

//   //   // Clear the canvas AND the depth buffer.
//   //   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//   //   // Turn on culling. By default backfacing triangles
//   //   // will be culled.
//   //   gl.enable(gl.CULL_FACE);

//   //   // Enable the depth buffer
//   //   gl.enable(gl.DEPTH_TEST);

//   //   // Tell it to use our program (pair of shaders)
//   //   gl.useProgram(program);

//   //   // Turn on the position attribute
//   //   gl.enableVertexAttribArray(positionLocation);

//   //   // Bind the position buffer.
//   //   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

//   //   // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
//   //   var size = 3; // 3 components per iteration
//   //   var type = gl.FLOAT; // the data is 32bit floats
//   //   var normalize = false; // don't normalize the data
//   //   var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
//   //   var offset = 0; // start at the beginning of the buffer
//   //   gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

//   //   // Turn on the color attribute
//   //   gl.enableVertexAttribArray(colorLocation);

//   //   // Bind the color buffer.
//   //   gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

//   //   // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
//   //   var size = 3; // 3 components per iteration
//   //   var type = gl.UNSIGNED_BYTE; // the data is 8bit unsigned values
//   //   var normalize = true; // normalize the data (convert from 0-255 to 0-1)
//   //   var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
//   //   var offset = 0; // start at the beginning of the buffer
//   //   gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);

//   //   var numFs = 5;
//   //   var radius = 200;

//   //   // Compute the projection matrix
//   //   var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
//   //   var zNear = 1;
//   //   var zFar = 2000;
//   //   var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

//   //   // Compute the position of the first F
//   //   var fPosition = [radius, 0, 0];

//   //   // Use matrix math to compute a position on a circle where
//   //   // the camera is
//   //   var cameraMatrix = m4.yRotation(degToRad(controls.camera_rotate));
//   //   cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);

//   //   // Get the camera's position from the matrix we computed
//   //   var cameraPosition = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];

//   //   var up = [0, 1, 0];

//   //   // Compute the camera's matrix using look at.
//   //   var cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);

//   //   // Make a view matrix from the camera matrix
//   //   var viewMatrix = m4.inverse(cameraMatrix);

//   //   // Compute a view projection matrix
//   //   var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

//   //   for (var ii = 0; ii < numFs; ++ii) {
//   //     var angle = (ii * Math.PI * 2) / numFs;
//   //     var x = Math.cos(angle) * radius;
//   //     var y = Math.sin(angle) * radius;

//   //     // starting with the view projection matrix
//   //     // compute a matrix for the F
//   //     var matrix = m4.translate(viewProjectionMatrix, x, 0, y);

//   //     // Set the matrix.
//   //     gl.uniformMatrix4fv(matrixLocation, false, matrix);

//   //     // Draw the geometry.
//   //     var primitiveType = gl.TRIANGLES;
//   //     var offset = 0;
//   //     var count = 16 * 6;
//   //     gl.drawArrays(primitiveType, offset, count);
//   //   }
//   // }
// }

var scene;

function main() {

  scene = new Scene("canvas", "3d-vertex-shader", "3d-fragment-shader");


  createGui();

  // Initialize the mesh
  const mesh = new SceneObject(scene.gl, "data/boeing/boeing_3.obj", "data/boeing/boeing_3.mtl");
  const mesh2 = new SceneObject(scene.gl, "data/cube/cube.obj", "data/cube/cube.mtl");


  console.log(scene.objects);

  function drawScene() {
    scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);

    scene.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);
    scene.gl.enable(scene.gl.DEPTH_TEST);
    scene.gl.enable(scene.gl.CULL_FACE);

    scene.gl.bindFramebuffer(scene.gl.FRAMEBUFFER, null);
    scene.gl.clearColor(0, 0, 0, 0);

    scene.objects.forEach((mesh) => {
      // mesh.updateBuffers();
      mesh.draw(scene.programInfo.program);
    });
    requestAnimationFrame(drawScene)
  }

  drawScene();
}

main();
var gui
function createGui() {
  gui = new dat.GUI();
  gui.add(controls, "x", -10, 10, 0.1);
  gui.add(controls, "y", -10, 10, 1);
  gui.add(controls, "z", -10, 10, 1);
  gui.add(controls, "rotate_x", 0, 360);
  gui.add(controls, "rotate_y", 0, 360);
  gui.add(controls, "rotate_z", 0, 360);

  gui.add(controls, "scale_x", 0, 5, 0.1);
  gui.add(controls, "scale_y", 0, 5, 0.1);
  gui.add(controls, "scale_z", 0, 5, 0.1);

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


