import { radToDeg } from "./mathUtils.js";

class InputHandler {
    constructor(canvas, controls, gui) {
      this.canvas = canvas;
      this.controls = controls;
      this.gui = gui;
  
      this.drag = false;
      this.middle = false;
      this.old_x;
      this.old_y;
  
 
      window.addEventListener("keydown", (e) => {
        this.keyboardInput(e, controls);
      });

      this.canvas.addEventListener("mousedown", (e) => {
        this.mouseDown(e, controls);
      });
      this.canvas.addEventListener("mouseup", (e) => {
        this.mouseUp(e);
      });
      this.canvas.addEventListener("mousemove", (e) => {
        this.mouseMove(e, controls);
      });
      this.canvas.addEventListener("mousewheel", (e) => {
        this.mouseWheel(e, controls);
      });
      
     
    }

    keyboardInput(e, controls) {
      if (e.key == "w") {
        controls.z += 1;
      } else if (e.key == "s") {
        controls.z -= 1;
      } else if (e.key == "a") {
        controls.x += 1;
      } else if (e.key == "d") {
        controls.x -= 1;
      } else if (e.key == "q") {
        controls.y += 1;
      } else if (e.key == "e") {
        controls.y -= 1;
      }
      this.gui.updateDisplay();
    }
  
    mouseDown(e, controls) {
      this.drag = true;
  
      this.old_x = e.pageX;
      this.old_y = e.pageY;
      e.preventDefault();
  
      if (e.button == 1) {
        this.middle = true;
      }
  
      return false;
    }
  
    mouseUp(e) {
      this.drag = false;
      this.middle = false;
    }
  
    mouseMove(e, controls) {
      if (this.middle) {
        this.controls.x += (e.pageX - this.old_x) / 100;
        this.controls.y -= (e.pageY - this.old_y) / 100;
        this.old_x = e.pageX;
        this.old_y = e.pageY;
        e.preventDefault();
        this.gui.updateDisplay();
        return;
      }
      if (!this.drag) return false;
      let dX = (-(e.pageX - this.old_x) * 2 * Math.PI) / this.canvas.width;
      let dY = (-(e.pageY - this.old_y) * 2 * Math.PI) / this.canvas.height;
  
      dX = radToDeg(dX);
      dY = radToDeg(dY);
  
      this.controls.theta = (this.controls.theta + dX) % 360;
      if (this.controls.phi + dY >= 0 && this.controls.phi + dY <= 180) {
        this.controls.phi += dY;
      }
  
      this.old_x = e.pageX;
      this.old_y = e.pageY;
      e.preventDefault();
      this.gui.updateDisplay();
    }
  
    mouseWheel(e, controls) {
      var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
      if (controls.distance - delta > 0) {
        controls.distance -= delta;
      }
      e.preventDefault();
      this.gui.updateDisplay();
    }
  }

  export { InputHandler };