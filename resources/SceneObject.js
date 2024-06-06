class SceneObject {
  constructor(gl, sourceMesh, sourceMTL, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
    /** @type {WebGLRenderingContext} */
    this.gl = gl;
    this.mesh = [];
    this.mesh.sourceMesh = sourceMesh;
    this.mesh.fileMTL = sourceMTL;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;

    LoadMesh(gl, this.mesh).then(() => {
      scene.objects.push(this);
      console.log(this.mesh);
      this.initBuffers();
    });
  }

  initBuffers() {
    let gl = this.gl;

    // look up where the vertex data needs to go.
    this.positionLocation = gl.getAttribLocation(scene.programInfo.program, "a_position");
    this.normalLocation = gl.getAttribLocation(scene.programInfo.program, "a_normal");
    this.texcoordLocation = gl.getAttribLocation(scene.programInfo.program, "a_texcoord");

    // Create buffers for positions, normals, and texcoords
    this.positionBuffer = gl.createBuffer();
    // Bind and set data for positions buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.positions), gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.normals), gl.STATIC_DRAW);

    this.texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.texcoords), gl.STATIC_DRAW);
  }

  draw(program) {
    let gl = this.gl;
    let m = this.mesh;

    // Compute the projection matrix
    var fieldOfViewRadians = degToRad(30);
    var aspect = scene.gl.canvas.clientWidth / scene.gl.canvas.clientHeight;
    var zmin = 0.1;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, 10000);

    // var cameraPosition = [];
    var up = [0, 0, 1];
    var target = [0, 0, 0];
    var cameraMatrix = m4.identity();

    projectionMatrix = m4.translate(projectionMatrix, controls.x, controls.y, controls.z);

    var cameraPosition = [
      controls.distance * Math.sin(degToRad(controls.phi)) * Math.cos(degToRad(controls.theta)),
      controls.distance * Math.sin(degToRad(controls.phi)) * Math.sin(degToRad(controls.theta)),
      controls.distance * Math.cos(degToRad(controls.phi)),
    ];

    cameraMatrix = m4.lookAt(cameraPosition, target, up);
    var viewMatrix = m4.inverse(cameraMatrix);
    viewMatrix = m4.translate(viewMatrix, this.position[0], this.position[1], this.position[2]);
    viewMatrix = m4.xRotate(viewMatrix, degToRad(this.rotation[0]));
    viewMatrix = m4.yRotate(viewMatrix, degToRad(this.rotation[1]));
    viewMatrix = m4.zRotate(viewMatrix, degToRad(this.rotation[2]));
    viewMatrix = m4.scale(viewMatrix, this.scale[0], this.scale[1], this.scale[2]);

    var ambientLight = [0, 0, 0];
    var colorLight = [1.0, 1.0, 1.0];

    // Set shader uniforms
    if (m.diffuse) {
      gl.uniform3fv(gl.getUniformLocation(program, "diffuse"), m.diffuse);
    }
    if (m.ambient) {
      gl.uniform3fv(gl.getUniformLocation(program, "ambient"), m.ambient);
    }
    if (m.specular) {
      gl.uniform3fv(gl.getUniformLocation(program, "specular"), m.specular);
    }
    if (m.emissive) {
      gl.uniform3fv(gl.getUniformLocation(program, "emissive"), m.emissive);
    }
    if (m.shininess) {
      gl.uniform1f(gl.getUniformLocation(program, "shininess"), m.shininess);
    }
    if (m.opacity) {
      gl.uniform1f(gl.getUniformLocation(program, "opacity"), m.opacity);
    }
    gl.uniform3fv(gl.getUniformLocation(program, "u_ambientLight"), ambientLight);
    gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight"), colorLight);

    // Enable attributes and bind buffers
    gl.enableVertexAttribArray(this.positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(this.normalLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, this.mesh.texture);

    const matrixLocation = gl.getUniformLocation(program, "u_world");
    const textureLocation = gl.getUniformLocation(program, "diffuseMap");
    const viewMatrixLocation = gl.getUniformLocation(program, "u_view");
    const projectionMatrixLocation = gl.getUniformLocation(program, "u_projection");
    const lightWorldDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
    const viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");

    // Compute matrices
    const modelMatrix = m4.identity();
    const lightWorldDirection = m4.normalize([0, 0, 1]);

    // Set matrices
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(matrixLocation, false, modelMatrix);
    gl.uniform3fv(lightWorldDirectionLocation, lightWorldDirection);
    gl.uniform3fv(viewWorldPositionLocation, cameraPosition);

    // Tell the shader to use texture unit 0 for diffuseMap
    gl.uniform1i(textureLocation, 0);

    // Draw the mesh
    gl.drawArrays(gl.TRIANGLES, 0, m.numVertices);
  }
}
