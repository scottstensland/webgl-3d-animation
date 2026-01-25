

export const R = 0;
export const G = 1;
export const B = 2;
export const A = 3;

export const X = 0;
export const Y = 1;
export const Z = 2;
export const min = 3;
export const max = 4;
export const median = 5;

export const SIZE_DIM_3D = 3;
export const SIZE_DIM_COLORS = 4;

export const FLT_MAX = 99999.99;
export const FLT_MIN = -99999.99;

export const model_tiny = 0;
export const model_small = 1;
export const model_large = 2;
export const model_huge = 3;
export const model_monsterous = 4;

export function rotate_about_xyz_axis(rotate_axis, curr_point) {
  // http://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/3drota.htm

  let new_x;
  let new_y;
  let new_z;

  if (0.0 !== rotate_axis[X]) {
    new_y = curr_point.y * Math.cos(rotate_axis[X]) - curr_point.z * Math.sin(rotate_axis[X]);
    new_z = curr_point.y * Math.sin(rotate_axis[X]) + curr_point.z * Math.cos(rotate_axis[X]);
    new_x = curr_point.x;

    curr_point.x = new_x;
    curr_point.y = new_y;
    curr_point.z = new_z;
  }

  if (0.0 !== rotate_axis[Y]) {
    new_z = curr_point.z * Math.cos(rotate_axis[Y]) - curr_point.x * Math.sin(rotate_axis[Y]);
    new_x = curr_point.z * Math.sin(rotate_axis[Y]) + curr_point.x * Math.cos(rotate_axis[Y]);
    new_y = curr_point.y;

    curr_point.x = new_x;
    curr_point.y = new_y;
    curr_point.z = new_z;
  }

  if (0.0 !== rotate_axis[Z]) {
    new_x = curr_point.x * Math.cos(rotate_axis[Z]) - curr_point.y * Math.sin(rotate_axis[Z]);
    new_y = curr_point.x * Math.sin(rotate_axis[Z]) + curr_point.y * Math.cos(rotate_axis[Z]);
    new_z = curr_point.z;

    curr_point.x = new_x;
    curr_point.y = new_y;
    curr_point.z = new_z;
  }
}

export function negate_array(given_array) {
  const negated_array = [];
  const curr_length = given_array.length;

  for (let i = 0; i < curr_length; i++) {
    negated_array.push(-1.0 * given_array[i]);
  }
  return negated_array;
}

/**
 * Returns a random number between min and max inclusive
 */
export function get_random_in_range_inclusive_float(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min and max inclusive
 * Using Math.round() will give you a non-uniform distribution!
 */
export function get_random_in_range_inclusive_int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generate_random_sequence(size_sequence, min_value, max_value) {
  const random_sequence = [];

  for (let i = 0; i < size_sequence; i++) {
    random_sequence[i] = get_random_in_range_inclusive_int(min_value, max_value);
  }

  return random_sequence;
}

export function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function inner_pop_min_max(min_max, attrib, given_value) {
  if (min_max[attrib][min] > given_value) {
    min_max[attrib][min] = given_value;
  }
  if (min_max[attrib][max] < given_value) {
    min_max[attrib][max] = given_value;
  }

  min_max[attrib][median] = (min_max[attrib][max] + min_max[attrib][min]) / 2.0;

  if (min_max[min] > given_value) {
    min_max[min] = given_value;
  }
  if (min_max[max] < given_value) {
    min_max[max] = given_value;
  }
}

export function populate_min_max(min_max, curr_x, curr_y, curr_z) {
  inner_pop_min_max(min_max, X, curr_x);
  inner_pop_min_max(min_max, Y, curr_y);
  inner_pop_min_max(min_max, Z, curr_z);
}

export function init_min_max(given_min_max) {
  for (let curr_var of [X, Y, Z]) {
    const curr_min_max = [];

    curr_min_max[min] = 999;
    curr_min_max[max] = -999;

    given_min_max[curr_var] = curr_min_max;
  }

  given_min_max[min] = FLT_MAX;
  given_min_max[max] = FLT_MIN;
}




