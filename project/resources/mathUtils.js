/**
 * Converts degrees to radians.
 *
 * @param {number} degrees - The angle in degrees.
 * @returns {number} The angle in radians.
 */
function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 *
 * @param {number} r - The angle in radians.
 * @returns {number} The angle in degrees.
 */
function radToDeg(r) {
  return (r * 180) / Math.PI;
}

/**
 * Subtracts two 2D vectors.
 *
 * @param {number[]} a - The first vector.
 * @param {number[]} b - The second vector.
 * @returns {number[]} The resulting vector after subtracting `b` from `a`.
 */
function subtractVector2(a, b) {
  return a.map((v, ndx) => v - b[ndx]);
}

/**
 * Checks if a given value is a power of 2.
 *
 * @param {number} value - The value to check.
 * @returns {boolean} Returns true if the value is a power of 2, otherwise returns false.
 */
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

/**
 * Generates tangents for a given set of positions, texture coordinates, and indices.
 * @param {number[]} position - The array of vertex positions.
 * @param {number[]} texcoord - The array of texture coordinates.
 * @param {number[]} [indices] - The array of vertex indices (optional).
 * @returns {number[]} The array of tangents.
 */
function generateTangents(position, texcoord, indices) {
  const getNextIndex = indices ? makeIndexIterator(indices) : makeUnindexedIterator(position);
  const numFaceVerts = getNextIndex.numElements;
  const numFaces = numFaceVerts / 3;

  const tangents = [];
  for (let i = 0; i < numFaces; ++i) {
    const n1 = getNextIndex();
    const n2 = getNextIndex();
    const n3 = getNextIndex();

    const p1 = position.slice(n1 * 3, n1 * 3 + 3);
    const p2 = position.slice(n2 * 3, n2 * 3 + 3);
    const p3 = position.slice(n3 * 3, n3 * 3 + 3);

    const uv1 = texcoord.slice(n1 * 2, n1 * 2 + 2);
    const uv2 = texcoord.slice(n2 * 2, n2 * 2 + 2);
    const uv3 = texcoord.slice(n3 * 2, n3 * 2 + 2);

    const dp12 = m4.subtractVectors(p2, p1);
    const dp13 = m4.subtractVectors(p3, p1);

    const duv12 = subtractVector2(uv2, uv1);
    const duv13 = subtractVector2(uv3, uv1);

    const f = 1.0 / (duv12[0] * duv13[1] - duv13[0] * duv12[1]);
    const tangent = Number.isFinite(f)
      ? m4.normalize(m4.scaleVector(m4.subtractVectors(m4.scaleVector(dp12, duv13[1]), m4.scaleVector(dp13, duv12[1])), f))
      : [1, 0, 0];

    tangents.push(...tangent, ...tangent, ...tangent);
  }

  return tangents;
}

/**
 * Creates an iterator function that returns elements from the given indices array.
 *
 * @param {number[]} indices - The array of indices.
 * @returns {Function} - The iterator function.
 */
function makeIndexIterator(indices) {
  let ndx = 0;
  const fn = () => indices[ndx++];
  fn.reset = () => {
    ndx = 0;
  };
  fn.numElements = indices.length;
  return fn;
}

/**
 * Creates an unindexed iterator function based on the given positions array.
 * @param {number[]} positions - The positions array.
 * @returns {Function} - The unindexed iterator function.
 */
function makeUnindexedIterator(positions) {
  let ndx = 0;
  const fn = () => ndx++;
  fn.reset = () => {
    ndx = 0;
  };
  fn.numElements = positions.length / 3;
  return fn;
}

export { degToRad, radToDeg, generateTangents, isPowerOf2 };
