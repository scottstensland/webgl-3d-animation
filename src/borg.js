

var borg_obj = function() {

// ------------- below are CONSTANTS shared with other scripts ------------------ //

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


// ---

var object_handle = {}; // holds all the various flavors of graphic object types

var animals_borg  = "animals_borg";

object_handle[animals_borg] = {};

var all_object_labels = [];

all_object_labels.push(animals_borg);


// ------------

function init_borg(gl, given_max_borg_points) {
                            //  http://paulbourke.net/geometry/borg/
                            //  sin(x y) + sin(y z) + sin(z x) = 0


    // ------- here are others yet to be implemented :


    // https://developer.mozilla.org/ms/demos/detail/3d-grapher-with-fullscreen
    //   z = cos(x*2)*cos(y*2)        http://www.math.uri.edu/~bkaskosz/flashmo/graph3d/
    //

    // ------- and another
    //
    // https://developer.mozilla.org/ms/demos/detail/implicit-equation-3d-grapher
    //  0 = -(cos(x) + cos(y) + cos(z))


    // ----------------------

    object_handle[animals_borg].vertices = new Float32Array(given_max_borg_points * SIZE_DIM_3D);
    object_handle[animals_borg].colors   = new Float32Array(given_max_borg_points * SIZE_DIM_COLORS);

    var min_borg = 0.0;
    var max_borg = 6.0;


    // var min_borg = -10.0;
    // var max_borg = 10.0;


    var curr_approx_to_zero;
    var best_approx_to_zero;
    var maximum_acceptable_approx_to_zero = 0.1;

    var   maximum_attempts = 100;
    var   curr_attempt;

    var min_max = [];

    Common_Utils.init_min_max(min_max);

    // var object_handle[animals_borg] = {};

    object_handle[animals_borg].min_max = min_max;

    object_handle[animals_borg].want_translate = true;
    // object_handle[animals_borg].want_translate = false;

    object_handle[animals_borg].pre_translate  = [  2.5,  3.5,  0.5];
    // object_handle[animals_borg].pre_translate  = [  0.5,  2.5,  0.5];
    object_handle[animals_borg].post_translate = Common_Utils.negate_array(object_handle[animals_borg].pre_translate);
    // object_handle[animals_borg].post_translate[Z] += 2.0;

    // console.log('object_handle[animals_borg].post_translate ', vec3.str(object_handle[animals_borg].post_translate));


    // object_handle[animals_borg].rotation_array = [-0.09, -0.08, 0.11];
    object_handle[animals_borg].rotation_array = [ 0.69, -0.8, 2.11];

    var borg_blob = {};


    borg_blob.translate_x = -1.0;
    borg_blob.translate_y =  0.0;
    borg_blob.translate_z =  0.0;


    var x;
    var y;
    var z;

    var curr_borg_vertex = 0;
    var curr_borg_color_index = 0;

    do {

        x = Common_Utils.get_random_in_range_inclusive_float(min_borg, max_borg);
        y = Common_Utils.get_random_in_range_inclusive_float(min_borg, max_borg);

        best_approx_to_zero = FLT_MAX;
        curr_attempt = 0;

        do {

            z = Common_Utils.get_random_in_range_inclusive_float(min_borg, max_borg);

            curr_approx_to_zero = Math.sin( x * y) + Math.sin(y * z) + Math.sin(z * x);  // OK nice

            // curr_approx_to_zero = -Math.cos( x) + Math.cos(y) + Math.cos(z); // very regular

                //  0 = -(cos(x) + cos(y) + cos(z))



            // if (fabs(curr_approx_to_zero) < best_approx_to_zero) {
            if (Math.abs(curr_approx_to_zero) < best_approx_to_zero) {

                // best_approx_to_zero = fabs(curr_approx_to_zero);
                best_approx_to_zero = Math.abs(curr_approx_to_zero);
            }

        } while (best_approx_to_zero > maximum_acceptable_approx_to_zero &&
            curr_attempt++ < maximum_attempts);

            //      fprintf(stdout, "%d  %d  X %f Y %f best_z_so_far %f best approx %f\n",
            //              curr_borg_vertex, curr_attempt, x, y, best_z_so_far, best_approx_to_zero
            //              );

        if (curr_attempt < maximum_attempts) {

            // console.log('curr_borg_vertex ', curr_borg_vertex);
            // console.log('SIZE_DIM_3D ', SIZE_DIM_3D);
            // console.log('Z ', Z);
            // console.log('z ', z);

            object_handle[animals_borg].vertices[curr_borg_vertex*SIZE_DIM_3D + X] = x;
            object_handle[animals_borg].vertices[curr_borg_vertex*SIZE_DIM_3D + Y] = y;
            object_handle[animals_borg].vertices[curr_borg_vertex*SIZE_DIM_3D + Z] = z;

            Common_Utils.populate_min_max(min_max, x, y, z);

            curr_borg_vertex++;
        }

    } while (curr_borg_vertex < given_max_borg_points);

    // -------- now normalize borg from

    var diff_actual = min_max[max] - min_max[min];

    var object_base_offset =  -0.5;
    var offset_borg_x = object_handle[animals_borg].pre_translate[0] + object_base_offset;    // move into translation N rotation
    var offset_borg_y = object_handle[animals_borg].pre_translate[1] + object_base_offset;
    var offset_borg_z = object_handle[animals_borg].pre_translate[2] + object_base_offset;

    // var offset_borg_x = object_handle[animals_borg].pre_translate[0] + borg_blob.translate_x;    // move into translation N rotation
    // var offset_borg_y = object_handle[animals_borg].pre_translate[1] + borg_blob.translate_y;
    // var offset_borg_z = object_handle[animals_borg].pre_translate[2] + borg_blob.translate_z;

    // var color_smasher = 0.4;
    var color_smasher = 1.0;

    for (var curr_normalize_point = 0; curr_normalize_point < curr_borg_vertex; curr_normalize_point++) {

        object_handle[animals_borg].colors[curr_borg_color_index + R] = color_smasher * (object_handle[animals_borg].vertices[curr_normalize_point*SIZE_DIM_3D +
                                                                    X] / diff_actual);
        object_handle[animals_borg].colors[curr_borg_color_index + G] = color_smasher * (object_handle[animals_borg].vertices[curr_normalize_point*SIZE_DIM_3D +
                                                                    Y] / diff_actual);
        object_handle[animals_borg].colors[curr_borg_color_index + B] = color_smasher * (object_handle[animals_borg].vertices[curr_normalize_point*SIZE_DIM_3D +
                                                                    Z] / diff_actual);
        object_handle[animals_borg].colors[curr_borg_color_index + A] = 1.0;


        object_handle[animals_borg].vertices[curr_normalize_point*SIZE_DIM_3D + X] = 
        (object_handle[animals_borg].vertices[curr_normalize_point*SIZE_DIM_3D + X] / diff_actual) + offset_borg_x;

        object_handle[animals_borg].vertices[curr_normalize_point*SIZE_DIM_3D + Y] = 
        (object_handle[animals_borg].vertices[curr_normalize_point*SIZE_DIM_3D + Y] / diff_actual) + offset_borg_y;

        object_handle[animals_borg].vertices[curr_normalize_point*SIZE_DIM_3D + Z] = 
        (object_handle[animals_borg].vertices[curr_normalize_point*SIZE_DIM_3D + Z] / diff_actual) + offset_borg_z;

        curr_borg_color_index += SIZE_DIM_COLORS;
    }

    object_handle[animals_borg].count = curr_borg_vertex;

    object_handle[animals_borg].vertex_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_borg].vertex_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_borg].vertices, gl.STATIC_DRAW);
    object_handle[animals_borg].vertex_position_buffer.itemSize = SIZE_DIM_3D;
    object_handle[animals_borg].vertex_position_buffer.numItems = curr_borg_vertex;

    // ---

    object_handle[animals_borg].vertex_color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_borg].vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_borg].colors, gl.STATIC_DRAW);
    object_handle[animals_borg].vertex_color_buffer.itemSize = SIZE_DIM_COLORS;
    object_handle[animals_borg].vertex_color_buffer.numItems = curr_borg_vertex;

}       //      init_borg


var get_object_handle = function() {

    return object_handle;
}

var get_all_object_labels = function() {

    return all_object_labels;
}

return {    // to make visible to calling reference frame list function here

    init_borg             : init_borg,
    get_object_handle     : get_object_handle,
    get_all_object_labels : get_all_object_labels
};

}();    //  fns = function() 

