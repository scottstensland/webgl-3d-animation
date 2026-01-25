import { mat4 } from 'gl-matrix';
import * as Common_Utils from './common/Common_Utils.js';
import * as borg_obj from './borg.js';
import * as trefoil_knot_obj from './trefoil_knot.js';
import * as schwartz_obj from './schwartz_surface.js';
import * as chladni_obj from './chladni.js';
import * as landscape_obj from './landscape.js';
import * as audio_display_obj from './audio_display.js';
import * as webaudio_tooling_obj from './webaudio_tooling.js';
import * as audio_process_obj from './audio_process.js';
import * as render_to_texture_obj from './render_to_texture.js';
import * as fns from './fish_N_sharks.js';
// Add imports for other files like ui_logic_handler, persistance_handler, communication_sockets, etc., once converted

"use strict";

let mvMatrix = mat4.create();
let mvMatrixStack = [];
let pMatrix = mat4.create();

// ------------- below are CONSTANTS shared with other scripts ------------------ //

const X = 0;
const Y = 1;
const Z = 2;
const min = 3;
const max = 4;
const median = 5;


let world_min_x = -0.5;
let world_min_y = -0.0;
let world_min_z = -2.0;

let world_max_x = 2.0;
let world_max_y = 2.0;
let world_max_z = 2.0;


let torus_matrix_rotation = [0.2, 0.2, -0.2];
// let fft_matrix_rotation = [ 0.6,  0.0, -0.0];
let fft_matrix_rotation = [0.9, 0.0, -0.0];
// let time_domain_matrix_rotation = [ -0.8,  0.0, 0.0];
let time_domain_matrix_rotation = [-0.0, 0.0, 0.4];

let rotation_degree = {};

let rotation_grid = "grid";
let rotation_fft = "fft";
let rotation_time_domain = "time_domain";


let rotation_none = "none";

rotation_degree[rotation_grid] = 0;
rotation_degree[rotation_fft] = 0;
rotation_degree[rotation_time_domain] = 0;
rotation_degree[rotation_none] = 0;

let activity_status = {}; // stores boolean to indicate active state for each graphics flavor
let activity_siblings = {}; // key is graphics flavor value is array of its siblings to enable
// enmass on/off for entire group of graphics falvors

let activity_callback = {}; // stores pair of callbacks executed on true/false of flavor

// let curr_degree_rotation_grid = 0;
// let curr_degree_rotation_torus = 0;

let degrees_rotation_fft = 160.0;

let stop_early = false;
let count_chronos = 0;

let do_output;
let do_single_step;

let last_time = 0;


let mouseDown = false;
let lastMouseX = null;
let lastMouseY = null;
let mouse_scroll_wheel_delta = 0;
let currentlyPressedKeys = {};
let moonRotationMatrix = mat4.create();

mat4.identity(moonRotationMatrix);

// let view_UI_current_state = true;
let view_UI_current_state = false;

// initialize mouse movement mat4 into nice viewing perspective



let FoV = 20.0;
let curr_pitch = -9.020000000000001;
let curr_yaw = 2.9000000000000017;
let curr_speed = 0;


let position_x = 10.0;
let position_y = -3.0;
let position_z = 10.021485672918804;

let curr_key_pressed = null;
let this_key = 1;

// ---

let curr_canvas;
let writable_output_pixels;


let delta_pitch = 0;
let delta_yaw = 0;
let speed = 0;


let desired_point_size = 1.0;

let shader_program_texture;
let shaderProgram_01;
let shaderProgram_02;
let shader_program_landscape;
let curr_shader_program = null;
let gl;

// ---

let xRot = 0;
let yRot = 0;
let zRot = 0;

let elapsed = 0;

// Arrays to hold graphics objects for rendering
let active_draw_inner = [];
let active_draw_indexed_inner = [];
let active_draw_texture = [];

// let cubeVertexPositionBuffer;
// let cubeVertexTextureCoordBuffer;
// let cubeVertexIndexBuffer;

// let neheTexture;

// let shaderProgram;

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



export function set_camera_perspectives() {

    // -------- these init value define starting perspective --------- //

    moonRotationMatrix = [0.7352716063878847, 0.27678643552261983, -0.6186537364637207, 0, -0.6667140427230679, 0.45943448572820017, -0.5868358226293043, 0, 0.12180678904838242, 0.8439628200499135, 0.5223584884859405, 0, 0, 0, 0, 1];

    FoV = 20.0;
    curr_pitch = 2.039999999999997;
    curr_yaw = 5.920000000000003;
    curr_speed = 0.01;

    position_x = 10.0;
    position_y = -3.0;
    position_z = 9.181939802075272;
}

const manage_shader_program = (() => {

    let local_shader_program = null;

    return {

        set: (given_gl, given_shader_program) => {

            if (local_shader_program !== given_shader_program) {

                given_gl.useProgram(given_shader_program);

                local_shader_program = given_shader_program;

                // console.log(".... had to toggle btw shader programs");
            }
        },
        get: () => {

            return local_shader_program;
        }
    };

})();

function initGL(canvas) {

    try {

        gl = canvas.getContext("webgl2"); // Updated to WebGL2

        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

        // console.log(gl.getSupportedExtensions().join("\n"));

    } catch (e) { }

    if (!gl) {
        alert("Could not initialise WebGL2. Falling back or check browser support.");
        gl = canvas.getContext("webgl"); // Fallback to WebGL1 if needed
    }
}


function getShader(gl, id) {

    const shaderScript = document.getElementById(id);
    if (!shaderScript) {

        console.error("ERROR - failed to find shader : " + id);

        return null;
    }

    let str = "";
    let k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType === 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    let shader;
    if (shaderScript.type === "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex") {
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

    let curr_vertex_shader = null;
    let curr_fragment_shader = null;

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
    curr_vertex_shader = getShader(gl, "vertex_shader_landscape");

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

    shader_program_landscape.pMatrixUniform = gl.getUniformLocation(shader_program_landscape, "uPMatrix");
    shader_program_landscape.mvMatrixUniform = gl.getUniformLocation(shader_program_landscape, "uMVMatrix");
    shader_program_landscape.point_size = gl.getUniformLocation(shader_program_landscape, "given_point_size");
    shader_program_landscape.screen_resolution = gl.getUniformLocation(shader_program_landscape, "u_resolution");

    // bbb

    shader_program_landscape.time = gl.getUniformLocation(shader_program_landscape, "u_time");


    // ---------------  shader set I ----------------- //

    curr_fragment_shader = getShader(gl, "fragment_shader_01");
    curr_vertex_shader = getShader(gl, "vertex_shader_01");

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

    shaderProgram_01.pMatrixUniform = gl.getUniformLocation(shaderProgram_01, "uPMatrix");
    shaderProgram_01.mvMatrixUniform = gl.getUniformLocation(shaderProgram_01, "uMVMatrix");
    shaderProgram_01.point_size = gl.getUniformLocation(shaderProgram_01, "given_point_size");
    shaderProgram_01.screen_resolution = gl.getUniformLocation(shaderProgram_01, "u_resolution");

}       //      initShaders

function mvPushMatrix() {
    const copy = mat4.create();
    mat4.copy(copy, mvMatrix);
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

    const local_shader_program = manage_shader_program.get();

    mvPushMatrix();

    mat4.translate(mvMatrix, mvMatrix, [given_animal.min_max[X][median],
    given_animal.min_max[Y][median],
    given_animal.min_max[Z][median]]);   // OK for board 4 by 4
    // ---

    mat4.rotate(mvMatrix, mvMatrix, Common_Utils.degToRad(given_rotation), given_matrix_rotation);

    mat4.translate(mvMatrix, mvMatrix, [-given_animal.min_max[X][median],
    -given_animal.min_max[Y][median],
    -given_animal.min_max[Z][median]]);   // OK for board 4 by 4
    // ---

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(local_shader_program.vertexPositionAttribute, given_animal.vertex_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    // -------------------------------------

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.colors, gl.DYNAMIC_DRAW);
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

    const local_shader_program = manage_shader_program.get();

    mvPushMatrix();

    if (given_animal.want_translate === true) {

        mat4.translate(mvMatrix, mvMatrix, given_animal.pre_translate);   // OK for board 4 by 4
    }

    if (given_animal.rotation_array) {

        mat4.rotate(mvMatrix, mvMatrix, Common_Utils.degToRad(given_rotation), given_animal.rotation_array);
    }

    if (given_animal.want_translate === true) {

        mat4.translate(mvMatrix, mvMatrix, given_animal.post_translate);   // OK for board 4 by 4
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

    const local_shader_program = manage_shader_program.get();

    mvPushMatrix();

    // mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -5.0]);
    mat4.translate(mvMatrix, mvMatrix, [6.0, 4.0, 1.0]);

    mat4.rotate(mvMatrix, mvMatrix, Common_Utils.degToRad(xRot), [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix, Common_Utils.degToRad(yRot), [0, 1, 0]);
    mat4.rotate(mvMatrix, mvMatrix, Common_Utils.degToRad(zRot), [0, 0, 1]);

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

export function drawScene(gl) {

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    mat4.identity(mvMatrix);

    // ---

    mat4.perspective(pMatrix, FoV, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    // mat4.identity(mvMatrix);

    // ---------- handle navigation

    mat4.rotate(mvMatrix, mvMatrix, Common_Utils.degToRad(-curr_pitch), [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix, Common_Utils.degToRad(-curr_yaw), [0, 1, 0]);

    mat4.translate(mvMatrix, mvMatrix, [-position_x, -position_y, -position_z]);

    // ----------

    mat4.translate(mvMatrix, mvMatrix, [world_min_x, world_min_y, world_min_z]);   // OK for board 4 by 4

    // ---

    mat4.multiply(mvMatrix, mvMatrix, moonRotationMatrix);

    // ---

    active_draw_inner.forEach((curr_element) => {  // ccc

        if (activity_status[curr_element.object_label]) {

            inner_draw(curr_element.flavor_graphics,
                curr_element.point_size,
                rotation_degree[curr_element.rotation_property],
                gl,
                curr_element.shader_program,
                true);
        }
    });

    // ---

    active_draw_indexed_inner.forEach((curr_element) => {

        if (activity_status[curr_element.object_label]) {

            inner_indexed_draw(curr_element.flavor_graphics,
                gl,
                rotation_degree[curr_element.rotation_property],
                curr_element.rotation_matrix,
                curr_element.shader_program,
                curr_element.point_size);
        }
    });

    // ---

    active_draw_texture.forEach((curr_element) => {

        if (activity_status[curr_element.object_label]) {

            texture_draw(curr_element.flavor_graphics,
                gl,
                curr_element.shader_program);
        }
    });

}       //      drawScene

function animate() {

    const timeNow = new Date().getTime();

    // Used to make us "jog" up and down as we move forward.
    let joggingAngle = 0;

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

        rotation_degree[rotation_fft] -= (degrees_rotation_fft * elapsed) / 1000.0;

        curr_yaw += delta_yaw * elapsed;
        curr_pitch += delta_pitch * elapsed;

        // --- uuu

        if (view_UI_current_state) {

            // console.log('delta_pitch ', delta_pitch, '  delta_yaw ', delta_yaw, '    speed ', speed);
        }
    }

    last_time = timeNow;
}

function tick() {

    requestAnimationFrame(tick);
    handleKeys();

    if (activity_status.animals_fish) {

        fns.update_board();
    }

    if (activity_status.animals_time_curve) {

        audio_display_obj.update_billboard();   // refreshes time domain cylinder
    }

    drawScene(gl);

    animate();   // remove comment to engage rotation animation
}

function process_a_keypress() {

    process_a_click();
}

function process_a_click() {

    stop_early = !stop_early;  // toggle true / false 
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
    const newX = event.clientX;
    const newY = event.clientY;

    const deltaX = newX - lastMouseX;
    const newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, newRotationMatrix, Common_Utils.degToRad(deltaX / 10), [0, 1, 0]);

    const deltaY = newY - lastMouseY;
    mat4.rotate(newRotationMatrix, newRotationMatrix, Common_Utils.degToRad(deltaY / 10), [1, 0, 0]);

    mat4.multiply(moonRotationMatrix, newRotationMatrix, moonRotationMatrix);

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

    FoV += - 0.004 * mouse_scroll_wheel_delta;
}

// ------------ handle keyboard navigation

function handleKeyDown(event) {

    event.preventDefault();

    currentlyPressedKeys[event.keyCode] = true;

    curr_key_pressed = event.keyCode;
}

function handleKeyUp(event) {

    event.preventDefault();

    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {

    const multiply_factor = 0.02;
    const zoom_factor = 0.2;

    if (currentlyPressedKeys[33]) {         // page up
        delta_pitch = multiply_factor;
    } else if (currentlyPressedKeys[34]) {  // page down
        delta_pitch = -multiply_factor;
    } else {
        delta_pitch = 0;
    }

    if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {         // left arrow OR a
        delta_yaw = multiply_factor;
    } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {  // right arrow OR d
        delta_yaw = -multiply_factor;
    } else {
        delta_yaw = 0;
    }

    if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {         // up arrow OR w
        speed = multiply_factor * zoom_factor;
    } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {  // down arrow OR s
        speed = -multiply_factor * zoom_factor;
    } else {
        speed = 0;
    }
}

// Add the missing functions from the original file here to restore the bottom part

function init_buffers(gl) {
    // Initialize borg point cloud
    borg_obj.init_borg(gl, 50000);
    const borg_handle = borg_obj.get_object_handle();

    active_draw_inner.push({
        object_label: 'animals_borg',
        flavor_graphics: borg_handle['animals_borg'],
        point_size: 1.5,
        rotation_property: rotation_grid,
        shader_program: shaderProgram_01
    });
    activity_status['animals_borg'] = true;

    // Initialize trefoil knot
    trefoil_knot_obj.init_trefoil_knot(gl, 30000);
    const trefoil_handle = trefoil_knot_obj.get_object_handle();

    active_draw_inner.push({
        object_label: 'animals_trefoil_knot',
        flavor_graphics: trefoil_handle['animals_trefoil_knot'],
        point_size: 1.5,
        rotation_property: rotation_grid,
        shader_program: shaderProgram_01
    });
    activity_status['animals_trefoil_knot'] = true;

    // Initialize schwartz surface
    schwartz_obj.init_schwartz(gl, 30000);
    const schwartz_handle = schwartz_obj.get_object_handle();

    active_draw_inner.push({
        object_label: 'animals_schwartz',
        flavor_graphics: schwartz_handle['animals_schwartz'],
        point_size: 1.5,
        rotation_property: rotation_grid,
        shader_program: shaderProgram_01
    });
    activity_status['animals_schwartz'] = true;

    // Initialize chladni
    chladni_obj.do_chladni.init_chladni(gl, 30000);
    const chladni_handle = chladni_obj.get_object_handle();

    active_draw_inner.push({
        object_label: 'animals_chladni',
        flavor_graphics: chladni_handle['animals_chladni'],
        point_size: 1.5,
        rotation_property: rotation_grid,
        shader_program: shaderProgram_01
    });
    activity_status['animals_chladni'] = true;

    // Initialize landscape
    const MAX_LANDSCAPE_ANIMALS = 10000;
    const landscape_min_x = 5.0;
    const landscape_max_x = 3.0;
    const landscape_min_y = -4.0;
    const landscape_max_y = -2.0;
    const landscape_min_z = -1.0;
    const landscape_max_z = 1.0;

    landscape_obj.init_landscape(gl, MAX_LANDSCAPE_ANIMALS, landscape_min_x, landscape_max_x, landscape_min_y, landscape_max_y, landscape_min_z, landscape_max_z);
    const landscape_handle = landscape_obj.get_object_handle();

    active_draw_inner.push({
        object_label: 'animals_pasture',
        flavor_graphics: landscape_handle['animals_pasture'],
        point_size: 2.0,
        rotation_property: rotation_grid,
        shader_program: shader_program_landscape
    });
    activity_status['animals_pasture'] = true;

    // Initialize Fish & Sharks (Restored model_huge values)
    // params: gl, size_x, size_y, max_fish, max_shark, birth_fish, birth_shark, starvation, 
    //         min_x, min_y, max_x, max_y, do_output, do_step, eat_fish

    // model_huge
    const size_board_x = 200;
    const size_board_y = 200;
    const seed_fish = 4000;
    const seed_sharks = 5000;
    const birth_fish = 10;
    const birth_shark = 95;
    const starvation = 7;

    // Initialize render_to_texture
    render_to_texture_obj.init(gl);
    const texture_handle = render_to_texture_obj.get_object_handle();
    const texture_labels = render_to_texture_obj.get_all_object_labels();
    const texture_label = texture_labels[0];

    active_draw_texture.push({
        flavor_graphics: texture_handle[texture_label],
        object_label: texture_label,
        shader_program: shader_program_texture
    });
    activity_status[texture_label] = true;

    // Dynamic point size calculation roughly based on viewport/board size
    const point_size_fns = (0.8 * gl.viewportWidth) / (size_board_x + 2);

    fns.init_fish_N_sharks(gl, size_board_x, size_board_y, seed_fish, seed_sharks, birth_fish, birth_shark, starvation, world_min_x, world_min_y, world_max_x, world_max_y, false, false, true);
    const fns_handle = fns.get_object_handle();

    active_draw_inner.push({
        object_label: 'animals_fish',
        flavor_graphics: fns_handle['animals_fish'],
        point_size: point_size_fns,
        rotation_property: rotation_none,
        shader_program: shaderProgram_01
    });
    activity_status['animals_fish'] = true;

    active_draw_inner.push({
        object_label: 'animals_sharks',
        flavor_graphics: fns_handle['animals_sharks'],
        point_size: point_size_fns,
        rotation_property: rotation_none,
        shader_program: shaderProgram_01
    });
    activity_status['animals_sharks'] = true;

    active_draw_indexed_inner.push({
        object_label: 'animals_doughnut',
        flavor_graphics: fns_handle['animals_doughnut'],
        point_size: 2.0,
        rotation_property: rotation_grid, // Was rotation_time_domain in original but used torus_matrix_rotation
        rotation_matrix: torus_matrix_rotation,
        shader_program: shaderProgram_01
    });
    activity_status['animals_doughnut'] = true;

    // Initialize Audio Display (Restored original values)
    // init_audio_vis(gl, rows_fft, cols_fft, buff_size, sample_depth, buff_size_time_domain)

    const max_num_rows_fft_cylinder = 512;
    const max_num_columns_fft_cylinder = 120;
    const buff_size = 512;
    const sample_depth = 1024;
    const buff_size_time_domain = 512;

    audio_display_obj.init_audio_vis(gl, max_num_rows_fft_cylinder, max_num_columns_fft_cylinder, buff_size, sample_depth, buff_size_time_domain);
    const audio_handle = audio_display_obj.get_object_handle();

    // Initialize audio processing with correct buffer size
    audio_process_obj.init_audio_processing(gl, buff_size);
    webaudio_tooling_obj.init_context_audio(buff_size, buff_size_time_domain);

    // Note: audio playback launch moved to user interaction or explicit start

    active_draw_inner.push({
        object_label: 'animals_audio_vis',
        flavor_graphics: audio_handle['animals_audio_vis'],
        point_size: 5.0,
        rotation_property: rotation_grid,
        shader_program: shaderProgram_01
    });
    activity_status['animals_audio_vis'] = true;

    active_draw_indexed_inner.push({
        object_label: 'animals_fft',
        flavor_graphics: audio_handle['animals_fft'],
        point_size: 1.0,
        rotation_property: rotation_fft,
        rotation_matrix: fft_matrix_rotation,
        shader_program: shaderProgram_01
    });
    activity_status['animals_fft'] = true;

    active_draw_indexed_inner.push({
        object_label: 'animals_time_curve',
        flavor_graphics: audio_handle['animals_time_curve'],
        point_size: 1.0,
        rotation_property: rotation_time_domain,
        rotation_matrix: time_domain_matrix_rotation,
        shader_program: shaderProgram_01
    });
    activity_status['animals_time_curve'] = true;

    console.log('All graphics objects initialized successfully!');
}

export function update_activity_status(label, isActive) {
    if (activity_status.hasOwnProperty(label)) {
        activity_status[label] = isActive;
        console.log(`Updated status for ${label} to ${isActive}`);
    } else {
        console.warn(`Label ${label} not found in activity_status`);
    }
}

export function internal_webGLStart() {
    const canvas = document.getElementById("ecology_simulation");
    initGL(canvas);
    initShaders(gl);
    set_camera_perspectives();
    init_buffers(gl);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    canvas.addEventListener("wheel", handleMouseScrollWheel, false);

    tick();
}
