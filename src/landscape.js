
var landscape_obj = function() {

var SIZE_DIM_3D = 3;
var SIZE_DIM_COLORS = 4;

var MAX_NUM_ANIMALS = null;


var pasture_colors = [];
pasture_colors.R = 0.0;
pasture_colors.G = 1.0;
pasture_colors.B = 0.0;
pasture_colors.A = 1.0;

var R = 0;
var G = 1;
var B = 2;
var A = 3;


var X = 0;
var Y = 1;
var Z = 2;

// ---

var object_handle = {}; // holds all the various flavors of graphic object types

var animals_pasture  = "animals_pasture";

object_handle[animals_pasture] = {};

var all_object_labels = [];

all_object_labels.push(animals_pasture);


// ---------- setup display geometry ---------- //


// object_handle[animals_pasture].pre_translate  = [  0.5,  1.5,  1.5];
// object_handle[animals_pasture].post_translate = Common_Utils.negate_array(object_handle[animals_pasture].pre_translate);

// we want dupe of above here
object_handle[animals_pasture].pre_translate  = [  -1.5,  1.5,  1.5];
object_handle[animals_pasture].post_translate = Common_Utils.negate_array(object_handle[animals_pasture].pre_translate);

// ---


// -------------------------------------------------------

function allocate_buffers(gl, given_animal, given_max_animal, min_x, max_x, min_y, max_y, min_z, max_z) {

	MAX_NUM_ANIMALS = given_max_animal;

    given_animal.vertices = new Float32Array(given_max_animal * SIZE_DIM_3D);
    given_animal.colors   = new Float32Array(given_max_animal * SIZE_DIM_COLORS);


    var color_index = 0;
    var curr_vertex = 0;

    for (; curr_vertex < given_max_animal;) {

        var x_index = null;
        var y_index = null;

        var curr_x = null;
        var curr_y = null;

        given_animal.vertices[curr_vertex * SIZE_DIM_3D + X] = Common_Utils.get_random_in_range_inclusive_float(min_x,max_x);
        given_animal.vertices[curr_vertex * SIZE_DIM_3D + Y] = Common_Utils.get_random_in_range_inclusive_float(min_y,max_y);
        given_animal.vertices[curr_vertex * SIZE_DIM_3D + Z] = Common_Utils.get_random_in_range_inclusive_float(min_z,max_z);


        given_animal.colors[color_index + R] = pasture_colors.R;
        given_animal.colors[color_index + G] = pasture_colors.G;
        given_animal.colors[color_index + B] = pasture_colors.B;
        given_animal.colors[color_index + A] = pasture_colors.A;

        curr_vertex++;
        color_index += SIZE_DIM_COLORS;
    }

    given_animal.count = curr_vertex;

    given_animal.vertex_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.vertices, gl.STATIC_DRAW);
    given_animal.vertex_position_buffer.itemSize = 3;
    given_animal.vertex_position_buffer.numItems = curr_vertex;

    // ---

    given_animal.vertex_color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.colors, gl.STATIC_DRAW);
    given_animal.vertex_color_buffer.itemSize = 4;
    given_animal.vertex_color_buffer.numItems = curr_vertex;

/*
    // ----------- depth textures --------------- //

    // Query the extension
    var depthTextureExt = gl.getExtension("WEBGL_depth_texture"); // Or browser-appropriate prefix
    if(!depthTextureExt) {

        throw new Error("ERROR - failed to have WEBGL_depth_texture");
    }

    var size = 256;

    // Create a color texture
    var colorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, colorTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Create the depth texture
    var depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
*/


}		//		allocate_buffers

function init_landscape(given_gl, max_animals, min_x, max_x, min_y, max_y, min_z, max_z) {

	allocate_buffers(given_gl, object_handle[animals_pasture], max_animals, min_x, max_x, min_y, max_y, min_z, max_z);
}

var get_object_handle = function() {

    return object_handle;
}

var get_all_object_labels = function() {

    return all_object_labels;
}

return {
	
	init_landscape : init_landscape,
    get_object_handle : get_object_handle,
    get_all_object_labels : get_all_object_labels
};

}();        //      landscape_obj

