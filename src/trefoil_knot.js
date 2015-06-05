

var trefoil_knot_obj = function() {

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

var object_handle = {}; // holds all the various flavors of graphic object types

var animals_trefoil_knot  = "animals_trefoil_knot";

object_handle[animals_trefoil_knot] = {};

var all_object_labels = [];

all_object_labels.push(animals_trefoil_knot);


// ------------

function init_trefoil_knot(gl, given_max_num_trefoil_knot_points) {

    object_handle[animals_trefoil_knot].vertices = new Float32Array(given_max_num_trefoil_knot_points * SIZE_DIM_3D);
    object_handle[animals_trefoil_knot].colors   = new Float32Array(given_max_num_trefoil_knot_points * SIZE_DIM_COLORS);

    var min_max = [];

    Common_Utils.init_min_max(min_max);

    object_handle[animals_trefoil_knot].min_max = min_max;

    object_handle[animals_trefoil_knot].want_translate = true;
    // object_handle[animals_trefoil_knot].want_translate = false;

    object_handle[animals_trefoil_knot].pre_translate  = [  0.4,  2.2,  0.2];
    // object_handle[animals_trefoil_knot].pre_translate  = [  0.0,  0.0,  0.0];
    // object_handle[animals_trefoil_knot].pre_translate  = [  0.0,  0.0,  1.0];
    object_handle[animals_trefoil_knot].post_translate = Common_Utils.negate_array(object_handle[animals_trefoil_knot].pre_translate);
    // object_handle[animals_trefoil_knot].post_translate = [  0.0,  0.0,  0.0];
    // object_handle[animals_trefoil_knot].post_translate = [  0.0,  0.0,  0.0];

    // var object_base_offset = -0.5;
    var object_base_offset =  0.0;

    object_handle[animals_trefoil_knot].rotation_array = [-0.09, -0.08, 0.11];

    // ---

    var start_t = 0.0;
    var incr_t = 0.01;
    var max_t = 10;

    var ff = 1.0;

    var curr_trefoil_vertex = 0;
    var curr_trefoil_color_index = 0;

    var curr_x, curr_y, curr_z;

    for (var t = start_t; t < max_t; t += incr_t) { // http://en.wikipedia.org/wiki/Trefoil_knot

        curr_x = ff * (Math.sin(t) + 2.0*Math.sin(2.0*t));
        curr_y = ff * (Math.cos(t) - 2.0*Math.cos(2.0*t));
        curr_z = ff * (-Math.sin(3.0*t));

        // somehow handle given_max_num_trefoil_knot_points

        object_handle[animals_trefoil_knot].vertices[curr_trefoil_vertex*SIZE_DIM_3D + X] = curr_x;
        object_handle[animals_trefoil_knot].vertices[curr_trefoil_vertex*SIZE_DIM_3D + Y] = curr_y;
        object_handle[animals_trefoil_knot].vertices[curr_trefoil_vertex*SIZE_DIM_3D + Z] = curr_z;

        // console.log('curr_x ', curr_x, ' curr_y ', curr_y, ' curr_z ', curr_z);


        Common_Utils.populate_min_max(min_max, curr_x, curr_y, curr_z);

        curr_trefoil_vertex++;
    }

    // -------- now normalize knot from

    var diff_actual = min_max[max] - min_max[min];

    // console.log('min_max[max] ', min_max[max]);
    // console.log('min_max[min] ', min_max[min]);
    // console.log('diff_actual ', diff_actual);


    var offset_knot_x = object_handle[animals_trefoil_knot].pre_translate[0] + object_base_offset;    // move into translation N rotation
    var offset_knot_y = object_handle[animals_trefoil_knot].pre_translate[1] + object_base_offset;
    var offset_knot_z = object_handle[animals_trefoil_knot].pre_translate[2] + object_base_offset;


    // var offset_knot_x = 0.0;
    // var offset_knot_y = 0.0;
    // // var offset_knot_z = -5.0;
    // var offset_knot_z = 0.0;


    for (var curr_normalize_point = 0; curr_normalize_point < curr_trefoil_vertex; curr_normalize_point++) {

        // object_handle[animals_trefoil_knot].colors[curr_trefoil_color_index + R] = (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D +
        //                                                             X] / diff_actual);
        // object_handle[animals_trefoil_knot].colors[curr_trefoil_color_index + G] = (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D +
        //                                                             Y] / diff_actual);
        // object_handle[animals_trefoil_knot].colors[curr_trefoil_color_index + B] = (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D +
        //                                                             Z] / diff_actual);
        // object_handle[animals_trefoil_knot].colors[curr_trefoil_color_index + A] = 1.0;


        object_handle[animals_trefoil_knot].colors[curr_trefoil_color_index + R] = 1.0;
        object_handle[animals_trefoil_knot].colors[curr_trefoil_color_index + G] = 1.0;
        object_handle[animals_trefoil_knot].colors[curr_trefoil_color_index + B] = 1.0;
        object_handle[animals_trefoil_knot].colors[curr_trefoil_color_index + A] = 1.0;



        // object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + X] = 
        // (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + X] / (0.5*diff_actual)) + offset_knot_x;

        // object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Y] = 
        // (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Y] / (0.5*diff_actual)) + offset_knot_y;

        // object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Z] = 
        // (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Z] / (0.5*diff_actual)) + offset_knot_z;


        // object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + X] = 
        // (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + X] / diff_actual) + offset_knot_x;

        // object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Y] = 
        // (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Y] / diff_actual) + offset_knot_y;

        // object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Z] = 
        // (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Z] / diff_actual) + offset_knot_z;


        object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + X] = 
        (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + X] / diff_actual) + offset_knot_x;

        object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Y] = 
        (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Y] / diff_actual) + offset_knot_y;

        object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Z] = 
        (object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Z] / diff_actual) + offset_knot_z;



        // console.log('trefoil_knot ',
        //             object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + X],
        //             object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Y],
        //             object_handle[animals_trefoil_knot].vertices[curr_normalize_point*SIZE_DIM_3D + Z]
        //                 );


        curr_trefoil_color_index += SIZE_DIM_COLORS;
    }

    object_handle[animals_trefoil_knot].count = curr_trefoil_vertex;

    object_handle[animals_trefoil_knot].vertex_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_trefoil_knot].vertex_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_trefoil_knot].vertices, gl.STATIC_DRAW);
    object_handle[animals_trefoil_knot].vertex_position_buffer.itemSize = SIZE_DIM_3D;
    object_handle[animals_trefoil_knot].vertex_position_buffer.numItems = curr_trefoil_vertex;

    // ---

    object_handle[animals_trefoil_knot].vertex_color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_trefoil_knot].vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_trefoil_knot].colors, gl.STATIC_DRAW);
    object_handle[animals_trefoil_knot].vertex_color_buffer.itemSize = SIZE_DIM_COLORS;
    object_handle[animals_trefoil_knot].vertex_color_buffer.numItems = curr_trefoil_vertex;

}       //      init_trefoil_knot


var get_object_handle = function() {

    return object_handle;
}

var get_all_object_labels = function() {

    return all_object_labels;
}

return {    // to make visible to calling reference frame list function here

  init_trefoil_knot: init_trefoil_knot,
  get_object_handle : get_object_handle,
  get_all_object_labels : get_all_object_labels
};

}();    //  fns = function() 

