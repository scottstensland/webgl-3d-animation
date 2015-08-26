
var webgl_3d_animation = function() {

"use strict";

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

// ------------- below are CONSTANTS shared with other scripts ------------------ //

var X = 0;
var Y = 1;
var Z = 2;
var min = 3;
var max = 4;
var median = 5;


var world_min_x =  -0.5;
var world_min_y = -0.0;
var world_min_z = -2.0;

var world_max_x =  2.0;
var world_max_y =  2.0;
var world_max_z =  2.0;


var torus_matrix_rotation = [ 0.2,  0.2, -0.2];
// var fft_matrix_rotation = [ 0.6,  0.0, -0.0];
var fft_matrix_rotation = [ 0.9,  0.0, -0.0];
// var time_domain_matrix_rotation = [ -0.8,  0.0, 0.0];
var time_domain_matrix_rotation = [ -0.0, 0.0, 0.4];

var rotation_degree = {};

var rotation_grid = "grid";
var rotation_fft = "fft";
var rotation_time_domain = "time_domain";


var rotation_none = "none";

rotation_degree[rotation_grid] = 0;
rotation_degree[rotation_fft] = 0;
rotation_degree[rotation_time_domain] = 0;
rotation_degree[rotation_none] = 0;

var activity_status = {}; // stores boolean to indicate active state for each graphics flavor
var activity_siblings = {}; // key is graphics flavor value is array of its siblings to enable
                            // enmass on/off for entire group of graphics falvors

var activity_callback = {}; // stores pair of callbacks executed on true/false of flavor

// var curr_degree_rotation_grid = 0;
// var curr_degree_rotation_torus = 0;

var degrees_rotation_fft;

var stop_early = false;
var count_chronos = 0;

var do_output;
var do_single_step;

var last_time = 0;


var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var mouse_scroll_wheel_delta = 0;
var currentlyPressedKeys = {};
var moonRotationMatrix = mat4.create();

mat4.identity(moonRotationMatrix);

// var view_UI_current_state = true;
var view_UI_current_state = false;

// initialize mouse movement mat4 into nice viewing perspective



var FoV = 20.0;
var curr_pitch = -9.020000000000001;
var curr_yaw = 2.9000000000000017;
var curr_speed = 0;


var position_x = 0.6825400916557905;
var position_y = 0.4093690657292863;
var position_z = 10.021485672918804;

var curr_key_pressed = null;
var this_key = 1;

// ---

var curr_canvas;
var writable_output_pixels;


var delta_pitch = 0;
var delta_yaw = 0;
var speed = 0;


var desired_point_size = 1.0;

var shader_program_texture;
var shaderProgram_01;
var shaderProgram_02;
var shader_program_landscape;
var curr_shader_program = null;
var gl;

// ---

var xRot = 0;
var yRot = 0;
var zRot = 0;

var elapsed = 0;

// var cubeVertexPositionBuffer;
// var cubeVertexTextureCoordBuffer;
// var cubeVertexIndexBuffer;

// var neheTexture;

// var shaderProgram;

/*
function init_camera_perspectives() {

    // -------- these init value define starting perspective --------- //

    moonRotationMatrix = [-0.6537552205623457, -0.30087098559496206, 0.6943029284108623, 0, 0.7536820419441966, -0.3406270606507448, 0.5620569108352607, 0, 0.06739043120556161, 0.8907449831701331, 0.44945120514773496, 0, 0, 0, 0, 1];

    FoV = 20.0;
    curr_pitch = -9.020000000000001;
    curr_yaw = 2.9000000000000017;
    curr_speed = 0;

    position_x = 0.6825400916557905;
    position_y = 0.4093690657292863;
    position_z = 10.021485672918804;
}
*/



function set_camera_perspectives() {

    // -------- these init value define starting perspective --------- //

    moonRotationMatrix = [0.7352716063878847, 0.27678643552261983, -0.6186537364637207, 0, -0.6667140427230679, 0.45943448572820017, -0.5868358226293043, 0, 0.12180678904838242, 0.8439628200499135, 0.5223584884859405, 0, 0, 0, 0, 1];

    FoV = 20.0;
    curr_pitch = 2.039999999999997;
    curr_yaw   = 5.920000000000003;
    curr_speed = 0.01;

    position_x = 0.2580853494745913;
    position_y = 0.40885423701597917;
    position_z = 9.181939802075272;
}

var manage_shader_program = (function() {

    var local_shader_program = null;

    return {

        set : function(given_gl, given_shader_program) {

            if (local_shader_program !== given_shader_program) {

                given_gl.useProgram(given_shader_program);

                local_shader_program = given_shader_program;

                // console.log(".... had to toggle btw shader programs");
            }
        },
        get : function() {

            return local_shader_program;
        }
    };

}());

function initGL(canvas) {

    try {

        gl = canvas.getContext("experimental-webgl", { alpha: false });
        // gl = canvas.getContext("experimental-webgl2");      //  webgl2 
                          // https://wiki.mozilla.org/Platform/GFX/WebGL2




        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

        // console.log(gl.getSupportedExtensions().join("\n"));

    } catch (e) {}

    if (!gl) {
        alert("Could not initialise Webgl, go here to enable WebGL on your browser http://www.browserleaks.com/webgl");
    }
}


function getShader(gl, id) {

    var shaderScript = document.getElementById(id);
    if (!shaderScript) {

        console.error("ERROR - failed to find shader : " + id);

        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {

        console.error("ERROR - failed to resolve type for shader : " + id);

        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        console.error("ERROR - failed to compile shader : " + id);

        console.error(gl.getShaderInfoLog(shader));
        
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders(gl) {

    var curr_vertex_shader   = null;
    var curr_fragment_shader = null;

    // --------------- shader render to texture --------------- //

    curr_fragment_shader = getShader(gl, "fragment_shader_render_to_texture");
    curr_vertex_shader = getShader(gl, "vertex_shader_render_to_texture");

    shader_program_texture = gl.createProgram();
    gl.attachShader(shader_program_texture, curr_vertex_shader);
    gl.attachShader(shader_program_texture, curr_fragment_shader);
    gl.linkProgram(shader_program_texture);

    if (!gl.getProgramParameter(shader_program_texture, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shader_program_texture);

    shader_program_texture.vertexPositionAttribute = gl.getAttribLocation(shader_program_texture, "aVertexPosition");
    gl.enableVertexAttribArray(shader_program_texture.vertexPositionAttribute);

    shader_program_texture.textureCoordAttribute = gl.getAttribLocation(shader_program_texture, "aTextureCoord");
    gl.enableVertexAttribArray(shader_program_texture.textureCoordAttribute);

    shader_program_texture.pMatrixUniform = gl.getUniformLocation(shader_program_texture, "uPMatrix");
    shader_program_texture.mvMatrixUniform = gl.getUniformLocation(shader_program_texture, "uMVMatrix");
    shader_program_texture.samplerUniform = gl.getUniformLocation(shader_program_texture, "uSampler");
/*

    // ---------------  shader set II ----------------- //

    curr_fragment_shader = getShader(gl, "fragment_shader_02");
    curr_vertex_shader   = getShader(gl, "vertex_shader_02");

    shaderProgram_02 = gl.createProgram();

    // console.log("\n\n\n hello Corinde its 5pm today");

    gl.attachShader(shaderProgram_02, curr_vertex_shader);
    gl.attachShader(shaderProgram_02, curr_fragment_shader);
    gl.linkProgram(shaderProgram_02);

    if (!gl.getProgramParameter(shaderProgram_02, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram_02);

    // shaderProgram_02.vertexPositionAttribute = gl.getAttribLocation(shaderProgram_02, "aVertexPosition");
    // gl.enableVertexAttribArray(shaderProgram_02.vertexPositionAttribute);

    // shaderProgram_02.vertexColorAttribute = gl.getAttribLocation(shaderProgram_02, "aVertexColor");
    // gl.enableVertexAttribArray(shaderProgram_02.vertexColorAttribute);

    shaderProgram_02.pMatrixUniform    = gl.getUniformLocation(shaderProgram_02, "uPMatrix");
    shaderProgram_02.mvMatrixUniform   = gl.getUniformLocation(shaderProgram_02, "uMVMatrix");
    shaderProgram_02.point_size        = gl.getUniformLocation(shaderProgram_02, "given_point_size");
    shaderProgram_02.screen_resolution = gl.getUniformLocation(shaderProgram_02, "u_resolution");
*/

    // ---------------  shader_program_landscape ----------------- //

    curr_fragment_shader = getShader(gl, "fragment_shader_landscape");
    curr_vertex_shader   = getShader(gl, "vertex_shader_landscape");

    shader_program_landscape = gl.createProgram();

    // console.log("\n\n\n hello Corinde its 5pm today");

    gl.attachShader(shader_program_landscape, curr_vertex_shader);
    gl.attachShader(shader_program_landscape, curr_fragment_shader);
    gl.linkProgram(shader_program_landscape);

    if (!gl.getProgramParameter(shader_program_landscape, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shader_program_landscape);

    curr_shader_program = shader_program_landscape;

    shader_program_landscape.vertexPositionAttribute = gl.getAttribLocation(shader_program_landscape, "aVertexPosition");
    gl.enableVertexAttribArray(shader_program_landscape.vertexPositionAttribute);

    shader_program_landscape.vertexColorAttribute = gl.getAttribLocation(shader_program_landscape, "aVertexColor");
    gl.enableVertexAttribArray(shader_program_landscape.vertexColorAttribute);

    shader_program_landscape.pMatrixUniform    = gl.getUniformLocation(shader_program_landscape, "uPMatrix");
    shader_program_landscape.mvMatrixUniform   = gl.getUniformLocation(shader_program_landscape, "uMVMatrix");
    shader_program_landscape.point_size        = gl.getUniformLocation(shader_program_landscape, "given_point_size");
    shader_program_landscape.screen_resolution = gl.getUniformLocation(shader_program_landscape, "u_resolution");

    // bbb

    shader_program_landscape.time = gl.getUniformLocation(shader_program_landscape, "u_time");


    // ---------------  shader set I ----------------- //

    curr_fragment_shader = getShader(gl, "fragment_shader_01");
    curr_vertex_shader   = getShader(gl, "vertex_shader_01");

    shaderProgram_01 = gl.createProgram();

    // console.log("\n\n\n hello Corinde its 5pm today");

    gl.attachShader(shaderProgram_01, curr_vertex_shader);
    gl.attachShader(shaderProgram_01, curr_fragment_shader);
    gl.linkProgram(shaderProgram_01);

    if (!gl.getProgramParameter(shaderProgram_01, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram_01);

    curr_shader_program = shaderProgram_01;

    shaderProgram_01.vertexPositionAttribute = gl.getAttribLocation(shaderProgram_01, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram_01.vertexPositionAttribute);

    shaderProgram_01.vertexColorAttribute = gl.getAttribLocation(shaderProgram_01, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram_01.vertexColorAttribute);

    shaderProgram_01.pMatrixUniform    = gl.getUniformLocation(shaderProgram_01, "uPMatrix");
    shaderProgram_01.mvMatrixUniform   = gl.getUniformLocation(shaderProgram_01, "uMVMatrix");
    shaderProgram_01.point_size        = gl.getUniformLocation(shaderProgram_01, "given_point_size");
    shaderProgram_01.screen_resolution = gl.getUniformLocation(shaderProgram_01, "u_resolution");

}       //      initShaders

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length === 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms(given_point_size, gl, local_shader_program) {

    gl.uniformMatrix4fv(local_shader_program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(local_shader_program.mvMatrixUniform, false, mvMatrix);
    gl.uniform1f(local_shader_program.point_size, given_point_size);
    gl.uniform2f(local_shader_program.screen_resolution, gl.viewportWidth, gl.viewportHeight);

    if (local_shader_program.time) {  // bbb

        gl.uniform1f(local_shader_program.time, elapsed);
    }
}

// ---

function inner_indexed_draw(given_animal, gl, given_rotation, given_matrix_rotation, given_shader_program, given_point_size) {

    manage_shader_program.set(gl, given_shader_program);

    var local_shader_program = manage_shader_program.get();

    mvPushMatrix();

    mat4.translate(mvMatrix, [  given_animal.min_max[X][median], 
                                given_animal.min_max[Y][median],
                                given_animal.min_max[Z][median]]);   // OK for board 4 by 4
    // ---

    mat4.rotate(mvMatrix, Common_Utils.degToRad(given_rotation), given_matrix_rotation);

    mat4.translate(mvMatrix, [  -given_animal.min_max[X][median], 
                                -given_animal.min_max[Y][median], 
                                -given_animal.min_max[Z][median]]);   // OK for board 4 by 4
    // ---

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(local_shader_program.vertexPositionAttribute, given_animal.vertex_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    // -------------------------------------

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(local_shader_program.vertexColorAttribute, given_animal.vertex_color_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // --------------------------------------

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, given_animal.vertex_indices_buffer);  // bbb
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, given_animal.indices, gl.STATIC_DRAW);

    // setMatrixUniforms(desired_point_size, gl, local_shader_program);
    setMatrixUniforms(given_point_size, gl, local_shader_program);

    if (given_animal.want_lines) {

        gl.drawElements(gl.LINES, given_animal.vertex_indices_buffer.numItems, gl.UNSIGNED_SHORT, 0);

    } else {

        gl.drawElements(gl.TRIANGLES, given_animal.vertex_indices_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);  // bbb

    mvPopMatrix();

}    //      inner_indexed_draw

// ---

function inner_draw(given_animal, given_point_size, given_rotation, gl, given_shader_program, blob_tag) {

    manage_shader_program.set(gl, given_shader_program);

    var local_shader_program = manage_shader_program.get();

    mvPushMatrix();

    if (given_animal.want_translate === true) {

        mat4.translate(mvMatrix, given_animal.pre_translate);   // OK for board 4 by 4
    }

    if (given_animal.rotation_array) {

        mat4.rotate(mvMatrix, Common_Utils.degToRad(given_rotation), given_animal.rotation_array);        
    }

    if (given_animal.want_translate === true) {

        mat4.translate(mvMatrix, given_animal.post_translate);   // OK for board 4 by 4
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_position_buffer);

    gl.bufferData(gl.ARRAY_BUFFER, given_animal.vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(local_shader_program.vertexPositionAttribute, given_animal.vertex_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    // -------------------------------------

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_color_buffer);

    gl.bufferData(gl.ARRAY_BUFFER, given_animal.colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(local_shader_program.vertexColorAttribute, given_animal.vertex_color_buffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms(given_point_size, gl, local_shader_program);

    gl.drawArrays(gl.POINTS, 0, given_animal.vertex_position_buffer.numItems);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    mvPopMatrix();

}       //      inner_draw

function setMatrixUniforms_texture(gl, local_shader_program) {

    // bbb

    gl.uniformMatrix4fv(local_shader_program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(local_shader_program.mvMatrixUniform, false, mvMatrix);
}

// function degToRad(degrees) {
//     return degrees * Math.PI / 180;
// }
/*
function texture_draw(given_animal, gl, given_shader_program) {

    mvPushMatrix();

    manage_shader_program.set(gl, given_shader_program);

    var local_shader_program = manage_shader_program.get();

    // ---

    // gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    // mat4.identity(mvMatrix);

    // ---

    mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);

    mat4.rotate(mvMatrix, Common_Utils.degToRad(xRot), [1, 0, 0]);
    mat4.rotate(mvMatrix, Common_Utils.degToRad(yRot), [0, 1, 0]);
    mat4.rotate(mvMatrix, Common_Utils.degToRad(zRot), [0, 0, 1]);

// gl.vertexAttribPointer(
//     location,        // get data from the buffer that's was last bound with gl.bindBuffer
//     numComponents,   // how many components per vertex (1 - 4)
//     typeOfData,      // what the type of data is (BYTE, FLOAT, INT, UNSIGNED_SHORT, etc...)
//     normalizeFlag,
//     strideToNextPieceOfData, // how many bytes to skip to get from one piece of data to next piece
//     offsetIntoBuffer);       // offset for how far into the buffer our data is

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_position_buffer);
    gl.vertexAttribPointer( local_shader_program.vertexPositionAttribute, 
                            given_animal.vertex_position_buffer.itemSize, 
                            gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_texture_coord_buffer);

    gl.vertexAttribPointer( local_shader_program.textureCoordAttribute, 
                            given_animal.vertex_texture_coord_buffer.itemSize, 
                            gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    
    // gl.bindTexture(gl.TEXTURE_2D, neheTexture);
    gl.bindTexture(gl.TEXTURE_2D, given_animal.texture);

    gl.uniform1i(local_shader_program.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, given_animal.vertex_index_buffer);
    
    setMatrixUniforms_texture(local_shader_program);
    gl.drawElements(gl.TRIANGLES, given_animal.vertex_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();

}       //      texture_draw
*/

// function draw_scene(gl, given_shader_program) {
function draw_scene(gl) {
/*
    // console.log('count_num_draw_calls ', count_num_draw_calls);
    // count_num_draw_calls++;

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    // gl.clearColor(0.3, 0.3, 0.3, 1.0);  // background color gray
    // gl.clearColor(0.2, 0.2, 0.2, 1.0);  // background color gray
    // gl.clearColor(0.15, 0.15, 0.15, 1.0);  // background color black
    // gl.clearColor(0.1, 0.1, 0.1, 1.0);  // background color black

    gl.clearColor(0.03, 0.03, 0.03, 1.0);  // background color black
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    mat4.perspective(FoV , gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);

    // ---------- handle navigation

    mat4.rotate(mvMatrix, Common_Utils.degToRad(-curr_pitch), [1, 0, 0]);
    mat4.rotate(mvMatrix, Common_Utils.degToRad(-curr_yaw), [0, 1, 0]);

    mat4.translate(mvMatrix, [-position_x, -position_y, -position_z]);

    // ----------

    // mat4.translate(mvMatrix, [world_min_x, world_min_y, world_min_z]);   // OK for board 4 by 4

    // ---

    mat4.multiply(mvMatrix, moonRotationMatrix);


    active_inner_draw.forEach(function(curr_element) {  // ccc

        if (activity_status[curr_element.object_label]) {

            inner_draw( curr_element.flavor_graphics,
                        curr_element.point_size,
                        rotation_degree[curr_element.rotation_property],
                        gl, 
                        curr_element.shader_program, 
                        true);            
        }
    });

    active_inner_indexed_draw.forEach(function(curr_element) {

        if (activity_status[curr_element.object_label]) {

            inner_indexed_draw( curr_element.flavor_graphics,
                                gl,
                                rotation_degree[curr_element.rotation_property],
                                curr_element.rotation_matrix,
                                curr_element.shader_program);
        }
    });

    if (true === audio_process_obj.get_display_ready_flag()) {

        // pure synthesized curve based on sampled audio
        inner_draw(audio_process_obj.animals_synth, 2.0, rotation_degree[rotation_grid], gl, given_shader_program, true);

        inner_draw(audio_process_obj.animals_sampled, 2.0, rotation_degree[rotation_grid], gl, given_shader_program, true);
    }

    // ---

    active_draw_texture.forEach(function(curr_element) {

        if (activity_status[curr_element.object_label]) {

            texture_draw(   curr_element.flavor_graphics,
                            gl,
                            curr_element.shader_program);
        }
    });
*/
    // ---

/*
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

        mat4.identity(mvMatrix);

        mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);

        mat4.rotate(mvMatrix, Common_Utils.degToRad(xRot), [1, 0, 0]);
        mat4.rotate(mvMatrix, Common_Utils.degToRad(yRot), [0, 1, 0]);
        mat4.rotate(mvMatrix, Common_Utils.degToRad(zRot), [0, 0, 1]);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        gl.vertexAttribPointer(shader_program_texture.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shader_program_texture.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, neheTexture);
        gl.uniform1i(shader_program_texture.samplerUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
*/

}       //      draw_scene

function texture_draw(given_animal, gl, given_shader_program) {

/*
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shader_program_texture.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shader_program_texture.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, neheTexture);
    gl.uniform1i(shader_program_texture.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    // setMatrixUniforms();
    setMatrixUniforms_texture(shader_program_texture);
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
*/

// bbb

    manage_shader_program.set(gl, given_shader_program);

    var local_shader_program = manage_shader_program.get();

    mvPushMatrix();

    // mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);
    mat4.translate(mvMatrix, [6.0, 4.0, 1.0]);

    mat4.rotate(mvMatrix, Common_Utils.degToRad(xRot), [1, 0, 0]);
    mat4.rotate(mvMatrix, Common_Utils.degToRad(yRot), [0, 1, 0]);
    mat4.rotate(mvMatrix, Common_Utils.degToRad(zRot), [0, 0, 1]);

    // ---

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_position_buffer);
    gl.vertexAttribPointer(given_shader_program.vertexPositionAttribute, given_animal.vertex_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_texture_coord_buffer);
    gl.vertexAttribPointer(given_shader_program.textureCoordAttribute, given_animal.vertex_texture_coord_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, given_animal.texture);
    gl.uniform1i(given_shader_program.samplerUniform, 0);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, given_animal.vertex_index_buffer);

    setMatrixUniforms_texture(gl, given_shader_program);

    gl.drawElements(gl.TRIANGLES, given_animal.vertex_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // ---

    mvPopMatrix();

}       //      texture_draw

function drawScene(gl) {

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix);

    // ---

    mat4.perspective(FoV , gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    // mat4.identity(mvMatrix);

    // ---------- handle navigation

    mat4.rotate(mvMatrix, Common_Utils.degToRad(-curr_pitch), [1, 0, 0]);
    mat4.rotate(mvMatrix, Common_Utils.degToRad(-curr_yaw), [0, 1, 0]);

    mat4.translate(mvMatrix, [-position_x, -position_y, -position_z]);

    // ----------

    mat4.translate(mvMatrix, [world_min_x, world_min_y, world_min_z]);   // OK for board 4 by 4

    // ---

    mat4.multiply(mvMatrix, moonRotationMatrix);

    // ---

    active_draw_inner.forEach(function(curr_element) {  // ccc

        if (activity_status[curr_element.object_label]) {

// inner_draw(given_animal, given_point_size, given_rotation, gl, given_shader_program, blob_tag)

            inner_draw( curr_element.flavor_graphics,
                        curr_element.point_size,
                        rotation_degree[curr_element.rotation_property],
                        gl, 
                        curr_element.shader_program, 
                        true);            
        }
    });

    // ---

    active_draw_indexed_inner.forEach(function(curr_element) {

        if (activity_status[curr_element.object_label]) {

            inner_indexed_draw( curr_element.flavor_graphics,
                                gl,
                                rotation_degree[curr_element.rotation_property],
                                curr_element.rotation_matrix,
                                curr_element.shader_program,
                                curr_element.point_size);
        }
    });

    // ---

    active_draw_texture.forEach(function(curr_element) {

        if (activity_status[curr_element.object_label]) {

            texture_draw(   curr_element.flavor_graphics,
                            gl,
                            curr_element.shader_program);
        }
    });

}       //      drawScene

function animate() {

    var timeNow = new Date().getTime();

    // Used to make us "jog" up and down as we move forward.
    var joggingAngle = 0;

    if (last_time !== 0) {
        elapsed = timeNow - last_time;

        xRot += (90 * elapsed) / 1000.0;
        yRot += (90 * elapsed) / 1000.0;
        zRot += (90 * elapsed) / 1000.0;

        // ---

        if (speed !== 0) {

            position_x -= Math.sin(Common_Utils.degToRad(curr_yaw)) * speed * elapsed;
            position_z -= Math.cos(Common_Utils.degToRad(curr_yaw)) * speed * elapsed;

            joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)

            position_y = Math.sin(Common_Utils.degToRad(joggingAngle)) / 20 + 0.4;

            curr_speed = speed;
        }

        rotation_degree[rotation_grid] -= (38 * elapsed) / 1000.0;

        rotation_degree[rotation_time_domain] -= (98.0 * elapsed) / 1000.0;

        // curr_degree_rotation_torus -= (75 * elapsed) / 1000.0;
        // curr_degree_rotation_torus -= (48 * elapsed) / 1000.0;

        rotation_degree[rotation_fft]   -= (degrees_rotation_fft * elapsed) / 1000.0;

        curr_yaw   += delta_yaw   * elapsed;
        curr_pitch += delta_pitch * elapsed;

        // --- uuu

        if (view_UI_current_state) {

            // console.log('delta_pitch ', delta_pitch, '  delta_yaw ', delta_yaw, '    speed ', speed);
        }
    }

    last_time = timeNow;
}

function tick() {

    requestAnimFrame(tick);
    handleKeys();

    // if (activity_status["animals_fish"]) {
    if (activity_status.animals_fish) {

        fns.update_board();
    }

    // if (activity_status["animals_time_curve"]) {
    if (activity_status.animals_time_curve) {

        audio_display_obj.update_billboard();   // refreshes time domain cylinder
    }

    // draw_scene(gl, shaderProgram_01);
    // draw_scene(gl);
    drawScene(gl);

    animate();   // remove comment to engage rotation animation

    // -------  write to output texture

    // gl.readPixels(0, 0, CANVAS.width, CANVAS.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    // pixels = new Float32Array(pixels.buffer);

    // gl.readPixels(0, 0, curr_canvas.width, curr_canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, writable_output_pixels);

    // var size_pixel_view = writable_output_pixels.length;

    // console.log("size_pixel_view " + size_pixel_view);

    // for (var curr_pixel = 0, size_pixel_view = writable_output_pixels.length;
    //     curr_pixel < size_pixel_view && curr_pixel < 10; curr_pixel += 4) {

        // console.log(writable_output_pixels[curr_pixel]);
    // }

    // writable_output_pixels = new Float32Array(writable_output_pixels.buffer);

    // writable_output_pixels now contains an array of floats, 1 float for each pixel
}

function process_a_keypress() {

    // stop_early = ! stop_early;  // toggle true / false     

    process_a_click();
}

function process_a_click() {

    // do_single_step = ! do_single_step;

    stop_early = ! stop_early;  // toggle true / false 

    // do_board_update = ! do_board_update;    // toggle true / false
}

// ------------ handle mouse movements

function handleMouseDown(event) {

    event.preventDefault();

    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {

    event.preventDefault();

    mouseDown = false;
}

function handleMouseMove(event) {

    event.preventDefault();

    if (!mouseDown) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX;
    var newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, Common_Utils.degToRad(deltaX / 10), [0, 1, 0]);

    var deltaY = newY - lastMouseY;
    mat4.rotate(newRotationMatrix, Common_Utils.degToRad(deltaY / 10), [1, 0, 0]);

    mat4.multiply(newRotationMatrix, moonRotationMatrix, moonRotationMatrix);

    if (view_UI_current_state) {

        console.log('\n', mat4.str(moonRotationMatrix), ', ', FoV, ', ', curr_pitch, ', ', curr_yaw, 
                        ', ', curr_speed,
                        ', ', position_x, ', ', position_y, ', ', position_z);
    }

    lastMouseX = newX;
    lastMouseY = newY;
}

// ------------- handle mouse scroll wheel

function handleMouseScrollWheel(event) {

    event.preventDefault();     // prevent mouse scroll to move entire page

    if (event.wheelDelta) {
        // IE and Opera
        mouse_scroll_wheel_delta = event.wheelDelta / 60;
    } else if (event.detail) {
        // W3C
        mouse_scroll_wheel_delta = -event.detail / 2;
    }

    FoV += - 0.8 * mouse_scroll_wheel_delta;
}

// ------------ handle keyboard navigation

//              http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes


function handleKeyDown(event) {

    event.preventDefault();

    currentlyPressedKeys[event.keyCode] = true;

    // console.log("handleKeyDown " + event.keyCode);

    curr_key_pressed = event.keyCode;
}

function handleKeyUp(event) {

    event.preventDefault();

    currentlyPressedKeys[event.keyCode] = false;

    // console.log('handleKeyUp');
}

function handleKeys() {

    var key_touched = false;
    var multiply_factor = 0.02;
    var zoom_factor = 0.2;

    if (currentlyPressedKeys[33]) {         // page up
        // Page Up
        delta_pitch = multiply_factor;
    } else if (currentlyPressedKeys[34]) {  // page down
        // Page Down
        delta_pitch = -multiply_factor;
    } else {
        delta_pitch = 0;
    }

    if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {         // left arrow OR a
        // Left cursor key or A
        delta_yaw = multiply_factor;
    } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {  // right arrow OR d
        // Right cursor key or D
        delta_yaw = -multiply_factor;
    } else {
        delta_yaw = 0;
    }

    if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {         // up arrow OR w
        // Up cursor key or W
        speed = multiply_factor * zoom_factor;
    } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {  // down arrow OR s
        // Down cursor key
        speed = -multiply_factor * zoom_factor;
    } else {
        speed = 0;
    }

    if (view_UI_current_state && (0 !== delta_pitch || 0 !== delta_yaw || 0 !== speed)) {

        // console.log(delta_pitch, '   ', delta_yaw, '     ', speed);
    }

    // ---

    // if (currentlyPressedKeys[49]) {         // page
    // if (curr_key_pressed > 48 && curr_key_pressed < 58) {

    if (currentlyPressedKeys[49] || currentlyPressedKeys[50] || currentlyPressedKeys[51] || currentlyPressedKeys[52] || 
        currentlyPressedKeys[53] || currentlyPressedKeys[54] || currentlyPressedKeys[55] || currentlyPressedKeys[56]) {

        this_key = curr_key_pressed - 48;

        // console.log("cool seeing 1 to 9 ... as in " + this_key);

        chladni_obj.do_chladni.update_chladni(this_key, lastMouseX, lastMouseY);
    }

    if (currentlyPressedKeys[82]) {

        chladni_obj.do_chladni.reset_chladni();
    }

}

// ------------

var state_animation = (function() {

    var state_value = [];   // true or false of given index driven by state_roster
    var state_roster = [];  // contains list of given_object_label values 
                            // whos index drives state_value

    var state_label_to_entry = {}; // maps key : given_object_label to value : index into state_xxx

    return {

        add_animation_object : function(given_object_label) {

            state_roster.push(given_object_label);

            var curr_object_index = state_roster.length - 1;

            state_label_to_entry[given_object_label] = curr_object_index;

            state_value[curr_object_index] = true; // default new additions as true
        },
        /*
        set_state : function(given_object_label, given_value) {

            var curr_index = state_label_to_entry[given_object_label];

            if (true !== given_value && false !== given_value) {

                throw new Error("ERROR - set_state 2nd parm must be true or false");
            }

            if (typeof curr_index === "undefined") {

                throw new Error("set_state given invalid 1st parm ... " +
                    "must be object_label as previously given to add_animation_object 1st parm");
            }

            state_value[curr_index] = given_value;
        },
        */
        
        get_state : function(given_object_label) {

            var curr_index = state_label_to_entry[given_object_label];

            if (typeof curr_index === "undefined") {

                return false;
            }

            if (typeof state_value[curr_index] === "undefined") {

                throw new Error("ERROR - invalid state_value for given object label");
            }

            return state_value[curr_index];
        }
    };

}());


var active_object_handles = {};

// var active_inner_draw = [];
var active_draw_inner = [];

// var active_inner_indexed_draw = [];
var active_draw_indexed_inner = [];

var active_draw_texture = [];

var state_objects = [];

var ui_events_entry_point = function(flavor_checkbox, given_event) {

// var ui_events_entry_point = function(flavor_checkbox) {
    // var given_event = this.checked;

    console.log("nice ... " + flavor_checkbox + " now says " + given_event);

    if (typeof activity_status[flavor_checkbox] !== "undefined") {

        // console.log("cool Corinde ... here is event " + flavor_checkbox + " value " + given_event);

        activity_status[flavor_checkbox] = given_event;

        if (typeof activity_siblings[flavor_checkbox] !== "undefined") {

            var all_siblings = activity_siblings[flavor_checkbox];

            for (var curr_sibling in all_siblings) {

                if (all_siblings.hasOwnProperty(curr_sibling)) {

                    activity_status[curr_sibling] = given_event;
                }
            }
        }

        // ---

        if (typeof activity_callback[flavor_checkbox] !== "undefined") {

            activity_callback[flavor_checkbox][given_event]();
        }

    } else {

        console.log("whooa ... did not see key here is entire associative array");
        console.log(activity_status);
    }
};


/*
var setup_checkbox_list = function() {

    var all_checkbox_ids = [

        // "toggle_mute",
        // "animals_audio_vis",
        // "animals_fft",
        // "animals_time_curve",
        // "animals_borg",
        // "animals_chladni",
        // "animals_pasture",
        "animals_trefoil_knot"
        // "animals_schwartz",
        // "animals_fish",
        // "animals_doughnut"
    ];

// clear the former content of a given <div id="some_div"></div>
document.getElementById('control_checkboxes').innerHTML = '';


all_checkbox_ids.forEach(function(element) {

    console.log("element " + element);

    // ---

    // var curr_label = element;

    // create the necessary elements
    // var label= document.createElement("label");
    var curr_label = document.createElement("label");

    // var description = document.createTextNode("pair");
    var description = document.createTextNode(element);
    var checkbox = document.createElement("input");

    checkbox.type = "checkbox";    // make the element a checkbox
    checkbox.name = "slct[]";      // give it a name we can check on the server side
    // checkbox.value = "pair";         // make its value "pair"


    // checkbox.onclick = ui_logic_handler.handleClick(element, this);

    // checkbox.setAttribue('onclick','addRow("'+tableID+'")');

    checkbox.setAttribute('onclick','ui_logic_handler.handleClick("'+element+'")');



    curr_label.appendChild(checkbox);   // add the box to the element
    curr_label.appendChild(description);// add the description to the element

    // add the label element to your div
    document.getElementById('control_checkboxes').appendChild(curr_label);

});






// create the necessary elements
var label= document.createElement("label");
var description = document.createTextNode("pair");
var checkbox = document.createElement("input");

checkbox.type = "checkbox";    // make the element a checkbox
checkbox.name = "slct[]";      // give it a name we can check on the server side
// checkbox.value = "pair";         // make its value "pair"

label.appendChild(checkbox);   // add the box to the element
label.appendChild(description);// add the description to the element

// add the label element to your div
document.getElementById('control_checkboxes').appendChild(label);


    // document.getElementById("myCheck").checked = true;


    // document.getElementById("trefoil_checkbox").checked = true;


//    control_checkboxes   

// var checkbox = document.createElement('input');
var checkbox = document.getElementById("control_checkboxes");


checkbox.type = "checkbox";
checkbox.name = "name";
checkbox.value = "value";
checkbox.id = "id";

var label = document.createElement('label');
label.htmlFor = "id";
label.appendChild(document.createTextNode('text for label after checkbox'));


// container.appendChild(checkbox);
// container.appendChild(label);



// document.body.appendChild(checkbox);
// document.body.appendChild(label);




    // var x = document.createElement("INPUT");
    // x.setAttribute("type", "checkbox");



    function check() {
    document.getElementById("myCheck").checked = true;
}

function uncheck() {
    document.getElementById("myCheck").checked = false;
}



    // ui_logic_handler.is_checked
};
*/


function add_graphics_flavor_siblings(siblings_obj, given_key, given_value) {

    // console.log(" pre ------------- siblings_obj");
    // console.log(siblings_obj);


    // console.log(" ------------- given_key");
    // console.log(given_key);


    // console.log(" ------------- given_value");
    // console.log(given_value);


    var curr_siblings = {};

    if (typeof siblings_obj[given_key] !== "undefined") {

        // console.log(" cool seeing NO key for given_key " + given_key);

        curr_siblings = siblings_obj[given_key];
    }

    curr_siblings[given_value] = 1; // placeholder for sibling of given_key

    siblings_obj[given_key] = curr_siblings;

    // ---

    // console.log(" post ------------- siblings_obj");
    // console.log(siblings_obj);
}



var internal_webGLStart = function() {

    curr_canvas = document.getElementById("ecology_simulation");
    initGL(curr_canvas);

    initShaders(gl);

    // ---

    set_camera_perspectives();

    var state_object_fish_and_sharks = "object_fish_and_sharks";
    var state_object_landscape       = "object_landscape";
    var state_object_borg            = "object_borg";
    var state_object_schwartz        = "object_schwartz";
    var state_object_chladni         = "object_chladni";
    var state_object_trefoil         = "object_trefoil";
    var state_object_audio_domain    = "object_audio_domain";
    var state_object_toggle_mute     = "toggle_mute";
    var state_object_render_to_texture = "render_to_texture";

    // ---

    // state_animation.add_animation_object(state_object_persistance_db);

    state_animation.add_animation_object(state_object_fish_and_sharks);
    state_animation.add_animation_object(state_object_landscape);
    state_animation.add_animation_object(state_object_borg);
    state_animation.add_animation_object(state_object_schwartz);
    state_animation.add_animation_object(state_object_chladni);
    state_animation.add_animation_object(state_object_trefoil);
    state_animation.add_animation_object(state_object_audio_domain);
    state_animation.add_animation_object(state_object_render_to_texture);

    // ---

    activity_status[state_object_toggle_mute] = true; // toggle mute audio volume

    activity_callback[state_object_toggle_mute] = {

        true : webaudio_tooling_obj.do_mute,
        false : webaudio_tooling_obj.un_mute
    };


    var curr_object_handle     = null;
    var curr_all_object_labels = null;
    var object_label           = null;

    // ---------------

    if (true === state_animation.get_state(state_object_render_to_texture)) {

        render_to_texture_obj.init(gl);

        curr_object_handle     = render_to_texture_obj.get_object_handle();
        curr_all_object_labels = render_to_texture_obj.get_all_object_labels();

        object_label = curr_all_object_labels[0];

        activity_status[object_label] = true;

        active_draw_texture.push({

            flavor_graphics : curr_object_handle[object_label],
            object_label    : object_label,
            shader_program : shader_program_texture
        });
    }

    // ------------   borg  ------------ // 

    if (true === state_animation.get_state(state_object_borg)) {

        // var MAX_BORG_POINTS = 10;
        // var MAX_BORG_POINTS = 10000;
        var MAX_BORG_POINTS = 50000;
        // var MAX_BORG_POINTS = 100000;
        // var MAX_BORG_POINTS = 300000;

        borg_obj.init_borg(gl, MAX_BORG_POINTS);

        curr_object_handle     = borg_obj.get_object_handle();
        curr_all_object_labels = borg_obj.get_all_object_labels();

        object_label = curr_all_object_labels[0];

        activity_status[object_label] = true;

        active_draw_inner.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 1.0,
            rotation_property : rotation_grid,
            object_label    : object_label,
            shader_program : shaderProgram_01
        });
    }

    // --------------------    trefoil    -------------------- //

    if (true === state_animation.get_state(state_object_trefoil)) {

        // var max_num_trefoil_knot_points = 1000;
        var max_num_trefoil_knot_points = 5000;

        trefoil_knot_obj.init_trefoil_knot(gl, max_num_trefoil_knot_points);

        curr_object_handle     = trefoil_knot_obj.get_object_handle();
        curr_all_object_labels = trefoil_knot_obj.get_all_object_labels();

        object_label = curr_all_object_labels[0];

        activity_status[object_label] = true;

        active_draw_inner.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 5.0,
            rotation_property : rotation_grid,
            object_label    : object_label,
            shader_program : shaderProgram_01
        });
    }

    // --------------------    schwartz    -------------------- //

    if (true === state_animation.get_state(state_object_schwartz)) {

        // var max_num_schwartz_points = 200000;
        // var max_num_schwartz_points = 100000;
        // var max_num_schwartz_points = 10000;
        // var max_num_schwartz_points = 20000;
        var max_num_schwartz_points = 50000;

        schwartz_obj.init_schwartz(gl, max_num_schwartz_points);
        
        curr_object_handle     = schwartz_obj.get_object_handle();
        curr_all_object_labels = schwartz_obj.get_all_object_labels();

        object_label = curr_all_object_labels[0];

        activity_status[object_label] = true;

        active_draw_inner.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 1.0,
            rotation_property : rotation_grid,
            object_label    : object_label,
            shader_program : shaderProgram_01
        });

    }

    // --------------------    chladni    -------------------- //

    if (true === state_animation.get_state(state_object_chladni)) {

        // var max_num_chladni_points = 50000;
        var max_num_chladni_points = 35000;
        // var max_num_chladni_points = 5000;

        chladni_obj.do_chladni.init_chladni(gl, max_num_chladni_points);

        curr_object_handle     = chladni_obj.get_object_handle();
        curr_all_object_labels = chladni_obj.get_all_object_labels();

        object_label = curr_all_object_labels[0];

        activity_status[object_label] = true;

        active_draw_inner.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 1.0,
            rotation_property : rotation_none,
            object_label    : object_label,
            shader_program : shaderProgram_01
        });
    }


    // -------------    landscape   ------------- //

    if (true === state_animation.get_state(state_object_landscape)) {

        var MAX_LANDSCAPE_ANIMALS = 10000;

        // var landscape_min_x = -1.0;
        // var landscape_max_x =  1.0;
        // var landscape_min_y = -1.0;
        // var landscape_max_y =  1.0;
        // var landscape_min_z = -1.0;
        // var landscape_max_z =  1.0;


        var landscape_min_x =  5.0;
        var landscape_max_x =  3.0;
        var landscape_min_y = -4.0;
        var landscape_max_y = -2.0;
        var landscape_min_z = -1.0;
        var landscape_max_z =  1.0;


        // var landscape_min_x =  -3.0;
        // var landscape_max_x =  -1.0;
        // var landscape_min_y =  4.0;
        // var landscape_max_y =  2.0;
        // var landscape_min_z = -1.0;
        // var landscape_max_z =  1.0;


        // var landscape_min_x = -1.0;
        // var landscape_max_x =  1.0;
        // var landscape_min_y = -1.0;
        // var landscape_max_y =  1.0;
        // var landscape_min_z = -1.0;
        // var landscape_max_z =  1.0;


        landscape_obj.init_landscape(gl, MAX_LANDSCAPE_ANIMALS,
                                landscape_min_x, landscape_max_x, 
                                landscape_min_y, landscape_max_y, 
                                landscape_min_z, landscape_max_z);

        curr_object_handle     = landscape_obj.get_object_handle();
        curr_all_object_labels = landscape_obj.get_all_object_labels();

        // ---

        object_label = curr_all_object_labels[0];

        activity_status[object_label] = true;

        active_draw_inner.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 1.0,
            rotation_property : rotation_grid,
            object_label    : object_label,
            shader_program : shader_program_landscape
        });
    }


    // --------------------    audio_freq_domain    -------------------- //

    // var BUFF_SIZE = 16384;
    // var BUFF_SIZE = 8192;
    // var BUFF_SIZE = 4096;
    // var BUFF_SIZE = 2048;
    // var BUFF_SIZE = 1024;
    var BUFF_SIZE = 512;
    // var BUFF_SIZE = 256;

    if (true === state_animation.get_state(state_object_audio_domain)) {

        console.log("doing audio setup ... state_object_audio_domain " +
                    state_object_audio_domain);

         console.log(state_animation.get_state(state_object_audio_domain));

        // var max_num_rows_fft_cylinder = 512;
        // var max_num_columns_fft_cylinder = 800;


        degrees_rotation_fft = 160.0;    // determines speed of FFT cylinder rotation

        // var max_num_rows_fft_cylinder = 2;
        // var max_num_rows_fft_cylinder = 4;
        // var max_num_rows_fft_cylinder = 8;
        // var max_num_rows_fft_cylinder = 128;
        // var max_num_rows_fft_cylinder = 256;
        var max_num_rows_fft_cylinder = 512;

        // var max_num_columns_fft_cylinder = 3;
        // var max_num_columns_fft_cylinder = 5;
        // var max_num_columns_fft_cylinder = 8;
        // var max_num_columns_fft_cylinder = 50;
        // var max_num_columns_fft_cylinder = 100;
        var max_num_columns_fft_cylinder = 120;
        // var max_num_columns_fft_cylinder = 140; // too much
        // var max_num_columns_fft_cylinder = 150;



        var BUFF_SIZE_TIME_DOMAIN = 512;

        // var sample_depth = 200;     // granularity of each audio sample ... number of steps in time domain curve height
        var sample_depth = 1024;     // granularity of each audio sample ... number of steps in time domain curve height

        // flat wall of time domain audio curve - OK good one BUT points NOT lines

        audio_display_obj.init_audio_vis(   gl, 
                                            max_num_rows_fft_cylinder,
                                            max_num_columns_fft_cylinder, 
                                            BUFF_SIZE,
                                            sample_depth,
                                            BUFF_SIZE_TIME_DOMAIN);

        audio_display_obj.set_want_lines(true);

        webaudio_tooling_obj.init_context_audio(BUFF_SIZE, BUFF_SIZE_TIME_DOMAIN);

        audio_process_obj.init_audio_processing(gl, BUFF_SIZE);

        // active_object_handles

        curr_object_handle     = audio_display_obj.get_object_handle();
        curr_all_object_labels = audio_display_obj.get_all_object_labels();

        object_label = curr_all_object_labels[0];

        console.log("audio object_label..." + object_label);

        activity_status[object_label] = true;


        active_draw_inner.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 5.0,
            rotation_property : rotation_grid,
            object_label    : object_label,
            shader_program : shaderProgram_01
        });

        // ---

        object_label = curr_all_object_labels[1];

        console.log("audio object_label..." + object_label);

        activity_status[object_label] = true;

        active_draw_indexed_inner.push({

            flavor_graphics : curr_object_handle[object_label],
            rotation_property : rotation_fft,
            rotation_matrix : fft_matrix_rotation,
            object_label    : object_label,
            shader_program : shaderProgram_01,
            point_size     : 1.0
        });
        
        // ---
        
        object_label = curr_all_object_labels[2];

        console.log("audio object_label..." + object_label);

        activity_status[object_label] = true;

        console.log("here is audio time curve ... object_label " + object_label);

        active_draw_indexed_inner.push({

            flavor_graphics : curr_object_handle[object_label],
            rotation_property : rotation_time_domain,
            rotation_matrix : time_domain_matrix_rotation,
            object_label    : object_label,
            shader_program : shaderProgram_01,
            point_size     : 1.0
        });
        
        // ---

        // webaudio_tooling_obj.do_mute();

        webaudio_tooling_obj.play_tune_jam(2); // launch audio rendering and visualization

    }      //      true === state_animation.get_state(state_object_audio_domain)


    // -------------    fish and sharks   ------------- //

    if (true === state_animation.get_state(state_object_fish_and_sharks)) {

        // var chosen_model = Common_Utils.model_small;
        var chosen_model = Common_Utils.model_huge;

        fns.init_f_N_s( chosen_model,
                        world_min_x, world_min_y, world_max_x, world_max_y,
                        gl, shaderProgram_01);

        desired_point_size = fns.get_desired_point_size();

        console.log("desired_point_size " + desired_point_size);

        curr_object_handle     = fns.get_object_handle();
        curr_all_object_labels = fns.get_all_object_labels();

        // -------- fish -------- //

        object_label = curr_all_object_labels[0];

        console.log("object_label " + object_label);

        activity_status[object_label] = true;

        // ccc

        add_graphics_flavor_siblings(activity_siblings, object_label, curr_all_object_labels[1]);

        active_draw_inner.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : desired_point_size,
            rotation_property : rotation_none,
            object_label    : object_label,
            shader_program : shaderProgram_01
        });

        // -------- shark -------- //

        object_label = curr_all_object_labels[1];

        console.log("object_label " + object_label);

        activity_status[object_label] = true;

        add_graphics_flavor_siblings(activity_siblings, object_label, curr_all_object_labels[0]);

        active_draw_inner.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : desired_point_size,
            rotation_property : rotation_none,
            object_label    : object_label,
            shader_program : shaderProgram_01
        });

        // -------- doughnut -------- //
        
        object_label = curr_all_object_labels[2];

        console.log("object_label " + object_label);

        activity_status[object_label] = true;

        active_draw_indexed_inner.push({

            flavor_graphics : curr_object_handle[object_label],
            rotation_property : rotation_time_domain,
            rotation_matrix : torus_matrix_rotation,
            object_label    : object_label,
            shader_program : shaderProgram_01,
            point_size     : 1.0
        });
        

    }           // -------------    fish and sharks   ------------- //



    // ---

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // ---

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    curr_canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    // ----- handle cross browser mouse wheel

    if ("onmousewheel" in document) {

        document.onmousewheel = handleMouseScrollWheel;
    } else {
        document.addEventListener('DOMMouseScroll', handleMouseScrollWheel, false);
    }

    // ---

    // if (true === state_animation.get_state(state_object_audio_domain)) {

    //     console.log("... about to launch audio event loop");

    //     webaudio_tooling_obj.play_tune_jam(2); // launch audio rendering and visualization
    // }


    tick();
};

return {

    internal_webGLStart: internal_webGLStart,
    set_camera_perspectives: set_camera_perspectives,
    ui_events_entry_point : ui_events_entry_point
};

}();        //      webgl_3d_animation

