

var Common_Utils = function() {

var R = 0;
var G = 1;
var B = 2;
var A = 3;

var X = 0;
var Y = 1;
var Z = 2;
var min = 3;
var max = 4;
var median = 5;

var SIZE_DIM_3D = 3;
var SIZE_DIM_COLORS = 4;

var FLT_MAX = 99999.99;
var FLT_MIN = -99999.99;

var model_tiny  = 0;
var model_small = 1;
var model_large = 2;
var model_huge  = 3;
var model_monsterous = 4;

function rotate_about_xyz_axis(rotate_axis, curr_point) {

    // http://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/3drota.htm

    var new_x;
    var new_y;
    var new_z;

    if (0.0 != rotate_axis[X]) {

        // console.log('we want to rotate about X axis');

        new_y = curr_point.y * Math.cos(rotate_axis[X]) - curr_point.z * Math.sin(rotate_axis[X]);
        new_z = curr_point.y * Math.sin(rotate_axis[X]) + curr_point.z * Math.cos(rotate_axis[X]);
        new_x = curr_point.x;

        curr_point.x = new_x;
        curr_point.y = new_y;
        curr_point.z = new_z;
    }

    if (0.0 != rotate_axis[Y]) {

        // console.log('we want to rotate about Y axis');

        new_z = curr_point.z * Math.cos(rotate_axis[Y]) - curr_point.x * Math.sin(rotate_axis[Y]);
        new_x = curr_point.z * Math.sin(rotate_axis[Y]) + curr_point.x * Math.cos(rotate_axis[Y]);
        new_y = curr_point.y;

        curr_point.x = new_x;
        curr_point.y = new_y;
        curr_point.z = new_z;
    }

    if (0.0 != rotate_axis[Z]) {

        // console.log('we want to rotate about Z axis');

        new_x = curr_point.x * Math.cos(rotate_axis[Z]) - curr_point.y * Math.sin(rotate_axis[Z]);
        new_y = curr_point.x * Math.sin(rotate_axis[Z]) + curr_point.y * Math.cos(rotate_axis[Z]);
        new_z = curr_point.z;

        curr_point.x = new_x;
        curr_point.y = new_y;
        curr_point.z = new_z;
    }
}


function negate_array(given_array) {

    var negated_array = [];

    var curr_length = given_array.length;

    // console.log('fff curr_length ', curr_length);

    for (var i = 0; i < curr_length; i++) {

        negated_array.push( -1.0 * given_array[i] );
    }
    return negated_array;
}





/*
function mvPushMatrix(given_mvMatrix, given_mvMatrixStack) {
    var copy = mat4.create();
    mat4.set(given_mvMatrix, copy);
    given_mvMatrixStack.push(copy);
}

function mvPopMatrix(given_mvMatrix, given_mvMatrixStack) {
    if (given_mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    given_mvMatrix = given_mvMatrixStack.pop();
}
*/

/**
 * Returns a random number between min and max inclusive   Common_Utils.get_random_in_range_inclusive_float
 */
function get_random_in_range_inclusive_float (min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min and max inclusive 
 * Using Math.round() will give you a non-uniform distribution!
 */
function get_random_in_range_inclusive_int (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



function generate_random_sequence(size_sequence, min_value, max_value) {

    // pre synthesize this ONCE then loop across during real time execution fo speed

    var random_sequence = [];

    for (var i = 0; i < size_sequence; i++) {

        random_sequence[i] = get_random_in_range_inclusive_int(min_value, max_value);
    }

    return random_sequence;
}



/*
function populate_namespace(given_constant_obj) {

    // -------- put shared CONSTANTS here ------------- //

    given_constant_obj.R = 0;
    given_constant_obj.G = 1;
    given_constant_obj.B = 2;
    given_constant_obj.A = 3;


    given_constant_obj.X = 0;
    given_constant_obj.Y = 1;
    given_constant_obj.Z = 2;
    given_constant_obj.min = 3;
    given_constant_obj.max = 4;
    given_constant_obj.median = 5;

    given_constant_obj.SIZE_DIM_3D = 3;
    given_constant_obj.SIZE_DIM_COLORS = 4;
};
*/


function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

// ---

function inner_pop_min_max(min_max, attrib, given_value) {

    if (min_max[attrib][min] > given_value) {
        min_max[attrib][min] = given_value;
    }
    if (min_max[attrib][max] < given_value) {
        min_max[attrib][max] = given_value;
    }

    min_max[attrib][median] = (min_max[attrib][max] + min_max[attrib][min])/2.0;

    // ---------- now calc overall min N max

    if (min_max[min] > given_value) {
        min_max[min] = given_value;
    }
    if (min_max[max] < given_value) {
        min_max[max] = given_value;
    }
}

function populate_min_max(min_max, curr_x, curr_y, curr_z) {

    inner_pop_min_max(min_max, X, curr_x);
    inner_pop_min_max(min_max, Y, curr_y);
    inner_pop_min_max(min_max, Z, curr_z);
}

function init_min_max(given_min_max) {

    for (var curr_var in [X, Y, Z]) {

        var curr_min_max = [];

        curr_min_max[min] = 999;
        curr_min_max[max] = -999;

        given_min_max[curr_var] = curr_min_max;
    }

    // -------

    given_min_max[min] = FLT_MAX;
    given_min_max[max] = FLT_MIN;
}

return {

  get_random_in_range_inclusive_float: get_random_in_range_inclusive_float,
  get_random_in_range_inclusive_int:   get_random_in_range_inclusive_int,
  degToRad: degToRad,
  init_min_max: init_min_max,
  populate_min_max: populate_min_max,
  // mvPushMatrix: mvPushMatrix,
  // mvPopMatrix: mvPopMatrix,
  generate_random_sequence: generate_random_sequence,
  model_tiny: model_tiny,
  model_small: model_small,
  model_tiny: model_tiny,
  model_large: model_large,
  model_huge: model_huge,
  model_monsterous: model_monsterous,
  negate_array: negate_array,
  rotate_about_xyz_axis: rotate_about_xyz_axis


};

}();




