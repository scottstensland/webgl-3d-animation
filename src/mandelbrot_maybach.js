
// var webgl_3d_animation = function() {

(function () {

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

var curr_degree_rotation_grid = 0;
var curr_degree_rotation_torus = 0;
var curr_degree_rotation_fft = 0;
var curr_degree_rotation_time_domain = 0;

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

// console.log('\n\ncw + ss thurs 1105   \n\n');


var delta_pitch = 0;
var delta_yaw = 0;
var speed = 0;


var desired_point_size = 1.0;

var shaderProgram;
var gl;

function initGL(canvas) {

    // var gl;

    try {
        // gl = canvas.getContext("experimental-webgl");

        // http://games.greggman.com/game/webgl-and-alpha/
        gl = canvas.getContext("experimental-webgl", { alpha: false });
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

        // gl = gl;

        // console.log('inside initGL width ', gl.viewportWidth);
        // console.log('inside initGL height ', gl.viewportHeight);

    } catch (e) {}

    if (!gl) {
        alert("Could not initialise Webgl, go here to enable WebGL on your browser http://www.browserleaks.com/webgl");
    }
}


function getShader(gl, id) {

    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
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
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders(gl) {

    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");
    // var vertexShader_source = document.getElementById( 'shader-vs' ).textContent

    // var shaderProgram = gl.createProgram();
    shaderProgram = gl.createProgram();

    // shaderProgram = shaderProgram;

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    // shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    // gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    // shaderProgram.pMatrixUniform    = gl.getUniformLocation(shaderProgram, "uPMatrix");
    // shaderProgram.mvMatrixUniform   = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    // shaderProgram.point_size        = gl.getUniformLocation(shaderProgram, "given_point_size");
    // shaderProgram.screen_resolution = gl.getUniformLocation(shaderProgram, "u_resolution");

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

function setMatrixUniforms(given_point_size, gl) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniform1f(shaderProgram.point_size, given_point_size);
    gl.uniform2f(shaderProgram.screen_resolution, gl.viewportWidth, gl.viewportHeight); // vec2 for shader
}

// ---

function inner_indexed_draw(given_animal, gl, given_rotation, given_matrix_rotation) {

    mvPushMatrix();

    mat4.translate(mvMatrix, [  given_animal.min_max[X][median], 
                                given_animal.min_max[Y][median],
                                given_animal.min_max[Z][median]]);   // OK for board 4 by 4

    // var translation_1 = vec3.create();
    // vec3.set (translation_1, [  given_animal.min_max[X][median], 
    //                             given_animal.min_max[Y][median],
    //                             given_animal.min_max[Z][median]]);
    // mat4.translate (mvMatrix, mvMatrix, translation_1);  // OK for board 4 by 4

    // ---

    mat4.rotate(mvMatrix, Common_Utils.degToRad(given_rotation), given_matrix_rotation);

    mat4.translate(mvMatrix, [  -given_animal.min_max[X][median], 
                                -given_animal.min_max[Y][median], 
                                -given_animal.min_max[Z][median]]);   // OK for board 4 by 4


    // var translation_2 = vec3.create();
    // vec3.set (translation_2, [  given_animal.min_max[X][median], 
    //                             given_animal.min_max[Y][median],
    //                             given_animal.min_max[Z][median]]);
    // mat4.translate (mvMatrix, mvMatrix, translation_2);  // OK for board 4 by 4



    // ---

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, given_animal.vertex_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    // -------------------------------------

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, given_animal.vertex_color_buffer.itemSize, gl.FLOAT, false, 0, 0);

    // --------------------------------------

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, given_animal.indices, gl.STATIC_DRAW);

    setMatrixUniforms(desired_point_size, gl);

    if (given_animal.want_lines) {

        gl.drawElements(gl.LINES, given_animal.vertex_indices_buffer.numItems, gl.UNSIGNED_SHORT, 0);

    } else {

        gl.drawElements(gl.TRIANGLES, given_animal.vertex_indices_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    mvPopMatrix();

}       //      inner_indexed_draw

// ---

function inner_draw(given_animal, given_point_size, given_rotation, gl, 
                    shaderProgram, blob_tag) {

    mvPushMatrix();

    if (given_animal.want_translate === true) {

        mat4.translate(mvMatrix, given_animal.pre_translate);   // OK for board 4 by 4

        // var translation_1 = vec3.create();
        // vec3.set (translation_1, given_animal.pre_translate);
        // mat4.translate (mvMatrix, mvMatrix, translation_1);  // OK for board 4 by 4
    }

    if (given_animal.rotation_array) {

        mat4.rotate(mvMatrix, Common_Utils.degToRad(given_rotation), given_animal.rotation_array);        
    }

    if (given_animal.want_translate === true) {

        mat4.translate(mvMatrix, given_animal.post_translate);   // OK for board 4 by 4

        // var translation_2 = vec3.create();
        // vec3.set (translation_2, given_animal.post_translate);
        // mat4.translate (mvMatrix, mvMatrix, translation_2);  // OK for board 4 by 4
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_position_buffer);

    gl.bufferData(gl.ARRAY_BUFFER, given_animal.vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, given_animal.vertex_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    // -------------------------------------

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_color_buffer);

    gl.bufferData(gl.ARRAY_BUFFER, given_animal.colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, given_animal.vertex_color_buffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms(given_point_size, gl);

    gl.drawArrays(gl.POINTS, 0, given_animal.vertex_position_buffer.numItems);

    mvPopMatrix();

}       //      inner_draw

// var count_num_draw_calls = 0;

function draw_scene(gl, shaderProgram) {

    // console.log('count_num_draw_calls ', count_num_draw_calls);
    // count_num_draw_calls++;

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    // gl.clearColor(0.3, 0.3, 0.3, 1.0);  // background color gray
    gl.clearColor(0.1, 0.1, 0.1, 1.0);  // background color black
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    mat4.perspective(FoV , gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);

    // ---------- handle navigation

    mat4.rotate(mvMatrix, Common_Utils.degToRad(-curr_pitch), [1, 0, 0]);
    mat4.rotate(mvMatrix, Common_Utils.degToRad(-curr_yaw), [0, 1, 0]);

    mat4.translate(mvMatrix, [-position_x, -position_y, -position_z]);

    // var translation_1 = vec3.create();
    // vec3.set (translation_1, [-position_x, -position_y, -position_z]);
    // mat4.translate (mvMatrix, mvMatrix, translation_1);  // OK for board 4 by 4


    // ----------

    mat4.translate(mvMatrix, [world_min_x, world_min_y, world_min_z]);   // OK for board 4 by 4

    // var translation_2 = vec3.create();
    // vec3.set (translation_2, [world_min_x, world_min_y, world_min_z]);
    // mat4.translate (mvMatrix, mvMatrix, translation_2);  // OK for board 4 by 4

    // ---

    mat4.multiply(mvMatrix, moonRotationMatrix);

    // console.log(curr_degree_rotation_grid);

    inner_draw(borg_obj.animals_borg, 1.0, curr_degree_rotation_grid, gl, shaderProgram);


    inner_draw(schwartz_obj.animals_schwartz, 1.0, curr_degree_rotation_grid, gl, shaderProgram, true);

    // inner_draw(chladni_obj.animals_chladni, 1.0, curr_degree_rotation_grid, gl, shaderProgram, true);
    inner_draw(chladni_obj.animals_chladni, 1.0, 0, gl, shaderProgram, true);

    inner_draw(fns.animals_fish, desired_point_size, 0, gl, shaderProgram);
    inner_draw(fns.animals_sharks, desired_point_size, 0, gl, shaderProgram);

    inner_draw(trefoil_knot_obj.animals_trefoil_knot, 5.0, curr_degree_rotation_grid, gl, shaderProgram, true);

    // ---

    inner_indexed_draw(fns.animals_doughnut,      gl, curr_degree_rotation_torus, 
                                                    torus_matrix_rotation);

    // FFT cylinder
    inner_indexed_draw(audio_display_obj.animals_fft, gl, curr_degree_rotation_fft,
                                                    fft_matrix_rotation);

// vvv

// console.log('\n\ncw + ss   wed   1232   \n\n');

    // flat synth time domain wall
    // inner_indexed_draw(audio_process_obj.animals_audio_vis, gl, curr_degree_rotation_grid,
    //                                                 time_domain_matrix_rotation);

    // time domain cylinder
    inner_indexed_draw(audio_display_obj.animals_time_curve, gl, curr_degree_rotation_time_domain,
                                                    time_domain_matrix_rotation);

    // flat wall of time domain audio curve - OK good one BUT points NOT lines
    inner_draw(audio_display_obj.animals_audio_vis, 5.0, curr_degree_rotation_grid, gl, shaderProgram, true);


    if (true === audio_process_obj.get_display_ready_flag()) {

        // pure synthesized curve based on sampled audio
        inner_draw(audio_process_obj.animals_synth, 2.0, curr_degree_rotation_grid, gl, shaderProgram, true);

        inner_draw(audio_process_obj.animals_sampled, 2.0, curr_degree_rotation_grid, gl, shaderProgram, true);
    }

    // ---

    inner_draw(landscape.animals_pasture, 2.0, curr_degree_rotation_grid, gl, shaderProgram, true);

}       //      draw_scene

last_time = new Date().getTime();

function animate() {
    
    var do_animation = true;
    // var do_animation = false;

    // Used to make us "jog" up and down as we move forward.
    var joggingAngle = 0;

    if (do_animation) {

        var timeNow = new Date().getTime();
        if (last_time !== 0) {
            var elapsed = timeNow - last_time;

            if (speed !== 0) {

                position_x -= Math.sin(Common_Utils.degToRad(curr_yaw)) * speed * elapsed;
                position_z -= Math.cos(Common_Utils.degToRad(curr_yaw)) * speed * elapsed;

                joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)

                position_y = Math.sin(Common_Utils.degToRad(joggingAngle)) / 20 + 0.4;

                curr_speed = speed;
            }

            curr_degree_rotation_grid -= (38 * elapsed) / 1000.0;

            curr_degree_rotation_time_domain -= (98.0 * elapsed) / 1000.0;
            // curr_degree_rotation_time_domain -= (0.0 * elapsed) / 1000.0;// NO rotation

            // curr_degree_rotation_time_domain -= (48.0 * elapsed) / 1000.0;
            // curr_degree_rotation_time_domain += (1.0 * elapsed) / 1000.0;

            // console.log("curr_degree_rotation_grid " + curr_degree_rotation_grid);



            // curr_degree_rotation_torus -= (75 * elapsed) / 1000.0;
            curr_degree_rotation_torus -= (48 * elapsed) / 1000.0;
            curr_degree_rotation_fft   -= (degrees_rotation_fft * elapsed) / 1000.0;

            curr_yaw   += delta_yaw   * elapsed;
            curr_pitch += delta_pitch * elapsed;

            // --- uuu

            if (view_UI_current_state) {

                // console.log('delta_pitch ', delta_pitch, '  delta_yaw ', delta_yaw, '    speed ', speed);
            }            
        }
        last_time = timeNow; 

        curr_degree_rotation_torus = curr_degree_rotation_torus % 360;
        curr_degree_rotation_fft   = curr_degree_rotation_fft   % 360;
    }
}       //      animate

function tick() {

    requestAnimFrame(tick);
    handleKeys();

    fns.update_board();

    // chladni_obj.do_chladni.update_chladni(this_key, lastMouseX, lastMouseY); // bbb

    audio_display_obj.update_billboard();   // refreshes time domain cylinder

    draw_scene(gl, shaderProgram);

    animate();   // remove comment to engage rotation animation
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


// bbb

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

        // bbb

        chladni_obj.do_chladni.update_chladni(this_key, lastMouseX, lastMouseY); // bbb
    }

    if (currentlyPressedKeys[82]) {

        chladni_obj.do_chladni.reset_chladni();
    }

}

function go_full_screen() {

    // console.log('trying to go fullscreen 1140     ');

    // document.getElementById("ecology_simulation").requestFullScreen();

    var did_we_find_fullscreen_function = false;
    var providence = 0;
    var answer_to_document_fullScreen = false;


    var canvas = document.getElementById("ecology_simulation");
    if(canvas.requestFullScreen) {

        did_we_find_fullscreen_function = true;
        providence = 1;
        canvas.requestFullScreen();
    }
    else if(canvas.webkitRequestFullScreen) {

        did_we_find_fullscreen_function = true;
        providence = 2;
        canvas.webkitRequestFullScreen();
    }
    else if(canvas.mozRequestFullScreen) {

        did_we_find_fullscreen_function = true;
        providence = 3;
        canvas.mozRequestFullScreen();
    }

    answer_to_document_fullScreen = document.fullScreen;

    console.log('did_we_find_fullscreen_function ', did_we_find_fullscreen_function, 
                    ' providence ', providence, 
                    ' answer_to_document_fullScreen ', answer_to_document_fullScreen);

/*
    if(canvas.requestFullScreen)
        canvas.requestFullScreen();
    else if(canvas.webkitRequestFullScreen)
        canvas.webkitRequestFullScreen();
    else if(canvas.mozRequestFullScreen)
        canvas.mozRequestFullScreen();
*/

}       //      go_full_screen

// ------------

function internal_webGLStart() {

    // go_full_screen();

    // init_camera_perspectives();
    set_camera_perspectives();

    var curr_canvas = document.getElementById("ecology_simulation");
    initGL(curr_canvas);

    // var chosen_model = Common_Utils.model_small;
    var chosen_model = Common_Utils.model_huge;

    initShaders(gl);

    // ------------

    var maxVSattribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    var maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    var maxCubeSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    var maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);

    var vertexUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    var fragmentUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    var combinedUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    
    // var depthTextureExt = gl.getExtension("WEBKIT_WEBGL_depth_texture"); // Or browser-appropriate prefix
    var depthTextureExt = gl.getExtension("WEBGL_depth_texture"); // Or browser-appropriate prefix

    console.log("here are retrieved system GL settings");
    console.log("       maxVSattribs " + maxVSattribs);
    console.log("         maxTexSize " + maxTexSize);
    console.log("        maxCubeSize " + maxCubeSize);
    console.log("maxRenderbufferSize " + maxRenderbufferSize);
    console.log("        vertexUnits " + vertexUnits);
    console.log("      fragmentUnits " + fragmentUnits);
    console.log("      combinedUnits " + combinedUnits);
    console.log("      depthTextureExt " + depthTextureExt);

    // ------------

    // var MAX_BORG_POINTS = 10;
    // var MAX_BORG_POINTS = 10000;
    var MAX_BORG_POINTS = 50000;
    // var MAX_BORG_POINTS = 100000;
    // var MAX_BORG_POINTS = 300000;

    borg_obj.init_borg(gl, MAX_BORG_POINTS);


    // var max_num_schwartz_points = 200000;
    // var max_num_schwartz_points = 100000;
    // var max_num_schwartz_points = 10000;
    // var max_num_schwartz_points = 20000;
    var max_num_schwartz_points = 50000;

    schwartz_obj.init_schwartz(gl, max_num_schwartz_points);
    

    // ---

    // var max_num_chladni_points = 50000;
    var max_num_chladni_points = 35000;
    // var max_num_chladni_points = 5000;



    chladni_obj.do_chladni.init_chladni(gl, max_num_chladni_points);


    // bbb  

    // ---

    // var max_num_trefoil_knot_points = 1000;
    var max_num_trefoil_knot_points = 5000;

    trefoil_knot_obj.init_trefoil_knot(gl, max_num_trefoil_knot_points);

    // ---

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


    // var BUFF_SIZE = 16384;
    // var BUFF_SIZE = 8192;
    // var BUFF_SIZE = 4096;
    // var BUFF_SIZE = 2048;
    // var BUFF_SIZE = 1024;
    var BUFF_SIZE = 512;
    // var BUFF_SIZE = 256;

    var BUFF_SIZE_TIME_DOMAIN = 512;

    // var sample_depth = 200;     // granularity of each audio sample ... number of steps in time domain curve height
    var sample_depth = 1024;     // granularity of each audio sample ... number of steps in time domain curve height


    audio_display_obj.init_audio_vis(gl, max_num_rows_fft_cylinder, max_num_columns_fft_cylinder, BUFF_SIZE, sample_depth, BUFF_SIZE_TIME_DOMAIN);

    audio_display_obj.animals_audio_vis.want_lines = true; // stens TODO - necessary ... same if commented out so no
    // audio_display_obj.animals_audio_vis.want_lines = false;

    // ---

    webaudio_tooling_obj.init_context_audio(BUFF_SIZE, BUFF_SIZE_TIME_DOMAIN);

    // ---

    // just to stick toe into object to hold its context in memory
    audio_process_obj.init_audio_processing(gl, BUFF_SIZE);

    // ---

    var MAX_LANDSCAPE_ANIMALS = 10000;

    var landscape_min_x = -1.0;
    var landscape_max_x =  1.0;
    var landscape_min_y = -1.0;
    var landscape_max_y =  1.0;
    var landscape_min_z = -1.0;
    var landscape_max_z =  1.0;


    landscape.init_landscape(gl, MAX_LANDSCAPE_ANIMALS,
                            landscape_min_x, landscape_max_x, 
                            landscape_min_y, landscape_max_y, 
                            landscape_min_z, landscape_max_z);

    // ---

    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);

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

    // -------------

    fns.init_f_N_s( chosen_model,
                    world_min_x, world_min_y, world_max_x, world_max_y,
                    gl, shaderProgram);

    desired_point_size = fns.get_desired_point_size();

    // ---

    communication_sockets_obj.socket_client(1); // create websocket connection from browser to server

    // ---

    tick(gl);

}       //      internal_webGLStart

internal_webGLStart();


}());