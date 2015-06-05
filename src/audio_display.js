

var audio_display_obj = function() {

/*

    Questions during web audio workshop Harvestworks 

    1 - how to access raw PCM audio from mp3 in real time in sync with playback 
        instead of entire mp3 audio buffer in one pop from XMLHttpRequest onload callback

    2 - how to coordinate audio playback with visualization in sync


    ------------ todo ----------------

    http://paulbourke.net/fractals/peterdejong/

*/


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

var FLT_MAX = 999.99;
var FLT_MIN = -999.99;

var object_handle = {}; // holds all the various flavors of graphic object types

// var animals_audio_vis = {};
// var animals_fft = {};           // audio frequency domain display on surface of tall rotating cylinder
// var animals_time_curve = {};    // audio time domain curve display on surface of squat rotating cylinder

var animals_audio_vis  = "animals_audio_vis";
var animals_fft        = "animals_fft";
var animals_time_curve = "animals_time_curve";

object_handle[animals_audio_vis] = {};
object_handle[animals_fft] = {};
object_handle[animals_time_curve] = {};

var all_object_labels = [];

all_object_labels.push(animals_audio_vis);
all_object_labels.push(animals_fft);
all_object_labels.push(animals_time_curve);

var curr_bucket_depth = 0;

var MAX_NUM_COLUMNS_FFT_CYLINDER = 0;
var MAX_NUM_ROWS_FFT_CYLINDER = 0;

var max_number_rows_time_domain_cylinder;
var max_num_columns_time_domain_cylinder;


// ---


var max_cylinder_time_domain_columns;   // when cylinder is vertical like a coke can its # vertical columns
var max_cylinder_time_domain_rows;      // number of hoops surrounding cylinder like its wearing many belts

// ---

var num_indices_per_vertex = 6; // two triangles per facet
var num_indices_per_time_domain_vertex = 2; // during draw curve of audio across time domain

// ---

var BUFF_SIZE;
var sample_depth;
var BUFF_SIZE_TIME_DOMAIN;

// ---

var object_base_offset = 0.5;   // one half since object is normalized from 0<-->1 so its middle is 1/2

var curr_fft_color_index = 0;
// var curr_vertex_index = 0;

// var seed_color = 0.3;
var seed_color = 0.0;
var seed_incr_color;

var x;
var y;
var z;

var factor_x = 2.0; // size of object in x dim
var factor_z = 2.0; // size of object in z dim

// ---

var curr_fft_row = 0;
// var curr_fft_bucket = 0;

var max_fft_value_seen = 0;
var min_fft_value_seen = 9999;

// ---

var curr_time_domain_row = 0;

// ---

var time_domain_min_x = -1.0;
var time_domain_min_y =  2.0;
var time_domain_min_z =  0.5;

var time_domain_max_x =  4.0;
var time_domain_max_y =  2.0;
var time_domain_max_z =  1.50;

var time_domain_delta_x = time_domain_max_x - time_domain_min_x;
var time_domain_delta_y = time_domain_max_y - time_domain_min_y;
var time_domain_delta_z = time_domain_max_z - time_domain_min_z;

// var time_domain_median_y = time_domain_min_y + time_domain_delta_y / 2.0;
var time_domain_median_z = time_domain_min_z + time_domain_delta_z / 2.0;

// console.log('time_domain_delta_x ', time_domain_delta_x);

// ---

// var count_num_time_domain_show = 0;

// var desired_synth_buff_size;

function draw_time_domain(given_audio_buffer, given_buffer_size) {

    // stens TODO - synthesize a new cylinder onto which to draw time domain
    //              except draw on cylinder standing upright NOT lying down as in FFT draw

    // if given_buffer_size > BUFF_SIZE then iterate across in BUFF_SIZE bite sizes

    // console.log('just inside time domain draw');


// console.log('\n\ncw + ss   wed   1243   \n\n');

    // bbb

    

    var curr_x = time_domain_min_x;
    var curr_y = time_domain_min_y;
    var curr_z = time_domain_min_z;

    var incr_x = time_domain_delta_x / given_buffer_size;
    var incr_y = time_domain_delta_y / given_buffer_size;
    var incr_z = time_domain_delta_z / given_buffer_size;

    var curr_vertex_index = 0;
    var curr_color_index = 0;
    var curr_indices_index = 0;

    for (var curr_bucket = 0; curr_bucket < given_buffer_size; curr_bucket++) {

        object_handle[animals_audio_vis].vertices[curr_vertex_index + X] = curr_x;
        object_handle[animals_audio_vis].vertices[curr_vertex_index + Y] = curr_y;
        object_handle[animals_audio_vis].vertices[curr_vertex_index + Z] = time_domain_median_z + given_audio_buffer[curr_bucket];


        object_handle[animals_audio_vis].colors[curr_color_index + R] = 0.0;
        object_handle[animals_audio_vis].colors[curr_color_index + G] = 0.0;
        object_handle[animals_audio_vis].colors[curr_color_index + B] = 1.0;
        object_handle[animals_audio_vis].colors[curr_color_index + B] = 1.0;

        // if (count_num_time_domain_show < 1) {

        //     // console.log('CCC ', curr_bucket,
        //     //             animals_audio_vis.vertices[curr_vertex_index + X], 
        //     //             animals_audio_vis.vertices[curr_vertex_index + Y],
        //     //             animals_audio_vis.vertices[curr_vertex_index + Z]);
        // }

        if (0 < curr_bucket) {

            object_handle[animals_audio_vis].indices[curr_indices_index++] = curr_bucket - 1;
            object_handle[animals_audio_vis].indices[curr_indices_index++] = curr_bucket;
        }

        curr_vertex_index += SIZE_DIM_3D;
        curr_color_index += SIZE_DIM_COLORS;

        curr_x += incr_x;
        curr_y += incr_y;
    }

    // count_num_time_domain_show++;

}       //      draw_time_domain

// var max_size_buffer_time_domain = 0;  // as we add vertex to render billboard increment this until reaches max

var max_color_index_time_domain;
var max_color_index_frequency_domain;

var curr_buffer_index_render_time_domain = 0;

var curr_buffer_to_render_time_domain;

// var max_index_to_render_this_update = 50;   // some fraction of total buffer size to render per update chronos
// var max_index_to_render_this_update = 150;   // some fraction of total buffer size to render per update chronos
var max_index_to_render_this_update;   // some fraction of total buffer size to render per update chronos

var curr_color_index_time_domain = 0;

var incr_time_domain_render = 1;

var keep_showing_billboard_errors = true;

var is_time_domain_ready = false;

function update_billboard() {       // refreshes time domain cylinder

    if (false === is_time_domain_ready) {

        return;
    }

    if (webaudio_tooling_obj.get_was_anything_stopped()) {

        return; // some audio source was stopped so avoid changing time domain cylinder
    }

    for (var curr_chronos = 0; curr_chronos < max_index_to_render_this_update; curr_chronos++) {

        var curr_value = curr_buffer_to_render_time_domain[curr_buffer_index_render_time_domain];

        // ---

        var black_out_index = curr_color_index_time_domain;

        for (var curr_bucket = 0; curr_bucket < max_number_rows_time_domain_cylinder; curr_bucket++) {

            object_handle[animals_time_curve].colors[black_out_index + R] = 0.0;
            object_handle[animals_time_curve].colors[black_out_index + G] = 0.0;
            object_handle[animals_time_curve].colors[black_out_index + B] = 0.0;
            object_handle[animals_time_curve].colors[black_out_index + A] = 1.0;

            black_out_index  += SIZE_DIM_COLORS;
        }

        // if (! (black_out_index < max_color_index_time_domain)) {
        if (black_out_index >= max_color_index_time_domain) {

            black_out_index = 0;   // wrap row back to beginning
        }

        // ---

        var display_value = SIZE_DIM_COLORS * Math.floor(max_number_rows_time_domain_cylinder * (1.0 + curr_value) / 2.0);

        object_handle[animals_time_curve].colors[curr_color_index_time_domain + display_value + R] = 1.0;
        object_handle[animals_time_curve].colors[curr_color_index_time_domain + display_value + G] = 0.0;
        object_handle[animals_time_curve].colors[curr_color_index_time_domain + display_value + B] = 0.0;
        object_handle[animals_time_curve].colors[curr_color_index_time_domain + display_value + A] = 1.0;

        curr_color_index_time_domain += max_number_rows_time_domain_cylinder * SIZE_DIM_COLORS;

        // if (! (curr_color_index_time_domain < max_color_index_time_domain)) {
        if (curr_color_index_time_domain >= max_color_index_time_domain) {

            curr_color_index_time_domain = 0;   // wrap row back to beginning
        }

        curr_buffer_index_render_time_domain++;
        if (curr_buffer_index_render_time_domain >= BUFF_SIZE_TIME_DOMAIN) {

            curr_buffer_index_render_time_domain = 0;

        } else {
            // console.log('NO need to slow down time domain render ... was at ', curr_buffer_index_render_time_domain,
            //                 ' with max_index_to_render_this_update of ', max_index_to_render_this_update);
        }
    }
}       //      update_billboard

var keep_showing_pipeline_post_errors = true;

var decimation_counter = 0;

// console.log('cw + ss tuesday 145pm');

function show_buffer(given_buffer, given_buffer_size) {

    var buff_length = given_buffer.length;

    if (buff_length != given_buffer_size) {

        var err_msg = 'ERROR - mismatch on show_buffer on buff size';

        console.log(err_msg);
        alert(err_msg);
    }

    for (var curr_index = 0; curr_index < buff_length; curr_index++) {

        console.log(curr_index, given_buffer[curr_index]);
    }
}

// var aggregate_buffer_size = 0;

// var sampled_buffer;
// var running_sampled_offset = 0; // count in bytes size buffer already set into sampled buffer storage

// var continue_sampling = true;

// vvv

function pipeline_buffer_for_time_domain_cylinder(given_audio_buffer, given_buffer_size, providence) {

    audio_process_obj.perform_sampling(given_audio_buffer, given_buffer_size, providence);

    // draw flat time domain wall of audio curve
    draw_time_domain(given_audio_buffer, given_buffer_size);


    // console.log('pipeline_buffer_for_time_domain_cylinder given_buffer_size ',
    //     given_buffer_size, ' providence ', providence);

    // audio_vis_obj.allocate_local_buffer(buffer.length); // stens TODO avoid when streaming

    // if (! curr_buffer_to_render_time_domain) {

    //     curr_buffer_to_render_time_domain = new Float32Array(given_buffer_size);

    //     console.log('just allocated curr_buffer_to_render_time_domain given_buffer_size ', given_buffer_size);
    // }

    // stens TODO - verify we consume prior buffer before getting wiped over by below

    // console.log('in billboard with length given_audio_buffer ', given_audio_buffer.length,
    //     ' given_buffer_size ', given_buffer_size);

    curr_buffer_to_render_time_domain.set(given_audio_buffer); // copy buffer into time domain render buffer

    is_time_domain_ready = true;


    // console.log('length of curr_buffer_to_render_time_domain  ',  curr_buffer_to_render_time_domain.length);


    // var max_value = FLT_MIN;
    // var min_value = FLT_MAX;

    // var curr_value;
    // for (var curr_index = 0; curr_index < given_buffer_size; curr_index++) {

    //     curr_value = given_audio_buffer[curr_index];

    //     if ( -1.0 > curr_value || 1.0 < curr_value) {

    //         curr_value = 0.0;
    //     }

    //     if (curr_value < min_value) {

    //         min_value = curr_value;
    //     }
    //     if (curr_value > max_value) {

    //         max_value = curr_value;
    //     }

    //     curr_buffer_to_render_time_domain[curr_index] = curr_value;
    // }

    // console.log('in PIPE max value ', max_value, ' min value ', min_value);

    // ---  remove below when OK - stens TODO 

    // for (var curr_index = 0; curr_index < given_buffer_size; curr_index++) {

    //     curr_value = curr_buffer_to_render_time_domain[curr_index];

    //     if ( -1.0 > curr_value || 1.0 < curr_value) {

    //         if (keep_showing_pipeline_post_errors) {

    //             console.log('ERROR - post SET found NaN for providence ', providence, 
    //                             ' curr_index ', curr_index, ' curr_value ', curr_value);

    //             keep_showing_pipeline_post_errors = false;
    //         }

    //         curr_buffer_to_render_time_domain[curr_index] = 0.0;
    //     }

    //     if (decimation_counter % 300 == 0)  {

    //         console.log('decimation providence ', providence, curr_value);
    //     }

    //     decimation_counter++;
    // }

    // ---  remove above when OK - stens TODO 

    // console.log('in billboard  length curr_buffer_to_render_time_domain ', curr_buffer_to_render_time_domain.length);

    if (curr_buffer_index_render_time_domain !== 0) {

        // console.log('need to speed up time domain render ... was at ', curr_buffer_index_render_time_domain,
        //     ' with max_index_to_render_this_update of ', max_index_to_render_this_update);

        // max_index_to_render_this_update += incr_time_domain_render;

    } else {

        // console.log('NO need to speed up time domain render ... was at ', curr_buffer_index_render_time_domain,
        //     ' with max_index_to_render_this_update of ', max_index_to_render_this_update);

    }
    // curr_buffer_index_render_time_domain = 0;

    // is_billboard_active = true;

    // console.log('about to check on synth STOP');

    // if (true == source_audio_obj.get_is_synth_audio_active() && 
    //     false == audio_process_obj.get_sampling_state()) {

    //    

    //     console.log('sampling is DONE so stop synth');

    //     source_audio_obj.stop_synth();
    // }

}       //      pipeline_buffer_for_time_domain_cylinder
          
// ---

function update_one_row(given_array) {  // FFT cylinder

    var bucket_color_factor = 255.0;

    max_fft_value_seen = 0;
    min_fft_value_seen = 9999;

    // bbb

    // curr_color_index = curr_fft_row*MAX_NUM_ROWS_FFT_CYLINDER*SIZE_DIM_COLORS;

    for (var curr_bucket = 0; curr_bucket < MAX_NUM_ROWS_FFT_CYLINDER; curr_bucket++) {

        // if (curr_bucket % 20 == 0) {

        //     console.log('fft value ', curr_bucket, given_array[curr_bucket]);
        // }

        object_handle[animals_fft].colors[curr_fft_color_index + R] = given_array[curr_bucket] / bucket_color_factor;
        object_handle[animals_fft].colors[curr_fft_color_index + G] = 1.0 / (bucket_color_factor - given_array[curr_bucket]);
        object_handle[animals_fft].colors[curr_fft_color_index + B] = bucket_color_factor / given_array[curr_bucket];
        object_handle[animals_fft].colors[curr_fft_color_index + A] = 1.0;

        if (given_array[curr_bucket] > max_fft_value_seen) {

            max_fft_value_seen = given_array[curr_bucket];
        }

        if (given_array[curr_bucket] < min_fft_value_seen) {

            min_fft_value_seen = given_array[curr_bucket];
        }

        curr_fft_color_index  += SIZE_DIM_COLORS;
    }

    // curr_fft_row++; // advance to next row for followup call to this same function

    // if (! (curr_fft_row < MAX_NUM_COLUMNS_FFT_CYLINDER)) {

    //     curr_fft_row = 0;   // wrap row back to beginning
    // }


    // from 0 to 255
    // console.log('min_fft_value_seen ', min_fft_value_seen, ' max_fft_value_seen ', max_fft_value_seen);


    // if (! (curr_fft_color_index < max_color_index_frequency_domain)) {
    if (curr_fft_color_index >= max_color_index_frequency_domain) {

        curr_fft_color_index = 0;   // wrap row back to beginning

        // console.log('min_fft_value_seen ', min_fft_value_seen, ' max_fft_value_seen ', max_fft_value_seen);
    }

}       //      update_one_row

function synthesize_cylinder(given_animal_obj, cylinder_blob) {

    // ---    http://math.stackexchange.com/questions/73237/parametric-equation-of-a-circle-in-3d-space

    // console.log('CCC cylinder_blob.num_columns   ', cylinder_blob.num_columns);
    // console.log('WWW cylinder_blob.num_rows    ', cylinder_blob.num_rows);

    // create two points on axis at center line of cylinder

    var vec3_p1 = vec3.create();
    var vec3_p2 = vec3.create();

    vec3.set(vec3_p1,  0.0, 0.0, 0.0);  // point 1 along center line axis of cylinder of all circles
    vec3.set(vec3_p2,  cylinder_blob.cyl_height, 0.0, 0.0);  // point 2 along center line axis of cylinder of all circles

    // create vector along cylinder axis

    // ---  http://paulbourke.net/geometry/pointlineplane/

    var vec3_pa1 = vec3.create();
    vec3.set(vec3_pa1, 0.0, 0.0, -1.0);

    var vec3_va1 = vec3.create();
    vec3.subtract(vec3_va1, vec3_pa1, vec3_p1);
    vec3.normalize(vec3_va1, vec3_va1);

    // ---

    var vec3_pa2 = vec3.create();
    vec3.set(vec3_pa2, cylinder_blob.cyl_height, 0.0, -1.0);

    var vec3_va2 = vec3.create();
    vec3.subtract(vec3_va2, vec3_pa2, vec3_p2);
    vec3.normalize(vec3_va2, vec3_va2);

    // ---

    var vec3_pb1 = vec3.create();
    vec3.set(vec3_pb1, 0.0, 1.0, 0.0);

    var vec3_vb1 = vec3.create();
    vec3.subtract(vec3_vb1, vec3_pb1, vec3_p1);
    vec3.normalize(vec3_vb1, vec3_vb1);

    // ---

    var vec3_pb2 = vec3.create();
    vec3.set(vec3_pb2, cylinder_blob.cyl_height, 1.0, 0.0);

    var vec3_vb2 = vec3.create();
    vec3.subtract(vec3_vb2, vec3_pb2, vec3_p2);
    vec3.normalize(vec3_vb2, vec3_vb2);

    // ---

    var incr_parametric = 1.0 / cylinder_blob.num_rows;

    var curr_c = vec3.create();
    var curr_va = vec3.create();
    var curr_vb = vec3.create();

    // ---

    var num_spokes = cylinder_blob.num_columns;
    var num_radians_per_circle = 2.0 * Math.PI;
    var angle_incr = num_radians_per_circle / num_spokes;

    var curr_vertex_index = 0;
    var curr_color_index = 0;

    var x, y, z;

    // ---

    var min_max = [];   // will hold min/max of x y z

    Common_Utils.init_min_max(min_max);

    given_animal_obj.min_max = min_max;

    var curr_spoke = 0;

    for (var curr_angle = 0; curr_angle < num_radians_per_circle; curr_angle += angle_incr) {

        var curr_bucket_slot = 0;

        for (var curr_parametric_u = 0.0; curr_parametric_u < 1.0; curr_parametric_u += incr_parametric) {

            // ---

            vec3.lerp(curr_c, vec3_p2, vec3_p1, curr_parametric_u);

            vec3.lerp(curr_va, vec3_va2, vec3_va1, curr_parametric_u);
            vec3.lerp(curr_vb, vec3_vb2, vec3_vb1, curr_parametric_u);

            // ------------

            x = curr_c[X] + 
                cylinder_blob.radius * Math.cos(curr_angle) * curr_va[X] + 
                cylinder_blob.radius * Math.sin(curr_angle) * curr_vb[X];

            y = curr_c[Y] + 
                cylinder_blob.radius * Math.cos(curr_angle) * curr_va[Y] + 
                cylinder_blob.radius * Math.sin(curr_angle) * curr_vb[Y];

            z = curr_c[Z] + 
                cylinder_blob.radius * Math.cos(curr_angle) * curr_va[Z] + 
                cylinder_blob.radius * Math.sin(curr_angle) * curr_vb[Z];

            // -------------  rotate current point about X Y & Z axis if desired --------------  //

            var curr_point = {};

            curr_point.x = x;
            curr_point.y = y;
            curr_point.z = z;

            Common_Utils.rotate_about_xyz_axis(cylinder_blob.rotate_3D_per_axis, curr_point);

            x = curr_point.x;
            y = curr_point.y;
            z = curr_point.z;

            // ---------------  translate current point if desired --------------------- //

            x += cylinder_blob.translate_x;
            y += cylinder_blob.translate_y;
            z += cylinder_blob.translate_z;

            // ---

            given_animal_obj.vertices[curr_vertex_index + X] = x;
            given_animal_obj.vertices[curr_vertex_index + Y] = y;
            given_animal_obj.vertices[curr_vertex_index + Z] = z;

            Common_Utils.populate_min_max(min_max, x, y, z);

            given_animal_obj.colors[curr_color_index + R] = seed_color;
            given_animal_obj.colors[curr_color_index + G] = 1.0 / seed_color;
            given_animal_obj.colors[curr_color_index + B] = 1.0 - seed_color;
            given_animal_obj.colors[curr_color_index + A] = 1.0;

            // ---

            curr_vertex_index += SIZE_DIM_3D;
            curr_color_index  += SIZE_DIM_COLORS;

            // ---

            curr_bucket_slot++;

            // ---

            seed_color += seed_incr_color;
        }
            
        curr_spoke++;
    }

    // console.log('curr_spoke ', curr_spoke);

    // --- stens TODO - fold below into above

    var curr_cylinder_index = 0;

    for (curr_spoke = 0; curr_spoke < cylinder_blob.num_columns; curr_spoke++) {

        for (var curr_bucket = 0; curr_bucket < cylinder_blob.num_rows; curr_bucket++) {

            var bigger_spoke = curr_spoke + 1;
            if (bigger_spoke == cylinder_blob.num_columns) bigger_spoke = 0;

            var bigger_bucket = curr_bucket + 1;
            if (bigger_bucket == cylinder_blob.num_rows) bigger_bucket = curr_bucket; // stens TODO fix

            // -----------

            var corner_0 =   curr_spoke * cylinder_blob.num_rows + curr_bucket;    // remember where we started from
            var corner_1 =   curr_spoke * cylinder_blob.num_rows + bigger_bucket;
            var corner_2 = bigger_spoke * cylinder_blob.num_rows + bigger_bucket;
            var corner_3 = bigger_spoke * cylinder_blob.num_rows + curr_bucket;

            given_animal_obj.indices[curr_cylinder_index++] = corner_0;
            given_animal_obj.indices[curr_cylinder_index++] = corner_1;
            given_animal_obj.indices[curr_cylinder_index++] = corner_2;

            given_animal_obj.indices[curr_cylinder_index++] = corner_2;
            given_animal_obj.indices[curr_cylinder_index++] = corner_3;
            given_animal_obj.indices[curr_cylinder_index++] = corner_0;
        }
    }

    given_animal_obj.curr_cylinder_index = curr_cylinder_index; // used in calling frame

    // console.log('GRAND TOTAL curr_cylinder_index ', curr_cylinder_index);

    // ---

    // curr_vertex_index = 0;
    // curr_color_index = 0;

}       //      synthesize_cylinder

// ---

function setup_storage(gl, given_animal_obj, given_size_vertices, given_num_vertices, given_size_colors, given_size_indices, given_num_indices) {

    // ---

    given_animal_obj.vertex_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal_obj.vertex_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal_obj.vertices, gl.STATIC_DRAW);
    given_animal_obj.vertex_position_buffer.itemSize = given_size_vertices;
    given_animal_obj.vertex_position_buffer.numItems = given_num_vertices;

    // ---

    given_animal_obj.vertex_color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal_obj.vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal_obj.colors, gl.STATIC_DRAW);
    given_animal_obj.vertex_color_buffer.itemSize = given_size_colors;
    given_animal_obj.vertex_color_buffer.numItems = given_num_vertices;

    // ---

    given_animal_obj.vertex_indices_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, given_animal_obj.vertex_indices_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, given_animal_obj.indices, gl.STATIC_DRAW);
    given_animal_obj.vertex_indices_buffer.itemSize = given_size_indices;
    given_animal_obj.vertex_indices_buffer.numItems = given_num_indices;

}

function allocate_graphics_N_synth_cyl(gl, given_animal_obj, cylinder_blob) {

    var total_num_vertices = cylinder_blob.num_columns * cylinder_blob.num_rows;

    // console.log('num_columns ', cylinder_blob.num_columns);
    // console.log('num_rows    ', cylinder_blob.num_rows);
    // console.log('total_num_vertices    ', total_num_vertices);
    // console.log('total colors     ', total_num_vertices * SIZE_DIM_COLORS);

    given_animal_obj.vertices = new Float32Array(total_num_vertices * SIZE_DIM_3D);
    given_animal_obj.colors   = new Float32Array(total_num_vertices * SIZE_DIM_COLORS);
    given_animal_obj.indices  = new  Uint16Array(total_num_vertices * num_indices_per_vertex); 

    // ---

    seed_incr_color = 1.0 / total_num_vertices;

    // console.log('seed_incr_color ', seed_incr_color);

    synthesize_cylinder(given_animal_obj, cylinder_blob);

    // ---

    // console.log('total_num_vertices ', total_num_vertices);
    // console.log('curr_vertex_index       ', curr_vertex_index);
    // console.log('curr_color_index        ', curr_color_index);

    // console.log('given_max_num_columns_fft_cylinder         ', cylinder_blob.num_columns);
    // console.log('given_max_num_rows_fft_cylinder  ', cylinder_blob.num_rows);

    // ------------------------------------------------ //


    // ---

    setup_storage(gl, given_animal_obj, SIZE_DIM_3D, total_num_vertices, SIZE_DIM_COLORS, 1, given_animal_obj.curr_cylinder_index);

/*
    given_animal_obj.vertex_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal_obj.vertex_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal_obj.vertices, gl.STATIC_DRAW);
    given_animal_obj.vertex_position_buffer.itemSize = SIZE_DIM_3D;
    given_animal_obj.vertex_position_buffer.numItems = total_num_vertices;

    // ---

    given_animal_obj.vertex_color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal_obj.vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal_obj.colors, gl.STATIC_DRAW);
    given_animal_obj.vertex_color_buffer.itemSize = SIZE_DIM_COLORS;
    given_animal_obj.vertex_color_buffer.numItems = total_num_vertices;

    // ---

    given_animal_obj.vertex_indices_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, given_animal_obj.vertex_indices_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, given_animal_obj.indices, gl.STATIC_DRAW);
    given_animal_obj.vertex_indices_buffer.itemSize = 1;
    given_animal_obj.vertex_indices_buffer.numItems = given_animal_obj.curr_cylinder_index;
*/


}       //      allocate_graphics_N_synth_cyl

// ------------

// function allocate_local_buffer(given_buffer_size) {

//     // curr_buffer_to_render_time_domain = null;
//     curr_buffer_to_render_time_domain = new Float32Array(given_buffer_size);

//     console.log('NOTICE - just allocated curr buffer to size ', given_buffer_size);
// }

var set_want_lines = function(given_flag) {

    object_handle[animals_audio_vis].want_lines = given_flag;
}


function init_audio_vis(gl, given_max_num_rows_fft_cylinder, given_max_num_columns_fft_cylinder, 
                        given_buffer_size, given_sample_depth, given_buffer_size_time_domain) {

    /*

        sound is a curve over time - this is its time domain representation,
        however same data can be converted using FFT into its frequency domain.
        here we view the frequency domain representation of the source audio
        as rows across the length of a cylinder.  as we advance over time in the audio,
        additional FFT data sets are generated - each such FFT data set becomes 
        its own column as viewed along length of cylinder.  in between such updates
        the cylinder is rotated - each FFT column is a straight line along height of cylinder

    */

    BUFF_SIZE = given_buffer_size;
    sample_depth = given_sample_depth;
    BUFF_SIZE_TIME_DOMAIN = given_buffer_size_time_domain;

    // // var sample_synth_buff_size_multiplier = 20; // size of synth/sampled buff as multiple of source buff size
    // var sample_synth_buff_size_multiplier = 100; // size of synth/sampled buff as multiple of source buff size
    
    // // IMPORTANT - make it a multiple of BUFF_SIZE
    // desired_synth_buff_size = sample_synth_buff_size_multiplier * BUFF_SIZE;


    // console.log('desired_synth_buff_size ', desired_synth_buff_size);

    // audio_process_obj.allocate_sample_N_synth_buffers(desired_synth_buff_size);// allocate both sample and synth

    // ---

    curr_buffer_to_render_time_domain = new Float32Array(BUFF_SIZE_TIME_DOMAIN);

    // console.log('BUFF_SIZE ', BUFF_SIZE, ' sample_depth ', sample_depth, 
    //             ' BUFF_SIZE_TIME_DOMAIN ', BUFF_SIZE_TIME_DOMAIN);

    object_handle[animals_audio_vis].vertices = new Float32Array(BUFF_SIZE * SIZE_DIM_3D);
    object_handle[animals_audio_vis].colors   = new Float32Array(BUFF_SIZE * SIZE_DIM_COLORS);
    object_handle[animals_audio_vis].indices  = new  Uint16Array(BUFF_SIZE * num_indices_per_time_domain_vertex); 

    // ---

    object_handle[animals_audio_vis].vertex_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_audio_vis].vertex_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_audio_vis].vertices, gl.STATIC_DRAW);
    object_handle[animals_audio_vis].vertex_position_buffer.itemSize = SIZE_DIM_3D;
    object_handle[animals_audio_vis].vertex_position_buffer.numItems = BUFF_SIZE;

    // ---

    object_handle[animals_audio_vis].vertex_color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_audio_vis].vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_audio_vis].colors, gl.STATIC_DRAW);
    object_handle[animals_audio_vis].vertex_color_buffer.itemSize = SIZE_DIM_COLORS;
    object_handle[animals_audio_vis].vertex_color_buffer.numItems = BUFF_SIZE;

    // ---

    object_handle[animals_audio_vis].vertex_indices_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object_handle[animals_audio_vis].vertex_indices_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, object_handle[animals_audio_vis].indices, gl.STATIC_DRAW);
    object_handle[animals_audio_vis].vertex_indices_buffer.itemSize = 1;
    object_handle[animals_audio_vis].vertex_indices_buffer.numItems = BUFF_SIZE * num_indices_per_time_domain_vertex;


    var min_max = [];

    Common_Utils.init_min_max(min_max);

    // var animals_borg = {};

    object_handle[animals_audio_vis].min_max = min_max;

    // -------------------------------  construct FFT cylinder   --------------------------  //

    MAX_NUM_ROWS_FFT_CYLINDER  = given_max_num_rows_fft_cylinder;
    MAX_NUM_COLUMNS_FFT_CYLINDER = given_max_num_columns_fft_cylinder;

    var cylinder_blob = {};

    cylinder_blob.radius = 0.6;

    cylinder_blob.num_columns = given_max_num_columns_fft_cylinder;
    cylinder_blob.num_rows = given_max_num_rows_fft_cylinder;

    max_color_index_frequency_domain = cylinder_blob.num_columns * cylinder_blob.num_rows * SIZE_DIM_COLORS;

    var curr_3D_array = []; // each NON 0.0 element says to rotation cylinder about this axis by this radians

    curr_3D_array[0] = 0.0;
    curr_3D_array[1] = 0.0; // since all 3 axis X, Y Z are all 0.0 so do NO rotation of cylinder during build
    curr_3D_array[2] = 0.0;

    cylinder_blob.rotate_3D_per_axis = curr_3D_array;

    cylinder_blob.translate_x = 0.0;    // voluntary translation of each of X Y & Z post cylinder synth
    cylinder_blob.translate_y = 0.0;
    cylinder_blob.translate_z = 0.0;

    cylinder_blob.cyl_height = 2.0;

    allocate_graphics_N_synth_cyl(gl, object_handle[animals_fft], cylinder_blob);

    curr_fft_row = 0;
    // curr_fft_bucket = 0;

    // ---------------------- now construct time domain cylinder -------------------------- //


// console.log('\n\ncw + ss tuesday 3600\n\n');


    // var total_num_samples = 6912;
    // var total_num_samples = 1024;
    // max_num_columns_time_domain_cylinder = 2048;
    max_num_columns_time_domain_cylinder = 2600;
    // max_num_columns_time_domain_cylinder = 3600;
    // max_num_columns_time_domain_cylinder = 4096;

    cylinder_blob.radius = 0.8;

    max_number_rows_time_domain_cylinder = 20;
    // max_number_rows_time_domain_cylinder = 24;
    // max_number_rows_time_domain_cylinder = 32;
    // max_number_rows_time_domain_cylinder = 36;
    // max_number_rows_time_domain_cylinder = 48;
    // max_number_rows_time_domain_cylinder = 64;
    // max_number_rows_time_domain_cylinder = 200;

    // cylinder_blob.num_columns = BUFF_SIZE; // when cylinder is vertical like a coke can its # vertical columns
    cylinder_blob.num_columns = max_num_columns_time_domain_cylinder; // when cylinder is vertical like a coke can its # vertical columns
    cylinder_blob.num_rows    = max_number_rows_time_domain_cylinder; // resolution of each audio sample in curve height

    // max_size_buffer_time_domain = BUFF_SIZE;
    // max_size_buffer_time_domain = max_time_bucket_row_depth;
    // total_num_samples = BUFF_SIZE;

    // max_index_to_render_this_update = 20;    // stens TODO put this back N verify
    max_index_to_render_this_update = max_number_rows_time_domain_cylinder;    // stens TODO put this back N verify
    // max_index_to_render_this_update = max_num_columns_time_domain_cylinder;    // stens TODO put this back N verify

    // max_index_to_render_this_update = BUFF_SIZE;
    // max_index_to_render_this_update = total_num_samples;

    // if (max_size_buffer_time_domain < max_index_to_render_this_update) {

    //     max_index_to_render_this_update = max_size_buffer_time_domain;
    // }

    max_color_index_time_domain = cylinder_blob.num_columns * cylinder_blob.num_rows * SIZE_DIM_COLORS;

    // console.log('max_color_index_time_domain     ', max_color_index_time_domain);
    // console.log('max_index_to_render_this_update ', max_index_to_render_this_update);

    // curr_color_index_time_domain = max_color_index_time_domain - 1;

    // curr_buffer_to_render_time_domain = new Float32Array(BUFF_SIZE);
    // curr_buffer_to_render_time_domain = new Float32Array(6912);  // uuu

    curr_3D_array[0] = 0.0;
    // curr_3D_array[1] = Math.PI / 2.0;     // rotate Y axis by this number of radians
    curr_3D_array[1] = 3.0 * Math.PI / 2.0;     // rotate Y axis by this number of radians
    // curr_3D_array[1] = 0.0;     // rotate Y axis by this number of radians
    curr_3D_array[2] = 0.0; // stens TODO - did change 20140318

    // cylinder_blob.translate_x = -0.8;    // voluntary translation of each of X Y & Z post cylinder synth
    // cylinder_blob.translate_y = 0.0;
    // cylinder_blob.translate_z = 0.5;

    cylinder_blob.translate_x = -0.8;    // voluntary translation of each of X Y & Z post cylinder synth
    cylinder_blob.translate_y = 0.0;
    cylinder_blob.translate_z = -0.5;

    cylinder_blob.cyl_height = 0.5;

    cylinder_blob.rotate_3D_per_axis = curr_3D_array;

    allocate_graphics_N_synth_cyl(gl, object_handle[animals_time_curve], cylinder_blob);

}       //      init_audio_vis

var get_object_handle = function() {

    return object_handle;
}


var get_all_object_labels = function() {

    return all_object_labels;
}

return {    // to make visible to calling reference frame list function here

  init_audio_vis: init_audio_vis,
  update_one_row: update_one_row,
  draw_time_domain: draw_time_domain,
  pipeline_buffer_for_time_domain_cylinder: pipeline_buffer_for_time_domain_cylinder,
  update_billboard: update_billboard,
  // object_handle : object_handle,
  // animals_fft: animals_fft,
  // animals_time_curve: animals_time_curve,
  // animals_audio_vis: animals_audio_vis,
  set_want_lines : set_want_lines,
  // allocate_local_buffer: allocate_local_buffer
  get_object_handle : get_object_handle,
  get_all_object_labels : get_all_object_labels
};

}();    //  audio_display_obj = function() 


// --------------------------------------------------------------------------------- //
// --------------------------------------------------------------------------------- //
// --------------------------------------------------------------------------------- //
