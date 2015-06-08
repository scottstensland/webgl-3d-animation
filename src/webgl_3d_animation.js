
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


// curr_degree_rotation_time_domain


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
var curr_degree_rotation_torus = 0;
// var curr_degree_rotation_fft = 0;
// var curr_degree_rotation_time_domain = 0;

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

var delta_pitch = 0;
var delta_yaw = 0;
var speed = 0;


var desired_point_size = 1.0;

var shaderProgram;
var gl;

function initGL(canvas) {

    try {

        gl = canvas.getContext("experimental-webgl", { alpha: false });

        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

        console.log(gl.getSupportedExtensions().join("\n"));

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

    shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform    = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform   = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.point_size        = gl.getUniformLocation(shaderProgram, "given_point_size");
    shaderProgram.screen_resolution = gl.getUniformLocation(shaderProgram, "u_resolution");

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

    // ---

    mat4.rotate(mvMatrix, Common_Utils.degToRad(given_rotation), given_matrix_rotation);

    mat4.translate(mvMatrix, [  -given_animal.min_max[X][median], 
                                -given_animal.min_max[Y][median], 
                                -given_animal.min_max[Z][median]]);   // OK for board 4 by 4

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
    }

    if (given_animal.rotation_array) {

        mat4.rotate(mvMatrix, Common_Utils.degToRad(given_rotation), given_animal.rotation_array);        
    }

    if (given_animal.want_translate === true) {

        mat4.translate(mvMatrix, given_animal.post_translate);   // OK for board 4 by 4
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

function draw_scene(gl, shaderProgram) {

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

    mat4.translate(mvMatrix, [world_min_x, world_min_y, world_min_z]);   // OK for board 4 by 4

    // ---

    mat4.multiply(mvMatrix, moonRotationMatrix);


    active_inner_draw.forEach(function(curr_element) {  // ccc

        if (activity_status[curr_element.object_label]) {

            inner_draw( curr_element.flavor_graphics,
                        curr_element.point_size,
                        rotation_degree[curr_element.rotation_property],
                        gl, shaderProgram, true);            
        }

    });


    active_inner_indexed_draw.forEach(function(curr_element) {

        if (activity_status[curr_element.object_label]) {

            inner_indexed_draw( curr_element.flavor_graphics,
                                gl,
                                rotation_degree[curr_element.rotation_property],
                                curr_element.rotation_matrix);
        }
    });

    if (true === audio_process_obj.get_display_ready_flag()) {

        // pure synthesized curve based on sampled audio
        inner_draw(audio_process_obj.animals_synth, 2.0, rotation_degree[rotation_grid], gl, shaderProgram, true);

        inner_draw(audio_process_obj.animals_sampled, 2.0, rotation_degree[rotation_grid], gl, shaderProgram, true);
    }

    // ---

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

            rotation_degree[rotation_grid] -= (38 * elapsed) / 1000.0;

            rotation_degree[rotation_time_domain] -= (98.0 * elapsed) / 1000.0;
            // curr_degree_rotation_time_domain -= (0.0 * elapsed) / 1000.0;// NO rotation

            // curr_degree_rotation_torus -= (75 * elapsed) / 1000.0;
            curr_degree_rotation_torus -= (48 * elapsed) / 1000.0;

            // curr_degree_rotation_fft   -= (degrees_rotation_fft * elapsed) / 1000.0;
            rotation_degree[rotation_fft]   -= (degrees_rotation_fft * elapsed) / 1000.0;

            curr_yaw   += delta_yaw   * elapsed;
            curr_pitch += delta_pitch * elapsed;

            // --- uuu

            if (view_UI_current_state) {

                // console.log('delta_pitch ', delta_pitch, '  delta_yaw ', delta_yaw, '    speed ', speed);
            }            
        }
        last_time = timeNow; 

        curr_degree_rotation_torus = curr_degree_rotation_torus % 360;

        // curr_degree_rotation_fft   = curr_degree_rotation_fft   % 360;
        rotation_degree[rotation_fft]   = rotation_degree[rotation_fft]   % 360;
    }
}       //      animate

function tick() { // ccccccccc

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

    draw_scene(gl, shaderProgram);

    animate();   // remove comment to engage rotation animation

    // -------  write to output texture

    // gl.readPixels(0, 0, CANVAS.width, CANVAS.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    // pixels = new Float32Array(pixels.buffer);

// bbb

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

        // bbb

        chladni_obj.do_chladni.update_chladni(this_key, lastMouseX, lastMouseY); // bbb
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

var active_inner_draw = [];

var active_inner_indexed_draw = [];

var state_objects = [];

function internal_webGLStart() {

    var state_object_persistance_db = "object_persistance_db";

    var state_object_fish_and_sharks = "object_fish_and_sharks";
    var state_object_landscape = "object_landscape";
    var state_object_borg = "object_borg";
    var state_object_schwartz = "object_schwartz";
    var state_object_chladni = "object_chladni";
    var state_object_trefoil = "object_trefoil";
    var state_object_audio_domain = "object_audio_domain";
    var state_object_toggle_mute = "toggle_mute";

    // ---

    state_animation.add_animation_object(state_object_persistance_db);

    state_animation.add_animation_object(state_object_fish_and_sharks);
    state_animation.add_animation_object(state_object_landscape);
    state_animation.add_animation_object(state_object_borg);
    state_animation.add_animation_object(state_object_schwartz);
    state_animation.add_animation_object(state_object_chladni);
    state_animation.add_animation_object(state_object_trefoil);
    state_animation.add_animation_object(state_object_audio_domain);

    // --------------------------------------

    var curr_object_handle     = null;
    var curr_all_object_labels = null;
    var object_label           = null;

    // ---

    function add_graphics_flavor_siblings(siblings_obj, given_key, given_value) {

        console.log(" pre ------------- siblings_obj");
        console.log(siblings_obj);


        console.log(" ------------- given_key");
        console.log(given_key);


        console.log(" ------------- given_value");
        console.log(given_value);


        var curr_siblings = {};

        if (typeof siblings_obj[given_key] !== "undefined") {

            console.log(" cool seeing NO key for given_key " + given_key);

            curr_siblings = siblings_obj[given_key];
        }

        curr_siblings[given_value] = 1; // placeholder for sibling of given_key

        siblings_obj[given_key] = curr_siblings;

        // ---

        console.log(" post ------------- siblings_obj");
        console.log(siblings_obj);
    }

    set_camera_perspectives();

    curr_canvas = document.getElementById("ecology_simulation");
    initGL(curr_canvas);

    // var chosen_model = Common_Utils.model_small;
    var chosen_model = Common_Utils.model_huge;

    initShaders(gl);

    // ------------

    var size_canvas_colorspace = curr_canvas.width * curr_canvas.height * 4;

    writable_output_pixels = new Uint8Array(size_canvas_colorspace);

    // ------------

    // https://stackoverflow.com/questions/28827511/webgl-ios-render-to-floating-point-texture

    // set the webgl.enable-draft-extensions preference

    var available_extensions = gl.getSupportedExtensions();

    available_extensions.forEach(function(curr_extension) {

        if (curr_extension.startsWith("MOZ_")) {

            console.log(curr_extension + " ... skip size starts with MOZ_");

        } else {

            console.log("extension " + curr_extension + 
                        " value " +         gl.getExtension(curr_extension.toString()));
        }
    });

    console.log("here are retrieved system GL settings");
    console.log("          maxVSattribs " + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
    console.log("            maxTexSize " + gl.getParameter(gl.MAX_TEXTURE_SIZE));
    console.log("           maxCubeSize " + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));
    console.log("   maxRenderbufferSize " + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
    console.log("           vertexUnits " + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
    console.log("         fragmentUnits " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
    console.log("         combinedUnits " + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));

    // ------------

    activity_status[state_object_toggle_mute] = true; // toggle mute audio volume

    activity_callback[state_object_toggle_mute] = {

        true : webaudio_tooling_obj.do_mute,
        false : webaudio_tooling_obj.un_mute
    };

    // ------------

    if (true === state_animation.get_state(state_object_persistance_db)) {

        persistance_handler.entry_point(gl);

        curr_object_handle     = persistance_handler.get_object_handle();
        curr_all_object_labels = persistance_handler.get_all_object_labels();

        object_label = curr_all_object_labels[0];

        activity_status[object_label] = true;
    }


    // ------------

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

        active_inner_draw.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 1.0,
            rotation_property : rotation_grid,
            object_label    : object_label
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

        active_inner_draw.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 1.0,
            rotation_property : rotation_grid,
            object_label    : object_label
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

        active_inner_draw.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 1.0,
            rotation_property : rotation_none,
            object_label    : object_label
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

        active_inner_draw.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 5.0,
            rotation_property : rotation_grid,
            object_label    : object_label
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

        audio_display_obj.init_audio_vis(gl, max_num_rows_fft_cylinder, max_num_columns_fft_cylinder, BUFF_SIZE, sample_depth, BUFF_SIZE_TIME_DOMAIN);

        audio_display_obj.set_want_lines(true);

        webaudio_tooling_obj.init_context_audio(BUFF_SIZE, BUFF_SIZE_TIME_DOMAIN);

        audio_process_obj.init_audio_processing(gl, BUFF_SIZE);

        // active_object_handles

        curr_object_handle     = audio_display_obj.get_object_handle();
        curr_all_object_labels = audio_display_obj.get_all_object_labels();

        object_label = curr_all_object_labels[0];

        activity_status[object_label] = true;

        active_inner_draw.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 5.0,
            rotation_property : rotation_grid,
            object_label    : object_label
        });

        // ---

        object_label = curr_all_object_labels[1];

        activity_status[object_label] = true;

        active_inner_indexed_draw.push({

            flavor_graphics : curr_object_handle[object_label],
            rotation_property : rotation_fft,
            rotation_matrix : fft_matrix_rotation,
            object_label    : object_label
        });

        // ---

        object_label = curr_all_object_labels[2];

        activity_status[object_label] = true;

        console.log("here is audio time curve ... object_label " + object_label);

        active_inner_indexed_draw.push({

            flavor_graphics : curr_object_handle[object_label],
            rotation_property : rotation_time_domain,
            rotation_matrix : time_domain_matrix_rotation,
            object_label    : object_label            
        });

        // ---

        // webaudio_tooling_obj.do_mute();

    }      //      true === state_animation.get_state(state_object_audio_domain)

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


        landscape_obj.init_landscape(gl, MAX_LANDSCAPE_ANIMALS,
                                landscape_min_x, landscape_max_x, 
                                landscape_min_y, landscape_max_y, 
                                landscape_min_z, landscape_max_z);

        curr_object_handle     = landscape_obj.get_object_handle();
        curr_all_object_labels = landscape_obj.get_all_object_labels();

        // ---

        object_label = curr_all_object_labels[0];

        activity_status[object_label] = true;

        active_inner_draw.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : 2.0,
            rotation_property : rotation_grid,
            object_label    : object_label                        
        });
    }

    // -------------    fish and sharks   ------------- //

    if (true === state_animation.get_state(state_object_fish_and_sharks)) {

        fns.init_f_N_s( chosen_model,
                        world_min_x, world_min_y, world_max_x, world_max_y,
                        gl, shaderProgram);

        desired_point_size = fns.get_desired_point_size();

        curr_object_handle     = fns.get_object_handle();
        curr_all_object_labels = fns.get_all_object_labels();

        // ---

        object_label = curr_all_object_labels[0];

        activity_status[object_label] = true;

        // ccc

        add_graphics_flavor_siblings(activity_siblings, object_label, curr_all_object_labels[1]);

        active_inner_draw.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : desired_point_size,
            rotation_property : rotation_none,
            object_label    : object_label
        });

        // ---

        object_label = curr_all_object_labels[1];

        activity_status[object_label] = true;

        add_graphics_flavor_siblings(activity_siblings, object_label, curr_all_object_labels[0]);

        active_inner_draw.push({

            flavor_graphics : curr_object_handle[object_label],
            point_size      : desired_point_size,
            rotation_property : rotation_none,
            object_label    : object_label            
        });

        // ---

        object_label = curr_all_object_labels[2];

        activity_status[object_label] = true;

        active_inner_indexed_draw.push({

            flavor_graphics : curr_object_handle[object_label],
            rotation_property : rotation_time_domain,
            rotation_matrix : torus_matrix_rotation,
            object_label    : object_label
        });
    }

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

    // ---

    // communication_sockets_obj.socket_client(1); // create websocket connection from browser to server

    // ---

    webaudio_tooling_obj.play_tune_jam(2); // launch audio rendering and visualization

    tick(gl);

}       //      internal_webGLStart

var ui_events_entry_point = function(flavor_checkbox, given_event) {

    // console.log("nice ... " + flavor_checkbox + " now says " + given_event);

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

return {

    internal_webGLStart: internal_webGLStart,
    set_camera_perspectives: set_camera_perspectives,
    ui_events_entry_point : ui_events_entry_point
};

}();        //      webgl_3d_animation

