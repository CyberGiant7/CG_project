class Scene{
    constructor(canvas_id, vertex_shader_id, fragment_shader_id){
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
    
    }
}