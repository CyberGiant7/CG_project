import { isPowerOf2 } from "./mathUtils.js";

/**
 * Creates a 1-pixel texture with the specified pixel color.
 * 
 * @param {WebGLRenderingContext} gl - The WebGL rendering context.
 * @param {Array} pixel - The color of the pixel in RGBA format.
 * @returns {WebGLTexture} The created texture.
 */
function create1PixelTexture(gl, pixel) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(pixel));
  return texture;
}

/**
 * Creates a WebGL texture from the given URL.
 * @param {WebGLRenderingContext} gl - The WebGL rendering context.
 * @param {string} url - The URL of the image to load.
 * @returns {WebGLTexture} The created WebGL texture.
 */
function createTexture(gl, url) {
  const texture = create1PixelTexture(gl, [128, 192, 255, 255]); // Set a default color while we wait for the image to load

  // Asynchronously load an image
  const image = new Image();
  image.src = url;
  image.addEventListener("load", function () {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture so we can work with it
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flip the image's Y axis
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); // Copy the image to the texture

    // Check if the image is a power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) { 
      gl.generateMipmap(gl.TEXTURE_2D); // Yes, it's a power of 2. Generate mips.
    } else {
      // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  });
  return texture;
}

export { create1PixelTexture, createTexture };
