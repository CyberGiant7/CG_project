var controls = {
  prova: 1,
};

function createGui() {
  var gui = new dat.GUI();
  gui.add(controls, "prova", 0, 10);
}

function main() {
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }
  
  createGui();
  console.log("Hello World!");
}

main();
