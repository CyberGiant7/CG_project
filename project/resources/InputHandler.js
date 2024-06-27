import { radToDeg } from "./mathUtils.js";

/**
 * Represents an input handler for handling keyboard and mouse/touch events.
 * @class
 */
class InputHandler {
	/**
	 * Constructs a new InputHandler object.
	 *
	 * @param {HTMLCanvasElement} canvas - The canvas element to handle input events on.
	 * @param {Object} controls - The controls object containing key mappings.
	 * @param {Object} gui - The GUI object for user interface controls.
	 */
	constructor(canvas, controls, gui) {
		/** @property {HTMLCanvasElement} canvas - The canvas element to handle input events on. */
		this.canvas = canvas;

		/** @property {Object} controls - The controls object containing key mappings. */
		this.controls = controls;

		/** @property {dat.GUI} gui - The GUI object for user interface controls. */
		this.gui = gui;

		/** @property {boolean} drag - Indicates if the mouse is being dragged. */
		this.drag = false;

		/** @property {boolean} middle - Indicates if the middle mouse button is being dragged. */
		this.middle = false;

		/** @property {number} old_x - The previous x-coordinate of the mouse. */
		this.old_x;

		/** @property {number} old_y - The previous y-coordinate of the mouse. */
		this.old_y;

		//////////////////////////////////////////// Keyboard and Mouse Event Handlers ////////////////////////////////////////////
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

		////////////////////////////////////////// Touch Event Handlers //////////////////////////////////////////

		this.canvas.addEventListener("touchstart", (e) => {
			if (e.touches.length == 1) {
				this.touchStart(e, controls);
			} else {
				this.twoFingerTouchStart(e, controls);
			}
		});

		this.canvas.addEventListener("touchmove", (e) => {
			if (e.touches.length == 1) {
				this.touchMove(e, controls);
			} else {
				this.twoFingerTouchMove(e, controls);
			}
		});
	}

	// change distance based on two finger touch
	twoFingerTouchStart(e, controls) {
		this.old_distance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY); // distance between two fingers

		e.preventDefault();
	}

	twoFingerTouchMove(e, controls) {
		let new_distance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY); // new distance between two fingers
		let delta = new_distance - this.old_distance; // change in distance
		if (controls.distance - delta > 0) {
			// if distance is greater than 0
			controls.distance -= delta; // change distance
		}
		this.old_distance = new_distance; // update old distance
		e.preventDefault();
		this.gui.updateDisplay(); // update GUI
	}

	touchStart(e, controls) {
		this.old_x = e.touches[0].pageX; // get x-coordinate of touch
		this.old_y = e.touches[0].pageY; // get y-coordinate of touch
		e.preventDefault(); // prevent default
	}

	touchMove(e, controls) {
		let dX = (-(e.touches[0].pageX - this.old_x) * 2 * Math.PI) / this.canvas.width; // change in x-coordinate
		let dY = (-(e.touches[0].pageY - this.old_y) * 2 * Math.PI) / this.canvas.height; // change in y-coordinate

		dX = radToDeg(dX); // convert to degrees
		dY = radToDeg(dY); // convert to degrees

		this.controls.theta = (this.controls.theta + dX) % 360; // update theta
		if (this.controls.phi + dY >= 0 && this.controls.phi + dY <= 180) {
			// if phi is between 0 and 180
			this.controls.phi += dY;
		}

		this.old_x = e.touches[0].pageX; // update old x-coordinate
		this.old_y = e.touches[0].pageY; // update old y-coordinate
		e.preventDefault();
		this.gui.updateDisplay(); // update GUI
	}

	keyboardInput(e, controls) {
		if (e.key == "w") {
			controls.z -= 1; // move forward
		} else if (e.key == "s") {
			controls.z += 1; // move backward
		} else if (e.key == "a") {
			controls.x += 1; // move left
		} else if (e.key == "d") {
			controls.x -= 1; // move right
		} else if (e.key == "q") {
			controls.y += 1; // move up
		} else if (e.key == "e") {
			controls.y -= 1; // move down
		}
		this.gui.updateDisplay();
	}

	mouseDown(e, controls) {
		this.drag = true; // set drag to true
 
		this.old_x = e.pageX; // get x-coordinate of mouse
		this.old_y = e.pageY; // get y-coordinate of mouse
		e.preventDefault(); // prevent default

		if (e.button == 1) {
			// if middle mouse button is clicked
			this.middle = true; // set middle to true
		}
		return false;
	}

	mouseUp(e) {
		this.drag = false; // set drag to false
		this.middle = false; // set middle to false
	}

	mouseMove(e, controls) {
		if (this.middle) {
			// if middle mouse button is clicked
			this.controls.x -= (e.pageX - this.old_x) / 50; // change x-coordinate
			this.controls.y += (e.pageY - this.old_y) / 50; // change y-coordinate
			this.old_x = e.pageX; 
			this.old_y = e.pageY;
			e.preventDefault();
			this.gui.updateDisplay();
			return;
		}
		if (!this.drag) return false;
		let dX = (-(e.pageX - this.old_x) * 2 * Math.PI) / this.canvas.width; // change in x-coordinate
		let dY = (-(e.pageY - this.old_y) * 2 * Math.PI) / this.canvas.height; // change in y-coordinate

		dX = radToDeg(dX); // convert to degrees
		dY = radToDeg(dY); // convert to degrees

		this.controls.theta = (this.controls.theta + dX) % 360; // update theta
		if (this.controls.phi + dY >= 0 && this.controls.phi + dY <= 180) { // if phi is between 0 and 180
			this.controls.phi += dY; // update phi
		}

		this.old_x = e.pageX; // update old x-coordinate
		this.old_y = e.pageY; // update old y-coordinate
		e.preventDefault();
		this.gui.updateDisplay(); // update GUI
	}

	mouseWheel(e, controls) {
		var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail)); // get change in distance
		if (controls.distance - delta > 0) { // if distance is greater than 0
			controls.distance -= delta; // change distance
		}
		e.preventDefault(); // prevent default
		this.gui.updateDisplay(); // update GUI
	}
}

export { InputHandler };
