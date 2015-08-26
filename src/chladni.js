

var chladni_obj = function() {

// ------------- below are CONSTANTS shared with other scripts ------------------ //

// https://physics.stackexchange.com/questions/90021/theory-behind-patterns-formed-on-chladni-plates
// Evan Grant: Making sound visible through cymatics ... see video on ted.com

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

var animals_chladni  = "animals_chladni";

object_handle[animals_chladni] = {};

var all_object_labels = [];

all_object_labels.push(animals_chladni);




// ------------

// function init_chladni(gl, given_max_num_chladni_points) {
var do_chladni = (function () {

    var max_num_chladni_points = null;

    var min_boundary = 0.0;

    var max_boundary = 3.0;
    // var max_boundary = 6.0;
    // var max_boundary = 10.0;
    // var max_boundary = 12.0;


    // var min_boundary = -10.0;
    // var max_boundary = 10.0;

    var maximum_acceptable_approx_to_zero = 0.4;
    // var maximum_acceptable_approx_to_zero = 0.1;

    var   maximum_attempts = 100;

    var min_max = [];

    // var object_base_offset = -0.5;
    var object_base_offset = -0.7;
    var curr_chladni_vertex = 0;
    var curr_chladni_color_index = 0;

    // return function (gl, given_max_num_chladni_points) {

    var a1 = 3.0;
    var a2 = 5.0;
    var a3 = 9.0;
    var a4 = 13.0;

    // var manage_vars = {

    //     a1 : 3.0,
    //     a2 : 5.0,
    //     a3 : 9.0,
    //     a4 : 13.0
    // };


    var manage_vars = [];

    manage_vars.push(3.0);
    manage_vars.push(5.0);
    manage_vars.push(9.0);
    manage_vars.push(13.0);

    var incr_var_pos = 0.1;
    var incr_var_neg = -0.1;

    return {

        reset_chladni : function() {

            manage_vars[0] = 3.0;
            manage_vars[1] = 5.0;
            manage_vars[2] = 9.0;
            manage_vars[3] = 13.0;

            console.log("chladni reset");
        },

        recalc_vars : function(manage_vars, this_key, lastMouseX, lastMouseY) {

            // console.log("this_key " + this_key);

            var flag_subtract = true;

            if (this_key > 0 && this_key < 9) {

                var index_vars = this_key % 4;

                if (this_key > 4) {

                    flag_subtract = false;
                }

                var curr_delta = (flag_subtract) ? incr_var_neg : incr_var_pos;

                manage_vars[index_vars] += curr_delta;

                // console.log("this_key " + this_key + " index_vars " + index_vars + " curr_delta " + curr_delta);
            }
        },

        update_chladni : function(this_key, lastMouseX, lastMouseY) {

            do_chladni.recalc_vars(manage_vars, this_key, lastMouseX, lastMouseY);

            a1 = manage_vars[0];
            a2 = manage_vars[1];
            a3 = manage_vars[2];
            a4 = manage_vars[3];

            var x;
            var y;
            var z = 0.0;

            // var curr_chladni_vertex = 0;
            curr_chladni_vertex = 0;
            curr_chladni_color_index = 0;


            var curr_approx_to_zero;
            var   curr_attempt;
            var best_approx_to_zero;

            do {

                x = Common_Utils.get_random_in_range_inclusive_float(min_boundary, max_boundary);
                y = Common_Utils.get_random_in_range_inclusive_float(min_boundary, max_boundary);

                best_approx_to_zero = FLT_MAX;
                curr_attempt = 0;

                do {

                    // z = Common_Utils.get_random_in_range_inclusive_float(min_boundary, max_boundary);
                    x = Common_Utils.get_random_in_range_inclusive_float(min_boundary, max_boundary);
                    y = Common_Utils.get_random_in_range_inclusive_float(min_boundary, max_boundary);

                    // curr_approx_to_zero = Math.sin( x * y) + Math.sin(y * z) + Math.sin(z * x);  // OK nice

                        //  0 = -(cos(x) + cos(y) + cos(z))

                    // curr_approx_to_zero = -Math.cos( x) + Math.cos(y) + Math.cos(z); // schwartz

                    // chladni
                    curr_approx_to_zero = (Math.sin( a1 * x) * Math.sin( a2 * y)) + 
                                          (Math.sin( a2 * x) * Math.sin( a1 * y)) -
                                          (Math.sin( a3 * x) * Math.sin( a4 * y)) - 
                                          (Math.sin( a4 * x) * Math.sin( a3 * y));

                    if (Math.abs(curr_approx_to_zero) < best_approx_to_zero) {

                        best_approx_to_zero = Math.abs(curr_approx_to_zero);
                    }

                } while (best_approx_to_zero > maximum_acceptable_approx_to_zero &&
                    curr_attempt++ < maximum_attempts);

                    //      fprintf(stdout, "%d  %d  X %f Y %f best_z_so_far %f best approx %f\n",
                    //              curr_chladni_vertex, curr_attempt, x, y, best_z_so_far, best_approx_to_zero
                    //              );

                if (curr_attempt < maximum_attempts) {

                    // console.log('curr_chladni_vertex ', curr_chladni_vertex);
                    // console.log('SIZE_DIM_3D ', SIZE_DIM_3D);
                    // console.log('Z ', Z);
                    // console.log('z ', z);

                    object_handle[animals_chladni].vertices[curr_chladni_vertex*SIZE_DIM_3D + X] = x;
                    object_handle[animals_chladni].vertices[curr_chladni_vertex*SIZE_DIM_3D + Y] = y;
                    object_handle[animals_chladni].vertices[curr_chladni_vertex*SIZE_DIM_3D + Z] = z;

                    Common_Utils.populate_min_max(min_max, x, y, z);

                    curr_chladni_vertex++;
                }

            } while (curr_chladni_vertex < max_num_chladni_points);

            // -------- now normalize chladni from

            var diff_actual = min_max[max] - min_max[min];

            var offset_chladni_x = object_handle[animals_chladni].pre_translate[0] + object_base_offset;    // move into translation N rotation
            var offset_chladni_y = object_handle[animals_chladni].pre_translate[1] + object_base_offset;
            var offset_chladni_z = object_handle[animals_chladni].pre_translate[2] + object_base_offset;

            for (var curr_normalize_point = 0; curr_normalize_point < curr_chladni_vertex; curr_normalize_point++) {

                object_handle[animals_chladni].colors[curr_chladni_color_index + R] = (object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D +
                                                                            X] / diff_actual);
                object_handle[animals_chladni].colors[curr_chladni_color_index + G] = (object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D +
                                                                            Y] / diff_actual);
                object_handle[animals_chladni].colors[curr_chladni_color_index + B] = (object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D +
                                                                            Z] / diff_actual);
                object_handle[animals_chladni].colors[curr_chladni_color_index + A] = 1.0;


                object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D + X] = 
                (object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D + X] / diff_actual) + offset_chladni_x;

                object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D + Y] = 
                (object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D + Y] / diff_actual) + offset_chladni_y;

                object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D + Z] = 
                (object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D + Z] / diff_actual) + offset_chladni_z;

                // console.log(object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D + X],
                //             object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D + Y],
                //             object_handle[animals_chladni].vertices[curr_normalize_point*SIZE_DIM_3D + Z]
                //                 );


                curr_chladni_color_index += SIZE_DIM_COLORS;
            }
        },

        init_chladni : function (gl, given_max_num_chladni_points) {

            max_num_chladni_points = given_max_num_chladni_points;

                                    //  sin(x y) + sin(y z) + sin(z x) = 0  // was schwartz 
                                    //  sin(x y) + sin(y z) + sin(z x) = 0  // chladni

            // ------- here are others yet to be implemented :

            // https://developer.mozilla.org/ms/demos/detail/3d-grapher-with-fullscreen
            //   z = cos(x*2)*cos(y*2)        http://www.math.uri.edu/~bkaskosz/flashmo/graph3d/
            //

            // ------- and another
            //
            // https://developer.mozilla.org/ms/demos/detail/implicit-equation-3d-grapher
            //  0 = -(cos(x) + cos(y) + cos(z))

            // ----------------------

            object_handle[animals_chladni].vertices = new Float32Array(max_num_chladni_points * SIZE_DIM_3D);
            object_handle[animals_chladni].colors   = new Float32Array(max_num_chladni_points * SIZE_DIM_COLORS);


            // var best_approx_to_zero;
            // var maximum_acceptable_approx_to_zero = 0.1;

            // var   maximum_attempts = 100;
            // var   curr_attempt;

            // var min_max = [];

            Common_Utils.init_min_max(min_max);

            // var object_handle[animals_chladni] = {};

            object_handle[animals_chladni].min_max = min_max;

            object_handle[animals_chladni].want_translate = true;
            // object_handle[animals_chladni].want_translate = false;

            // object_handle[animals_chladni].pre_translate  = [  1.5,  2.5,  1.5];
            // object_handle[animals_chladni].pre_translate  = [  1.5,  2.5,  0.5];
            // object_handle[animals_chladni].pre_translate  = [  1.5,  4.5,  0.5];
            // object_handle[animals_chladni].pre_translate  = [  1.0,  4.5,  0.5];
            // object_handle[animals_chladni].pre_translate  = [  1.0,  4.5,  0.0];
            // object_handle[animals_chladni].pre_translate  = [  1.0,  3.5,  0.0];

            // object_handle[animals_chladni].pre_translate  = [  2.0,  0.5,  -2.0];
            // object_handle[animals_chladni].pre_translate  = [  0.0,  0.0,  0.0];

            // object_handle[animals_chladni].pre_translate  = [  0.0,  3.0,  0.0];
            object_handle[animals_chladni].pre_translate  = [  0.0,  5.0,  0.0];
            object_handle[animals_chladni].post_translate = Common_Utils.negate_array(object_handle[animals_chladni].pre_translate);


            // object_handle[animals_chladni].rotation_array = [0.09, 0.08, -0.11];
            object_handle[animals_chladni].rotation_array = [0.19, -0.18, 0.11];

            // update logic was here

            do_chladni.update_chladni();

            // console.log("curr_chladni_vertex " + curr_chladni_vertex);

            // object_handle[animals_chladni].count = curr_chladni_vertex;
            object_handle[animals_chladni].count = max_num_chladni_points;



            object_handle[animals_chladni].vertex_position_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_chladni].vertex_position_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_chladni].vertices, gl.STATIC_DRAW);
            object_handle[animals_chladni].vertex_position_buffer.itemSize = SIZE_DIM_3D;
            object_handle[animals_chladni].vertex_position_buffer.numItems = max_num_chladni_points;

            // ---

            object_handle[animals_chladni].vertex_color_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_chladni].vertex_color_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_chladni].colors, gl.STATIC_DRAW);
            object_handle[animals_chladni].vertex_color_buffer.itemSize = SIZE_DIM_COLORS;
            object_handle[animals_chladni].vertex_color_buffer.numItems = max_num_chladni_points;
        }
    };

}());       //      init_chladni

var get_object_handle = function() {

    return object_handle;
};

var get_all_object_labels = function() {

    return all_object_labels;
};

return {    // to make visible to calling reference frame list function here

  // init_chladni : init_chladni,
  do_chladni            : do_chladni,
  get_object_handle     : get_object_handle,
  get_all_object_labels : get_all_object_labels
};

}();    //  chladni_obj = function() 

