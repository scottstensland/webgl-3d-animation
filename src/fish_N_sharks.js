
	//	http://stackoverflow.com/questions/881515/javascript-namespace-declaration#answer-3588712

// var fns = {};

// fns._construct = function () {	//	this engulfs the entirety of below file
// var fns = function () {	//	this engulfs the entirety of below file


fns = function() {


var fish_colors = [];
fish_colors.R = 0.0;
fish_colors.G = 1.0;
fish_colors.B = 0.0;
fish_colors.A = 1.0;

var shark_colors = [];
shark_colors.R = 1.0;
shark_colors.G = 0.0;
shark_colors.B = 0.0;
shark_colors.A = 1.0;

var blank_colors = [];
blank_colors.R = 0.0;
blank_colors.G = 0.0;
blank_colors.B = 0.0;
blank_colors.A = 1.0;

// ---

// CONSTANTS
// var index_species = 0;  // grid_board[source_x][source_y][index_species] = species_fish;
// var index_animal = 1;   // grid_board[source_x][source_y][index_animal]  = 4;
// var index_age = 2;      // grid_board[source_x][source_y][index_age]     = 17;
// var index_hunger = 3;   // grid_board[source_x][source_y][index_hunger]  = 14;
// var MAX_BOARD_ATTRIBUTES = 4;   // IMPORTANT - if new index entries added above increment this


var index_species = 0;  // grid_board[source_x][source_y][index_species] = species_fish;
var index_animal = 1;   // grid_board[source_x][source_y][index_animal]  = 4;
var index_age = 2;      // grid_board[source_x][source_y][index_age]     = 17;
var index_hunger = 3;   // grid_board[source_x][source_y][index_hunger]  = 14;
var MAX_BOARD_ATTRIBUTES = 4;   // IMPORTANT - if new index entries added above increment this

// CONSTANTS
var species_fish = 0;
var species_shark = 1;
var species_no_animal_here = 2;


var species_fish = 0;
var species_shark = 1;
var species_no_animal_here = 2;


var unused = -1;    // place holder of no real value
// var hunger_eaten = -1;    // only used for fish after eaten by shark
var hunger_starved = -2;  // only used for shark after starvation

// ---


var desired_point_size = 1.0;

// ---

var conversion_grid_to_world_x;
var conversion_grid_to_world_y;

var conversion_world_to_grid_x;
var conversion_world_to_grid_y;


var animals_fish = {};


var animals_sharks = {};


var animals_doughnut = {};


var playboard = {};        // grab bag of board items

// ---


// ---  CONSTANTS


var stop_early = false;
var count_chronos = 0;

var time_for_birthin_fish;
var time_for_birthin_shark;
var time_for_shark_starvation;

var invisible = 88888.0;
// var invisible = 0.0;

var do_output;
var do_single_step;
var allow_sharks_to_eat_fish;

// -------  now setup doughnut -----------  //



var doughnut_box = [];          // stens TODO - maybe not needed used for static other doughnut visual
var curr_doughnut_box = 0;


// var doughnut_box_vertices = [];
var doughnut_box_vertices;
var curr_doughnut_vertex = 0;

var doughnut_box_colors;
var curr_doughnut_color = 0;

var doughnut_indices;
var curr_doughnut_index = 0;

// ---

var random_sequence;
var MAX_SIZE_RAND_SEQUENCE = 233;   // arbitrary ... just pick a nice prime
var curr_random = 0; // increment to walk thru sequence .. loop back to 0

var dead_fish_bucket = [];  // maintains index of dead fish
var dead_shark_bucket = [];

var curr_dead_fish = 0;
var curr_dead_shark = 0;

var SIZE_BOARD_X;
var SIZE_BOARD_Y;    // do a square board for now could be rectangular

var MAX_NUM_ANIMALS_PER_SPECIES;

var world_min_x;
var world_min_y;

var world_max_x;
var world_max_y;

var shaderProgram;

var gl;

// ----------- below will get populated by Common Utils namespace function
/*
var R;
var G;
var B;
var A;

var X;
var Y;
var Z;
var min;
var max;
var median;

var SIZE_DIM_3D;
var SIZE_DIM_COLORS;
*/

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
var FLT_MIN_nnnn = -99999.99;

// ---


var neighbor_min_value = 0;     // sequence consists of random series of 0, 1, 2 or 3
var neighbor_max_value = 3;     // which indicate N, S, E or West IE. neighbor directions

// pre calculated random sequence 0<->3
random_sequence = Common_Utils.generate_random_sequence(MAX_SIZE_RAND_SEQUENCE, neighbor_min_value, neighbor_max_value);

// console.debug('playboard.grid_board   ', "%o", playboard.grid_board);

// show_values();


// ---

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

    
// console.log("initial def    mvMatrix = " + mat4.str(mvMatrix));



// ------------------------------------------




function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}


// ----------- above will get populated by Common Utils namespace function

function init_board(size_x, size_y) {  // stens TODO verify this is OK
                                                                    // looks bad ... where to put new Array()

    var local_grid_board = new Array();   // flat surface animals walk about across X & Y

    for (var index_x = 0; index_x < size_x; index_x++) {

        local_grid_board[index_x] = new Array();

        for (var index_y = 0; index_y < size_y; index_y++) {

            local_grid_board[index_x][index_y] = new Array();

            for (var curr_attrib = 0; curr_attrib < MAX_BOARD_ATTRIBUTES; curr_attrib++) {

                if (curr_attrib === index_species) {

                    local_grid_board[index_x][index_y][curr_attrib] = species_no_animal_here;

                    // console.log('seeing species attribute');
                } else {

                    local_grid_board[index_x][index_y][curr_attrib] = 0;
                }
            }
        }
    }

    return local_grid_board;

}		//		init_board

// ---


function init_this_buffer(board, given_animal, given_max_animal, given_species, is_animal_fish) {

	// console.log('MAX_NUM_ANIMALS_PER_SPECIES ', MAX_NUM_ANIMALS_PER_SPECIES);
	// console.log('f N s init_this_buffer ..... SIZE_DIM_3D ', SIZE_DIM_3D);


    var this_species_vertices = new Float32Array(MAX_NUM_ANIMALS_PER_SPECIES * SIZE_DIM_3D);
    given_animal.vertices = this_species_vertices;

    // var this_species_colors = new Float32Array(MAX_NUM_FISH * MAX_NUM_SHARKS * SIZE_DIM_COLORS);
    var this_species_colors = new Float32Array(MAX_NUM_ANIMALS_PER_SPECIES * SIZE_DIM_COLORS);

    given_animal.colors = this_species_colors;

    var color_index = 0;
    var curr_vertex = 0;
    var curr_individual = 0;
    for (; curr_vertex < given_max_animal;) {

        var num_trials = 0;
        var max_attemps_find_empty_spot = 200;// could maintain a list of available spots to avoid this
        do {

            var x_index = Common_Utils.get_random_in_range_inclusive_int(board.board_min_x, board.board_max_x - 1);
            var y_index = Common_Utils.get_random_in_range_inclusive_int(board.board_min_y, board.board_max_y - 1);

            // var curr_x = x_index * conversion_grid_to_world_x + board.world_min_x;
            // var curr_y = y_index * conversion_grid_to_world_y + board.world_min_y;

            var curr_x = x_index * conversion_grid_to_world_x;
            var curr_y = y_index * conversion_grid_to_world_y;

            // console.log('curr_vertex ', curr_vertex, ' x_index ', x_index, '   curr_x ' , curr_x);
            // console.log('curr_vertex ', curr_vertex, ' y_index ', y_index, '   curr_y ' , curr_y);

            // console.log('species_no_animal_here ', species_no_animal_here, ' from array ', board.grid_board[x_index][y_index][index_species]);

            num_trials++;
    
        } while (species_no_animal_here != board.grid_board[x_index][y_index][index_species] &&
                    num_trials < max_attemps_find_empty_spot);

        if (num_trials >= max_attemps_find_empty_spot) {

            var error_msg_grid_too_full = 'ERROR - grid board is TOO full cannot find empty spot for baby animal';
            console.log(error_msg_grid_too_full);
            alert(error_msg_grid_too_full);
        }

        board.grid_board[x_index][y_index][index_species] = given_species;
        board.grid_board[x_index][y_index][index_animal]  = curr_individual;
        board.grid_board[x_index][y_index][index_age]     = 0;

        // --- vertex 1 of triangle 1

        given_animal.vertices[curr_vertex * SIZE_DIM_3D + X] = curr_x;
        given_animal.vertices[curr_vertex * SIZE_DIM_3D + Y] = curr_y;
        given_animal.vertices[curr_vertex * SIZE_DIM_3D + Z] = 0.0;

        // console.log(' X ', given_animal.vertices[curr_vertex * SIZE_DIM_3D + X],
        // 			' Y ', given_animal.vertices[curr_vertex * SIZE_DIM_3D + Y]);


        // cube_indices[curr_indices_index++] = curr_vertex;

        given_animal.colors[color_index + R] = is_animal_fish ? fish_colors.R : shark_colors.R;
        given_animal.colors[color_index + G] = is_animal_fish ? fish_colors.G : shark_colors.G;
        given_animal.colors[color_index + B] = is_animal_fish ? fish_colors.B : shark_colors.B;
        given_animal.colors[color_index + A] = is_animal_fish ? fish_colors.A : shark_colors.A;

        // console.log(cube_vertices[curr_index + X], cube_vertices[curr_index + Y], cube_vertices[curr_index + Z], curr_vertex);

        curr_vertex++;
        color_index += SIZE_DIM_COLORS;
        // curr_index += SIZE_DIM_3D;

        curr_individual++;
    }

    given_animal.count = curr_vertex;

    // ---

    given_animal.vertex_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_position_buffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(given_animal.vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.vertices, gl.STATIC_DRAW);
    given_animal.vertex_position_buffer.itemSize = 3;
    given_animal.vertex_position_buffer.numItems = curr_vertex;

    // ---

    given_animal.vertex_color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_color_buffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(given_animal.colors), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.colors, gl.STATIC_DRAW);
    given_animal.vertex_color_buffer.itemSize = 4;
    given_animal.vertex_color_buffer.numItems = curr_vertex;

    // ---

    // cubeVertexIndexBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_indices), gl.STATIC_DRAW);
    // cubeVertexIndexBuffer.itemSize = 1;
    // cubeVertexIndexBuffer.numItems = curr_vertex;

}       //      init_this_buffer


// ---


function init_buffers(given_playboard, given_size_board_x, given_size_board_y, given_max_fish, given_max_shark) {

    // console.log("given_max_fish ", given_max_fish);
    // console.log("given_max_shark ", given_max_shark);

    // var NUM_TRIANGLES = 5;
    // var SIZE_DIM_3D = 3;
    // var NUM_VERTEX_PER_TRI = 3;
    // var NUM_TRIANGLES_PER_ANIMAL = 2;   // animals are rectangular ... so 2 triangles per animal

    // ---

    var board_min_x = 0;
    var board_max_x = given_size_board_x;

    var board_min_y = 0;
    var board_max_y = given_size_board_y;

    // console.log('board_min_x ', board_min_x);
    // console.log('board_max_x ', board_max_x);

    // console.log('board_min_y ', board_min_y);
    // console.log('board_max_y ', board_max_y);


    // helper to convert integer grid board X or Y into float scaled to display world size typically -1 to 1

    conversion_grid_to_world_x = (world_max_x - world_min_x) / (board_max_x - board_min_x);
    conversion_grid_to_world_y = (world_max_y - world_min_y) / (board_max_y - board_min_y);

    // reverse of above - helper to convert from float world coords to int grid board X & Y

    conversion_world_to_grid_x = (board_max_x - board_min_x) / (world_max_x - world_min_x);
    conversion_world_to_grid_y = (board_max_y - board_min_y) / (world_max_y - world_min_y);

    // --

    var x_incr = (world_max_x - world_min_x) / (board_max_x - board_min_x);
    var y_incr = (world_max_y - world_min_y) / (board_max_y - board_min_y);

    // console.log('world_min_x ', world_min_x);
    // console.log('world_max_x ', world_max_x);
    
    // console.log('world_min_y ', world_min_y);
    // console.log('world_max_y ', world_max_y);


    // console.log('board_min_x ', board_min_x);
    // console.log('board_max_x ', board_max_x);
    
    // console.log('board_min_y ', board_min_y);
    // console.log('board_max_y ', board_max_y);
    

    // console.log('x_incr ', x_incr, world_max_x, world_min_x, board_max_x, board_min_x);
    // console.log('y_incr ', y_incr, world_max_y, world_min_y, board_max_y, board_min_y);

    // console.log('conversion_grid_to_world_x ', conversion_grid_to_world_x);
    // console.log('conversion_grid_to_world_y ', conversion_grid_to_world_y);

    // console.log('conversion_world_to_grid_x ', conversion_world_to_grid_x);
    // console.log('conversion_world_to_grid_y ', conversion_world_to_grid_y);

    // (Math.random() * (max_end - min_end) + min_end);

    // for (curr_index = 0; 
    //   curr_index < NUM_TRIANGLES * SIZE_DIM_3D * NUM_VERTEX_PER_TRI; 
    //   curr_index += SIZE_DIM_3D) {


    given_playboard.board_min_x = board_min_x;
    given_playboard.board_max_x = board_max_x;
    given_playboard.board_min_y = board_min_y;
    given_playboard.board_max_y = board_max_y;

    given_playboard.world_min_x = world_min_x;
    given_playboard.world_min_y = world_min_y;

    animals_fish.want_translate = false;

    var is_animal_fish = true;
    init_this_buffer(given_playboard, animals_fish, given_max_fish, species_fish, is_animal_fish);

    animals_sharks.want_translate = false;

    is_animal_fish = false;
    init_this_buffer(given_playboard, animals_sharks, given_max_shark, species_shark, is_animal_fish);

}       //      init_buffers

// ---

function setMatrixUniforms(given_point_size, gl) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniform1f(shaderProgram.point_size, given_point_size);
    gl.uniform2f(shaderProgram.screen_resolution, gl.viewportWidth, gl.viewportHeight); // vec2 for shader

    // console.log('fish N shark width ', gl.viewportWidth, ' height ',
    // 									gl.viewportHeight);
}

function inner_indexed_draw(given_animal) {

    mvPushMatrix();
    // Common_Utils.mvPushMatrix(mvMatrix, mvMatrixStack);

    // mat4.translate(mvMatrix, [0.7, -0.2, 3.0]);
    // mat4.translate(mvMatrix, [1.7, 0.8, 4.0]);   // OK for board 4 by 4
    // mat4.translate(mvMatrix, [min_max[X][median], min_max[Y][median], min_max[Z][median]]);   // OK for board 4 by 4
    mat4.translate(mvMatrix, [  given_animal.min_max[X][median], 
                                given_animal.min_max[Y][median],
                                given_animal.min_max[Z][median]]);   // OK for board 4 by 4


    mat4.rotate(mvMatrix, Common_Utils.degToRad(curr_degree_rotation_torus), [ 0.2,  0.2, -0.2]);

    // mat4.translate(mvMatrix, [-min_max[X][median], -min_max[Y][median], -min_max[Z][median]]);   // OK for board 4 by 4
    mat4.translate(mvMatrix, [  -given_animal.min_max[X][median], 
                                -given_animal.min_max[Y][median], 
                                -given_animal.min_max[Z][median]]);   // OK for board 4 by 4

    // mat4.translate(mvMatrix, [ 0, 0, 3.0]);   // OK for board 4 by 4



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
    // setMatrixUniforms(10.0, gl);

    gl.drawElements(gl.TRIANGLES, given_animal.vertex_indices_buffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();
     // Common_Utils.mvPopMatrix(mvMatrix, mvMatrixStack);


}		//		inner_indexed_draw


function get_neighbor_x(given_source_x, chosen_neighbor_index) {

    var answer_x;

    switch (chosen_neighbor_index) {

    case 0: {   // look left

        answer_x = given_source_x - 1;

        if (answer_x < playboard.board_min_x) {

            answer_x = playboard.board_max_x - 1;   // wrap back to far right
        }
        break;
    }

    case 1: {   // look right

        answer_x = given_source_x + 1;

        if (answer_x == playboard.board_max_x) {

            answer_x = playboard.board_min_x;   // wrap back to far left
        }
        break;
    }

    case 2: {   // look up

        answer_x = given_source_x;

        break;
    }

    case 3: {   // look down

        answer_x = given_source_x;

        break;
    }

    break;
    }

    return answer_x;

}   //  get_neighbor_x


function get_neighbor_y(given_source_y, chosen_neighbor_index) {

    var answer_y;

    switch (chosen_neighbor_index) {

    case 0: {   // look left

        answer_y = given_source_y;

        break;
    }

    case 1: {   // look right

        answer_y = given_source_y;

        break;
    }

    case 2: {   // look up

        answer_y = given_source_y - 1;

        if (answer_y < playboard.board_min_y) {

            answer_y = playboard.board_max_y - 1;   // wrap back to far bottom
        }
        break;
    }

    case 3: {   // look down

        answer_y = given_source_y + 1;

        if (answer_y == playboard.board_max_y) {

            answer_y = playboard.board_min_y;   // wrap back to far top
        }
        break;
    }

    break;
    }

    return answer_y;

}   //  get_neighbor_y

// ---



function show_grid() {

    console.log('show_grid  ........ grid_board  ');

    for (var index_x = 0; index_x < SIZE_BOARD_X; index_x++) {

        for (var index_y = 0; index_y < SIZE_BOARD_Y; index_y++) {

            var this_line = " attrib values ";

            for (var curr_attrib = 0; curr_attrib < MAX_BOARD_ATTRIBUTES; curr_attrib++) {

                this_line += "  " + playboard.grid_board[index_x][index_y][curr_attrib];
            }

            console.log("x&y ", index_x, index_y, this_line);
        }
    }
}




function show_animals(given_animal, given_label) {

    console.log('show_animals ', given_label, ' count ', given_animal.count);

    // console.debug("  given_animal.vertices  ", "%o", given_animal.vertices);
    // console.debug("  given_animal.vertices  ", "%o", given_animal.vertices);
    // console.log(' %c given_animal.vertices  ', 'background: #222; color: #bada55');

    var label_invisible = " <-- invisible";
    var msg_invisible;

    for (var curr_animal = 0; curr_animal < given_animal.count; curr_animal++) {

        msg_invisible = "";

        if (invisible == given_animal.vertices[curr_animal*SIZE_DIM_3D + X]) {

            msg_invisible = label_invisible;
        }

        console.log(given_label, ' vertices ', curr_animal, 
                    // ' X ', given_animal.vertices[curr_animal*SIZE_DIM_3D + X],
                    // ' Y ', given_animal.vertices[curr_animal*SIZE_DIM_3D + Y],
                    ' index X ', given_animal.vertices[curr_animal*SIZE_DIM_3D + X]*conversion_world_to_grid_x,
                    ' index Y ', given_animal.vertices[curr_animal*SIZE_DIM_3D + Y]*conversion_world_to_grid_y,
                    msg_invisible
                    );
    }
}


// ------------


function update_board() {

    if (do_single_step && stop_early) {

        return;
    }

    var found_new_location = false;
    var neighbor_index;
    var chosen_neighbor_index;
    var source_x, source_y;
    var target_x, target_y;

    if (do_output) {

        show_animals(animals_fish, 'fish');
        show_animals(animals_sharks, 'shark');
        show_grid();

        console.log('------------ top of chronos ------------------ ', count_chronos);
    }

    // ------------------ do fish movement ------------------
    // ------------------ do fish movement ------------------
    // ------------------ do fish movement ------------------

    var curr_animal_index = 0;  // curr_fish or curr_shark     ... keep separate as size 3
    var color_index = 0;        // color for curr_animal_index ... keep separate as size 4

    // console.log('animals_fish.count  ', animals_fish.count);

    var current_fish_count = animals_fish.count;    // just to avoid visiting new borns

    if (do_output) {

        console.log('prior to for loop current_fish_count ', current_fish_count);
    }

    for (; curr_animal_index < current_fish_count; curr_animal_index++) {

        var local_fish = curr_animal_index * SIZE_DIM_3D;

        if (invisible == animals_fish.vertices[local_fish + X]) {

            // if (do_output) {
            // console.log("doing a fish skip");
        // }

            continue;   // skip over dead fish
        }

        source_x = Math.round(animals_fish.vertices[local_fish + X] * conversion_world_to_grid_x);
        source_y = Math.round(animals_fish.vertices[local_fish + Y] * conversion_world_to_grid_y);

        if (do_output) {

            console.log('TOP for loop fish curr_animal_index ', curr_animal_index,
                        ' source_x ', source_x, ' source_y ',source_y);
        }

        if (species_fish != playboard.grid_board[source_x][source_y][index_species]) {

            console.log('ERROR - looking at grid board for fish ', species_fish, 
                ' but saw : grid_board index_species ',
                playboard.grid_board[source_x][source_y][index_species],
                ' at source_x ', source_x, ' source_y ', source_y
                );
        }

        // if (hunger_eaten == playboard.grid_board[source_x][source_y][index_hunger]) {

        //     if (do_output) {

        //         console.log('ok this fish was eaten by shark so skip over it');
        //     }
        //     continue;
        // }

        playboard.grid_board[source_x][source_y][index_age]++;  // advance age by one chronos

        // console.log('curr_animal_index ', curr_animal_index, ' X&Y ', source_x, source_y,
        //     ' age ', playboard.grid_board[source_x][source_y][index_age]);

        found_new_location = false;
        neighbor_index = 0;

        do {

            chosen_neighbor_index = random_sequence[curr_random];

            target_x = get_neighbor_x(source_x, chosen_neighbor_index);
            target_y = get_neighbor_y(source_y, chosen_neighbor_index);

            // console.log('curr_animal_index ', curr_animal_index, ' X&Y ', source_x, source_y,
            // ' age ', playboard.grid_board[source_x][source_y][index_age],
            // ' target ', target_x, target_y);

            neighbor_index++;

            //      look for a blank spot

            if (species_no_animal_here == playboard.grid_board[target_x][target_y][index_species]) {

                if (do_output) {

                    console.log('moving fish to empty spot   target ', target_x, target_y);
                }

                //  OK found empty location so move fish here

                playboard.grid_board[target_x][target_y][index_species] = species_fish;

                playboard.grid_board[target_x][target_y][index_animal] = 
                playboard.grid_board[source_x][source_y][index_animal];

                playboard.grid_board[target_x][target_y][index_age] =
                playboard.grid_board[source_x][source_y][index_age];

                animals_fish.vertices[local_fish + X] = target_x * conversion_grid_to_world_x;
                animals_fish.vertices[local_fish + Y] = target_y * conversion_grid_to_world_y;
                animals_fish.vertices[local_fish + Z] = 0.0;
                    
                // ---

                doughnut_box_colors[(target_x * SIZE_BOARD_X + target_y) * 3 + R] = 0.0; // fish red
                doughnut_box_colors[(target_x * SIZE_BOARD_X + target_y) * 3 + G] = 1.0; // fish green
                doughnut_box_colors[(target_x * SIZE_BOARD_X + target_y) * 3 + B] = 0.0; // fish blue

                // ---

                if (playboard.grid_board[source_x][source_y][index_animal] == curr_animal_index) {

                    // OK cool

                } else {

                    console.log('ERROR - NO fish curr_animal_index is NOT == playboard.grid_board[source_x][source_y][index_animal]');
                }

                //  -----------  now vacate previous spot -----------

                if (time_for_birthin_fish < playboard.grid_board[source_x][source_y][index_age]) {

                    // fish gives birth

                    if (do_output) {
                    
                        console.log('fish gives birth');
                    }

                    playboard.grid_board[target_x][target_y][index_age] = 0; // parent moves to new location

                    // child stays back in source location

                    playboard.grid_board[source_x][source_y][index_species] = species_fish;
                    playboard.grid_board[source_x][source_y][index_age] = 0;

                    var baby_fish_index;

                    if (do_output) {
                    
                        console.log('prior  animals_fish.count  ', animals_fish.count);
                    }

                    if (curr_dead_fish > 0) {   // do we have any dead fish laying about - primed for resurrection

                        curr_dead_fish--;   // decrement dead fish count

                        baby_fish_index = dead_fish_bucket[curr_dead_fish];

                    } else {                    // create new baby fish out of thin air

                        baby_fish_index = animals_fish.count++;

                        animals_fish.vertex_position_buffer.numItems++;
                        animals_fish.vertex_color_buffer.numItems++;
                    }

                    if (do_output) {
                    
                        console.log('post animals_fish.count  ', animals_fish.count,
                                    ' baby_fish_index ', baby_fish_index);
                    }

                    playboard.grid_board[source_x][source_y][index_animal] = baby_fish_index;

                    animals_fish.vertices[baby_fish_index*SIZE_DIM_3D + X] = 
                                                    source_x * conversion_grid_to_world_x;

                    animals_fish.vertices[baby_fish_index*SIZE_DIM_3D + Y] = 
                                                    source_y * conversion_grid_to_world_y;

                    animals_fish.vertices[baby_fish_index*SIZE_DIM_3D + Z] = 0.0;

                    if (do_output) {

                        console.log('baby vertices X ', baby_fish_index*SIZE_DIM_3D + X,
                            ' Y ', baby_fish_index*SIZE_DIM_3D + Y,
                             ' source_x ', source_x, ' source_y ',source_y
                            );
                    }

                    animals_fish.colors[baby_fish_index*SIZE_DIM_COLORS + R] = fish_colors.R;
                    animals_fish.colors[baby_fish_index*SIZE_DIM_COLORS + G] = fish_colors.G;
                    animals_fish.colors[baby_fish_index*SIZE_DIM_COLORS + B] = fish_colors.B;
                    animals_fish.colors[baby_fish_index*SIZE_DIM_COLORS + A] = fish_colors.A;

                    // ---

                } else {        //  NOT YET    if (time_for_birthin_fish

                    if (do_output) {

                        console.log('no birth yet so vacate space ');
                    }

                    playboard.grid_board[source_x][source_y][index_species] = species_no_animal_here;
                    playboard.grid_board[source_x][source_y][index_animal]  = unused;
                    playboard.grid_board[source_x][source_y][index_age]     = unused;
                    playboard.grid_board[source_x][source_y][index_hunger]  = unused;


                doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + R] = 0.0; // fish red
                doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + G] = 0.0; // fish green
                doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + B] = 1.0; // fish blue

                }

                found_new_location = true;
            }

            curr_random++;

            if (curr_random == MAX_SIZE_RAND_SEQUENCE) {

                curr_random = 0;
            }

        } while (false == found_new_location && neighbor_index < 4);

        // color_index += SIZE_DIM_COLORS;

    }       //      for (; curr_animal_index

    // do_animation = false;   // stens TODO - remove this in a bit

    // ------------------ now do shark movement ------------------
    // ------------------ now do shark movement ------------------
    // ------------------ now do shark movement ------------------

    var baby_shark_index;

    if (do_output) {

        show_animals(animals_fish, 'fish');
        show_animals(animals_sharks, 'shark');

        show_grid();

        console.log('\n<><><>    end of fish ... start of shark   <><><>', count_chronos, '\n');
    }

    var current_shark_count = animals_sharks.count;    // just to avoid visiting new borns

    if (do_output) {

        console.log('prior to for loop current_shark_count ', current_shark_count);
    }

    curr_animal_index = 0;
    for (; curr_animal_index < current_shark_count; curr_animal_index++) {

        var local_shark = curr_animal_index * SIZE_DIM_3D;

        if (invisible == animals_sharks.vertices[local_shark + X]) {

            // console.log("seeing a dead shark skip");

            continue;   // skip over dead shark
        }

        source_x = Math.round(animals_sharks.vertices[local_shark + X] * conversion_world_to_grid_x);
        source_y = Math.round(animals_sharks.vertices[local_shark + Y] * conversion_world_to_grid_y);

        if (do_output) {

            console.log('TOP for loop shark curr_animal_index ', curr_animal_index,
                        ' source_x ', source_x, ' source_y ',source_y);
        }

        if (species_shark != playboard.grid_board[source_x][source_y][index_species]) {

            console.log('ERROR - looking at grid board for shark ', species_shark, 
                ' but saw : grid_board index_species ',
                playboard.grid_board[source_x][source_y][index_species],
                ' at source_x ', source_x, ' source_y ', source_y
                );
        }

        // if (hunger_starved == playboard.grid_board[source_x][source_y][index_hunger]) {

        //     if (do_output) {

        //         console.log('ok this shark was found starved so skip over it');   
        //     }
        //     continue;
        // }

        playboard.grid_board[source_x][source_y][index_age]++;  // advance age by one chronos
        playboard.grid_board[source_x][source_y][index_hunger]++;  // advance age by one chronos

        // --------- initially have shark look for neighbor fish -------------

        found_new_location = false;
        neighbor_index = 0;

        do {        //      hunt for fish only .... ignore any blank spots

            chosen_neighbor_index = random_sequence[curr_random];

            target_x = get_neighbor_x(source_x, chosen_neighbor_index);
            target_y = get_neighbor_y(source_y, chosen_neighbor_index);

            neighbor_index++;

//          std::cout << "target_x " << target_x << " target_y " << target_y << std::endl;

            // fish for a fish

            if (species_fish == playboard.grid_board[target_x][target_y][index_species] && 
                // hunger_eaten != playboard.grid_board[target_x][target_y][index_hunger]
                allow_sharks_to_eat_fish) {

                // OK found empty location to move fish onto - move there now

                var target_fish_index = playboard.grid_board[target_x][target_y][index_animal];

                // clean up dead fish

                dead_fish_bucket[curr_dead_fish++] = target_fish_index;

                animals_fish.vertices[target_fish_index*SIZE_DIM_3D + X] = invisible;  // stens TODO confirm OK
                animals_fish.vertices[target_fish_index*SIZE_DIM_3D + Y] = invisible;  // stens TODO confirm OK
                animals_fish.vertices[target_fish_index*SIZE_DIM_3D + Z] = invisible;  // stens TODO confirm OK

                  // stens TODO - probably NOT necessary as its location is off visible grid
                // animals_fish.colors[target_fish_index*SIZE_DIM_COLORS + R] = blank_colors.R;
                // animals_fish.colors[target_fish_index*SIZE_DIM_COLORS + G] = blank_colors.G;
                // animals_fish.colors[target_fish_index*SIZE_DIM_COLORS + B] = blank_colors.B;
                // animals_fish.colors[target_fish_index*SIZE_DIM_COLORS + A] = blank_colors.A;

                if (do_output) {

                    console.log('shark ', curr_animal_index, ' ATE fish ',target_fish_index,
                                ' source_x ', source_x, ' source_y ',source_y,
                                ' target_x ', target_x, ' target_y ',target_y
                                );
                }

// count reduction spot

                // ---------

                playboard.grid_board[target_x][target_y][index_species] = species_shark;

                playboard.grid_board[target_x][target_y][index_animal] =
                playboard.grid_board[source_x][source_y][index_animal];

                playboard.grid_board[target_x][target_y][index_age]    =
                playboard.grid_board[source_x][source_y][index_age];

                // stens TODO - assure you handle burial of freshly eaten fish

                animals_sharks.vertices[local_shark+X] = target_x * conversion_grid_to_world_x;
                animals_sharks.vertices[local_shark+Y] = target_y * conversion_grid_to_world_y;
                animals_sharks.vertices[local_shark+Z] = 0.0;



                doughnut_box_colors[(target_x * SIZE_BOARD_X + target_y) * 3 + R] = shark_colors.R; // shark red
                doughnut_box_colors[(target_x * SIZE_BOARD_X + target_y) * 3 + G] = shark_colors.G; // shark green
                doughnut_box_colors[(target_x * SIZE_BOARD_X + target_y) * 3 + B] = shark_colors.B; // shark blue




                if (playboard.grid_board[source_x][source_y][index_animal] == curr_animal_index) {

//                  std::cout << "YES fish curr_animal_index == grid_board[source_x][source_y][animal_index]"
//                          << std::endl;

                } else {

                    console.log("ERROR - while eating fish NO shark curr_animal_index is NOT == grid_board[source_x][source_y][animal_index]");
                    // exit(8);
                }

                // ------- can this shark give birth yet ------

                if (time_for_birthin_shark < playboard.grid_board[source_x][source_y][index_age]) {

                    // baby shark goes into source location

                    playboard.grid_board[source_x][source_y][index_species] = species_shark;
                    playboard.grid_board[source_x][source_y][index_age] = 0;
                    playboard.grid_board[source_x][source_y][index_hunger] = 0;

                    // var baby_shark_index;

                    if (0 < curr_dead_shark) {

                        curr_dead_shark--;

                        baby_shark_index = dead_shark_bucket[curr_dead_shark];

                    } else {

                        baby_shark_index = animals_sharks.count++;

                        animals_sharks.vertex_position_buffer.numItems++;
                        animals_sharks.vertex_color_buffer.numItems++;
                    }

                    playboard.grid_board[source_x][source_y][index_animal] = baby_shark_index;
// local_shark
                    animals_sharks.vertices[baby_shark_index*SIZE_DIM_3D +X] = 
                                                source_x * conversion_grid_to_world_x;

                    animals_sharks.vertices[baby_shark_index*SIZE_DIM_3D +Y] =
                                                source_y * conversion_grid_to_world_y;

                    animals_sharks.vertices[baby_shark_index*SIZE_DIM_3D +Z] = 0.0;


                    animals_sharks.colors[baby_shark_index*SIZE_DIM_COLORS + R] = shark_colors.R;
                    animals_sharks.colors[baby_shark_index*SIZE_DIM_COLORS + G] = shark_colors.G;
                    animals_sharks.colors[baby_shark_index*SIZE_DIM_COLORS + B] = shark_colors.B;
                    animals_sharks.colors[baby_shark_index*SIZE_DIM_COLORS + A] = shark_colors.A;

                    // ---

                } else {

                    // ------- now vacate previous spot -----------

                    playboard.grid_board[source_x][source_y][index_species] = species_no_animal_here;
                    playboard.grid_board[source_x][source_y][index_animal] = unused;
                    playboard.grid_board[source_x][source_y][index_age] = unused;



                doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + R] = 0.0; // shark red
                doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + G] = 0.0; // shark green
                doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + B] = 1.0; // shark blue


                }

                // -----------

                found_new_location = true;
            }

            curr_random++;
            if (curr_random == MAX_SIZE_RAND_SEQUENCE) {
                curr_random = 0;
            }

        } while (false == found_new_location && neighbor_index < 4);

        if (found_new_location) {

            continue;   // jump to next animal if above found fish for hungry shark
        }

        // --- since could not find any neighbor fish to eat ... just look for an empty spot

        // -------- has shark starved to death ?

        if (time_for_shark_starvation < playboard.grid_board[source_x][source_y][index_hunger]) {

            if (do_output) {

                console.log("shark just starved to death " << curr_animal_index);
            }

            dead_shark_bucket[curr_dead_shark++] = curr_animal_index;

            playboard.grid_board[source_x][source_y][index_species] = species_no_animal_here;
            playboard.grid_board[source_x][source_y][index_animal] = unused;
            playboard.grid_board[source_x][source_y][index_age] = unused;

            animals_sharks.vertices[local_shark + X] = invisible;
            animals_sharks.vertices[local_shark + Y] = invisible;
            animals_sharks.vertices[local_shark + Z] = invisible;


            doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + R] = 0.0; // shark red
            doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + G] = 0.0; // shark green
            doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + B] = 1.0; // shark blue



            continue;   // jump to next shark since this one just starved to death
        }
        // -------------

        neighbor_index = 0;

        // stens TODO - add efficiency logic to keep track of all neighbors and skip over
        //              neighbor if previously visited in above steps

        do {        // previously hunted for neighbor fish - no luck ... now just look for empty spot

            chosen_neighbor_index = random_sequence[curr_random];

            target_x = get_neighbor_x(source_x, chosen_neighbor_index);
            target_y = get_neighbor_y(source_y, chosen_neighbor_index);

            neighbor_index++;

            if (species_no_animal_here == playboard.grid_board[target_x][target_y][index_species]) {    

                // look for blank

                // OK found empty location to move shark onto - move there now

                playboard.grid_board[target_x][target_y][index_species] = species_shark;

                playboard.grid_board[target_x][target_y][index_animal] = 
                playboard.grid_board[source_x][source_y][index_animal];

                playboard.grid_board[target_x][target_y][index_age]    =
                playboard.grid_board[source_x][source_y][index_age];

                animals_sharks.vertices[local_shark + X] = target_x * conversion_grid_to_world_x;
                animals_sharks.vertices[local_shark + Y] = target_y * conversion_grid_to_world_y;
                animals_sharks.vertices[local_shark + Z] = 0.0;


            doughnut_box_colors[(target_x * SIZE_BOARD_X + target_y) * 3 + R] = 1.0; // shark red
            doughnut_box_colors[(target_x * SIZE_BOARD_X + target_y) * 3 + G] = 0.0; // shark green
            doughnut_box_colors[(target_x * SIZE_BOARD_X + target_y) * 3 + B] = 0.0; // shark blue



                if (playboard.grid_board[source_x][source_y][index_animal] == curr_animal_index) {

//                  std::cout << "YES shark curr_animal_index == grid_board[source_x][source_y][animal_index]"
//                          << std::endl;

                } else {

                    console.log("ERROR - moving to blank NO shark curr_animal_index is NOT == grid_board[source_x][source_y][animal_index]");
                    // exit(8);
                }

                // ------- can this shark give birth yet ------

                if (time_for_birthin_shark < playboard.grid_board[source_x][source_y][index_age]) {

                    // baby shark goes into source location

                    playboard.grid_board[source_x][source_y][index_species] = species_shark;
                    playboard.grid_board[source_x][source_y][index_age] = 0;
                    playboard.grid_board[source_x][source_y][index_hunger] = 0;

                    // var baby_shark_index;

                    if (0 < curr_dead_shark) {

                        curr_dead_shark--;

                        baby_shark_index = dead_shark_bucket[curr_dead_shark];

                    } else {

                        baby_shark_index = animals_sharks.count++;

                        animals_sharks.vertex_position_buffer.numItems++;
                        animals_sharks.vertex_color_buffer.numItems++;
                    }

                    playboard.grid_board[source_x][source_y][index_animal] = baby_shark_index;

                    animals_sharks.vertices[baby_shark_index*SIZE_DIM_3D +X] = 
                                                source_x * conversion_grid_to_world_x;
                    animals_sharks.vertices[baby_shark_index*SIZE_DIM_3D +Y] = 
                                                source_y * conversion_grid_to_world_y;
                    animals_sharks.vertices[baby_shark_index*SIZE_DIM_3D +Z] = 0.0;


                    animals_sharks.colors[baby_shark_index*SIZE_DIM_COLORS + R] = shark_colors.R;
                    animals_sharks.colors[baby_shark_index*SIZE_DIM_COLORS + G] = shark_colors.G;
                    animals_sharks.colors[baby_shark_index*SIZE_DIM_COLORS + B] = shark_colors.B;
                    animals_sharks.colors[baby_shark_index*SIZE_DIM_COLORS + A] = shark_colors.A;

                    // ---

                } else {

                    // ------- now vacate previous spot -----------

                    playboard.grid_board[source_x][source_y][index_species] = species_no_animal_here;
                    playboard.grid_board[source_x][source_y][index_animal] = unused;
                    playboard.grid_board[source_x][source_y][index_age] = unused;


            doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + R] = 0.0; // shark red
            doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + G] = 0.0; // shark green
            doughnut_box_colors[(source_x * SIZE_BOARD_X + source_y) * 3 + B] = 1.0; // shark blue


                }

                // -----------

                found_new_location = true;
            }

            curr_random++;
            if (curr_random == MAX_SIZE_RAND_SEQUENCE) {
                curr_random = 0;
            }

        } while (false == found_new_location && neighbor_index < 4);
    }

    // -------------  end of shark movement   ----------------

    if (do_output) {

        show_animals(animals_fish, 'fish');
        show_animals(animals_sharks, 'shark');
        show_grid();

        console.log('count fish ', animals_fish.count);
        console.log('count shark ', animals_sharks.count);

        console.log('------------ bottom of chronos ------------------ ', count_chronos++);
    }

    if (do_single_step) {

        stop_early = true;      // stens TODO - remove this in a bit
    }
}       //      update_board

// ---


function init_torus_buffers() {

    animals_doughnut.vertices = doughnut_box_vertices;

    animals_doughnut.colors = doughnut_box_colors;

    animals_doughnut.indices = doughnut_indices;

    // ---

    animals_doughnut.vertex_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, animals_doughnut.vertex_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, animals_doughnut.vertices, gl.STATIC_DRAW);
    animals_doughnut.vertex_position_buffer.itemSize = 3;
    animals_doughnut.vertex_position_buffer.numItems = curr_doughnut_vertex / 3;


    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, animals_doughnut.vertex_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    // ---

    animals_doughnut.vertex_color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, animals_doughnut.vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, animals_doughnut.colors, gl.STATIC_DRAW);
    animals_doughnut.vertex_color_buffer.itemSize = 3;
    animals_doughnut.vertex_color_buffer.numItems = curr_doughnut_color / 3;


    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, animals_doughnut.vertex_color_buffer.itemSize, gl.FLOAT, false, 0, 0);
    

    // ---

    animals_doughnut.vertex_indices_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, animals_doughnut.vertex_indices_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, animals_doughnut.indices, gl.STATIC_DRAW);
    animals_doughnut.vertex_indices_buffer.itemSize = 1;
    animals_doughnut.vertex_indices_buffer.numItems = curr_doughnut_index;

}       //      init_torus_buffers


// ---------------------------------------------

function init_doughnut() {

    doughnut_box_vertices = new Float32Array(MAX_NUM_ANIMALS_PER_SPECIES * SIZE_DIM_3D);
    doughnut_box_colors   = new Float32Array(MAX_NUM_ANIMALS_PER_SPECIES * SIZE_DIM_3D);
    doughnut_indices      = new Uint16Array(MAX_NUM_ANIMALS_PER_SPECIES * 6);

    var toggle_red_N_green = true;

    // var radius_of_letter_C = 0.16;    // thickness of doughnut
    var radius_of_letter_C = 0.2;    // thickness of doughnut
    // var radius_of_letter_C = 0.24;    // thickness of doughnut
    // var radius_of_letter_C = 1.6;    // thickness of doughnut
    // var radius_of_letter_C = 0.36;    // thickness of doughnut

    var x_center = -0.3;
//  float y_center = 0.5;
//  float z_center = 0.5;

    var working_main_radius;      // size of entire doughnut ... influenced by x_center above

    // var two_pi = 2.0 * M_PI;
    var two_pi = 2.0 * Math.PI;

    var incr_of_circle = 2.0 * Math.PI / playboard.board_max_x;
//  float outer_curr_x, outer_curr_y, outer_curr_z;
    var outer_curr_x,               outer_curr_z;
    var inner_curr_x, inner_curr_y, inner_curr_z;

    var doughnut_offset_x = 0.0;
    var doughnut_offset_y = 0.5;
    var doughnut_offset_z = 0.5;

    // std::cout << "incr_neck_choaker " << incr_of_circle << std::endl;

    // ------- synthesize a doughnut ---------       https://en.wikipedia.org/wiki/Unit_circle

    // --- first create a circle - lay a doughnut on a table cut through its diameter
    //                             so you have two C shaped halves - its cross section is this outer circle

    var total_count_outer_dim = (playboard.board_max_x * playboard.board_max_x);

    // stens TODO - probe with assembly to determine whether below two techniques are same
//    malloc2d(& temp_doughnut_box, total_count_outer_dim, num_dimensions_doughnut);

    // float (* temp_doughnut_box)[num_dimensions_doughnut] = (float (*)[3])calloc(total_count_outer_dim,sizeof*temp_doughnut_box);

    var temp_doughnut_box = [];

//    temp_doughnut_box[5][6] = 15.3;
//    printf("retrieved value previously stored is  %f\n", temp_doughnut_box[5][6]);

    var curr_temp_doughnut_box = 0;
    var outer_facet = 0;

    var min_max = [];   // will hold min/max of x y z

    Common_Utils.init_min_max(min_max);

    animals_doughnut.min_max = min_max;

    // console.debug("%o", min_max);

    // console.log('here is min_max X min ', min_max[X][min]);


    for (var outer_curr_radian = 0; 
             outer_curr_radian < two_pi; 
             outer_curr_radian += incr_of_circle, outer_facet++) {

        outer_curr_x = doughnut_offset_x + radius_of_letter_C * Math.cos(outer_curr_radian);
//      outer_curr_y = doughnut_offset_y;
        outer_curr_z = doughnut_offset_z + radius_of_letter_C * Math.sin(outer_curr_radian);

        if (do_output) {

            console.log(" outer_curr_x ", outer_curr_x,
                        " outer_curr_y          ",
                        " outer_curr_z ", outer_curr_z
            );   
        }

        // stens TODO may want to put in wrap around point back to starting point to close circle

        // --- then create the rest of the doughnut by spinning this circle around the doughnut center

        // now just make circles around main doughnut center for each point above
        // use same Z same Y as above ... just a new X - calculate circles about X & Y

        working_main_radius = outer_curr_x - x_center;

        var inner_facet = 0;

        for (var inner_curr_radian = 0; inner_curr_radian < two_pi; inner_curr_radian += incr_of_circle, inner_facet++) {

            inner_curr_x =  x_center          + working_main_radius * Math.cos(inner_curr_radian);
            inner_curr_y =  doughnut_offset_y + working_main_radius * Math.sin(inner_curr_radian);
            inner_curr_z = outer_curr_z;

            Common_Utils.populate_min_max(min_max, inner_curr_x, inner_curr_y, inner_curr_z);

            if (do_output) {

                console.log(" inner_curr_x ", inner_curr_x,
                            " inner_curr_y ", inner_curr_y,
                            " inner_curr_z ", inner_curr_z
                );
            }

            temp_doughnut_box[curr_temp_doughnut_box*SIZE_DIM_3D +X] = inner_curr_x;
            temp_doughnut_box[curr_temp_doughnut_box*SIZE_DIM_3D +Y] = inner_curr_y;
            temp_doughnut_box[curr_temp_doughnut_box*SIZE_DIM_3D +Z] = inner_curr_z;

//          fprintf(stdout, "temp_doughnut_box %d %d == %5.2f  %d=%5.2f  %d=%5.2f\n",
//                  curr_temp_doughnut_box,
//                  X,
//                  temp_doughnut_box[curr_temp_doughnut_box][X],
//                  Y,
//                  temp_doughnut_box[curr_temp_doughnut_box][Y],
//                  Z,
//                  temp_doughnut_box[curr_temp_doughnut_box][Z]
//                  );

            curr_temp_doughnut_box++;
        }

//      did_we_already_see_loop_once = true;

//      std::cout << " ________ next outer loop _________" << std::endl;
    }

    // console.debug("%o", min_max);

    // console.log('min_max X min ', min_max[X][min]);
    // console.log('min_max X max ', min_max[X][max]);
    // console.log('min_max X median ', min_max[X][median]);

    // console.log('min_max Y min ', min_max[Y][min]);
    // console.log('min_max Y max ', min_max[Y][max]);
    // console.log('min_max Y median ', min_max[Y][median]);


    // console.log('min_max Z min ', min_max[Z][min]);
    // console.log('min_max Z max ', min_max[Z][max]);
    // console.log('min_max Z median ', min_max[Z][median]);



    // ------- now doughnut creation is DONE iterate across to synthesize each of the two triangles per facet

    // var off_x = 1.8;
    // var off_y = -0.6;
    // var off_z = -1.5;


    // var off_x = -min_max[X][median];
    // var off_y = -min_max[Y][median];
    // var off_z = -min_max[Z][median];

    

    var off_x = 0;
    var off_y = 0;
    var off_z = 0;


    for (var i = 0; i < playboard.board_max_x; i++) {

        for (var j = 0; j < playboard.board_max_x; j++) {

            var bigger_i = i + 1;
            if (bigger_i == playboard.board_max_x) bigger_i = 0;

            var bigger_j = j + 1;
            if (bigger_j == playboard.board_max_x) bigger_j = 0;

            // -----------

            var corner_0 =        i * playboard.board_max_x + j;    // remember where we started from
            var corner_1 = bigger_i * playboard.board_max_x + j;
            var corner_2 = bigger_i * playboard.board_max_x + bigger_j;
            var corner_3 =        i * playboard.board_max_x + bigger_j;


            if (do_output) {

                console.log("corner_0 ",  corner_0,
                            " corner_1 ", corner_1,
                            " corner_2 ", corner_2,
                            " corner_3 ", corner_3
                );
            }

            // -------- cut the first triangle of current facet

            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +X] = off_x + temp_doughnut_box[corner_0*SIZE_DIM_3D +X];    // triangle 1 point 0
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Y] = off_y + temp_doughnut_box[corner_0*SIZE_DIM_3D +Y];
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Z] = off_z + temp_doughnut_box[corner_0*SIZE_DIM_3D +Z];


//          fprintf(stdout, "TRI 1 PT 0 %5.2f  %5.2f  %5.2f\n",
//                  doughnut_box[curr_doughnut_box][X],
//                  doughnut_box[curr_doughnut_box][Y],
//                  doughnut_box[curr_doughnut_box][Z]
//                  );

            curr_doughnut_box++;

            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +X] = off_x + temp_doughnut_box[corner_1*SIZE_DIM_3D +X];    // triangle 1 point 1
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Y] = off_y + temp_doughnut_box[corner_1*SIZE_DIM_3D +Y];
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Z] = off_z + temp_doughnut_box[corner_1*SIZE_DIM_3D +Z];


//          fprintf(stdout, "TRI 1 PT 1 %5.2f  %5.2f  %5.2f\n",
//                  doughnut_box[curr_doughnut_box][X],
//                  doughnut_box[curr_doughnut_box][Y],
//                  doughnut_box[curr_doughnut_box][Z]
//                  );

            curr_doughnut_box++;

            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +X] = off_x + temp_doughnut_box[corner_2*SIZE_DIM_3D +X];    // triangle 1 point 2
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Y] = off_y + temp_doughnut_box[corner_2*SIZE_DIM_3D +Y];
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Z] = off_z + temp_doughnut_box[corner_2*SIZE_DIM_3D +Z];


//          fprintf(stdout, "TRI 1 PT 1 %5.2f  %5.2f  %5.2f\n",
//                  doughnut_box[curr_doughnut_box][X],
//                  doughnut_box[curr_doughnut_box][Y],
//                  doughnut_box[curr_doughnut_box][Z]
//                  );

            curr_doughnut_box++;

            // -------- craft the second triangle of current facet
// left off here
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +X] = off_x + temp_doughnut_box[corner_2*SIZE_DIM_3D +X];    // triangle 2 point 2
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Y] = off_y + temp_doughnut_box[corner_2*SIZE_DIM_3D +Y];
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Z] = off_z + temp_doughnut_box[corner_2*SIZE_DIM_3D +Z];


//          fprintf(stdout, "TRI 2 PT 2 %5.2f  %5.2f  %5.2f\n",
//                  doughnut_box[curr_doughnut_box][X],
//                  doughnut_box[curr_doughnut_box][Y],
//                  doughnut_box[curr_doughnut_box][Z]
//                  );

            curr_doughnut_box++;

            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +X] = off_x + temp_doughnut_box[corner_3*SIZE_DIM_3D +X];    // triangle 2 point 3
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Y] = off_y + temp_doughnut_box[corner_3*SIZE_DIM_3D +Y];
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Z] = off_z + temp_doughnut_box[corner_3*SIZE_DIM_3D +Z];


//          fprintf(stdout, "TRI 2 PT 3 %5.2f  %5.2f  %5.2f\n",
//                  doughnut_box[curr_doughnut_box][X],
//                  doughnut_box[curr_doughnut_box][Y],
//                  doughnut_box[curr_doughnut_box][Z]
//                  );

            curr_doughnut_box++;

            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +X] = off_x + temp_doughnut_box[corner_0*SIZE_DIM_3D +X];    // triangle 2 point 0
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Y] = off_y + temp_doughnut_box[corner_0*SIZE_DIM_3D +Y];
            doughnut_box[curr_doughnut_box*SIZE_DIM_3D +Z] = off_z + temp_doughnut_box[corner_0*SIZE_DIM_3D +Z];


//          fprintf(stdout, "TRI 2 PT 0 %5.2f  %5.2f  %5.2f\n",
//                  doughnut_box[curr_doughnut_box][X],
//                  doughnut_box[curr_doughnut_box][Y],
//                  doughnut_box[curr_doughnut_box][Z]
//                  );

            curr_doughnut_box++;

            // ---------- now populate indexed doughnut vertices and colors

//          std::cout << "\n---------- now populate indexed doughnut vertices and colors\n" << std::endl;

            var vertex_offset_x = 0.0;  // moved all offsets into draw translate
            var vertex_offset_y = 0.0;
            var vertex_offset_z = 0.0;

            doughnut_box_vertices[curr_doughnut_vertex++] = vertex_offset_x + temp_doughnut_box[corner_0*SIZE_DIM_3D +X];
            doughnut_box_vertices[curr_doughnut_vertex++] = vertex_offset_y + temp_doughnut_box[corner_0*SIZE_DIM_3D +Y];
            doughnut_box_vertices[curr_doughnut_vertex++] = vertex_offset_z + temp_doughnut_box[corner_0*SIZE_DIM_3D +Z];
//          curr_doughnut_box++;

            var animal_red   = 1.0;
            var animal_green = 0.0;
            var animal_blue  = 0.0;

            if (toggle_red_N_green) {
                toggle_red_N_green = false;
            } else {
                toggle_red_N_green = true;

                animal_red = 0.0;
                animal_green = 1.0;
                animal_blue = 0.0;
            }

            doughnut_box_colors[curr_doughnut_color++] = animal_red;    // colors in RGB
            doughnut_box_colors[curr_doughnut_color++] = animal_green;
            doughnut_box_colors[curr_doughnut_color++] = animal_blue;


//          fprintf(stdout, "X %5.2f  Y %5.2f  Z %5.2f  RGB %5.2f %5.2f %5.2f\n",
//                  doughnut_box_vertices[curr_doughnut_vertex - 6],
//                  doughnut_box_vertices[curr_doughnut_vertex - 5],
//                  doughnut_box_vertices[curr_doughnut_vertex - 4],
//
//                  doughnut_box_vertices[curr_doughnut_vertex - 3],
//                  doughnut_box_vertices[curr_doughnut_vertex - 2],
//                  doughnut_box_vertices[curr_doughnut_vertex - 1]
//          );

            // ---- do indices now

            doughnut_indices[curr_doughnut_index++] = corner_0;
            doughnut_indices[curr_doughnut_index++] = corner_1;
            doughnut_indices[curr_doughnut_index++] = corner_2;

            doughnut_indices[curr_doughnut_index++] = corner_2;
            doughnut_indices[curr_doughnut_index++] = corner_3;
            doughnut_indices[curr_doughnut_index++] = corner_0;

            if (do_output) {

             console.log("index ",
                 doughnut_indices[curr_doughnut_index - 3],
                 doughnut_indices[curr_doughnut_index - 2],
                 doughnut_indices[curr_doughnut_index - 1]
            );
         }
        }
    }


    // free(temp_doughnut_box);     // stens TODO - confirm this array gets released

    // delete [] temp_doughnut_box;

    if (do_output) {

        console.log(" end of doughnut init with curr_doughnut_vertex == ", curr_doughnut_vertex);
    }

}   //  init_doughnut

// ---


function init_model(given_model) {

	// console.log('given_model in fns of ', given_model);

    allow_sharks_to_eat_fish = true;

    switch (given_model) {

        case Common_Utils.model_tiny : {

            seed_fish   = 1;
            seed_sharks = 1;

            SIZE_BOARD_X = 4;
            SIZE_BOARD_Y = SIZE_BOARD_X;    // do a square board for now could be rectangular

            // do_output = true;
            do_output = false;
            do_single_step = true;


            time_for_birthin_fish = 1;
            time_for_birthin_shark = 3;
            time_for_shark_starvation = 2;

            // desired_point_size = 50.0;

            desired_point_size = 0.8 * gl.viewportWidth / (1.0 * (SIZE_BOARD_X + 2));

            break;
        }

        case Common_Utils.model_small : {

            seed_fish   = 1;
            seed_sharks = 1;

            SIZE_BOARD_X = 50;
            SIZE_BOARD_Y = SIZE_BOARD_X;    // do a square board for now could be rectangular


            // do_output = true;
            do_output = false;

            // do_single_step = true;
            do_single_step = false;

            time_for_birthin_fish = 1;


            time_for_birthin_shark = 55;
            // time_for_birthin_shark = 999999;

            time_for_shark_starvation = 7;
            // time_for_shark_starvation = 999999;

             // gl.viewportWidth, ' height ', gl.viewportHeight);

            // desired_point_size = 50.0;
            desired_point_size = 0.8 * gl.viewportWidth / (1.0 * (SIZE_BOARD_X + 2));

            break;
        }

        case Common_Utils.model_large : {

            seed_fish   = 10;
            seed_sharks = 10;

            SIZE_BOARD_X = 100;
            SIZE_BOARD_Y = SIZE_BOARD_X;    // do a square board for now could be rectangular

            do_output = false;
            do_single_step = false;

            time_for_birthin_fish = 10;
            time_for_birthin_shark = 120;
            time_for_shark_starvation = 7;

            // time_for_birthin_fish = 999999;
            // time_for_birthin_shark = 999999;
            // time_for_shark_starvation = 999999;

            // desired_point_size = 2.0;
            desired_point_size = 0.7 * gl.viewportWidth / (1.0 * (SIZE_BOARD_X + 2));

            break;
        }

        case Common_Utils.model_huge : {

            // allow_sharks_to_eat_fish = false;

            seed_fish   = 4000;
            seed_sharks = 5000;

            SIZE_BOARD_X = 200;
            SIZE_BOARD_Y = SIZE_BOARD_X;    // do a square board for now could be rectangular

            do_output = false;
            do_single_step = false;

            time_for_birthin_fish = 10;
            time_for_birthin_shark = 95;
            time_for_shark_starvation = 7;

            // time_for_birthin_fish = 999999
            // time_for_birthin_shark = 999999;
            // time_for_shark_starvation = 999999;

            // desired_point_size = 0.2;
            desired_point_size = 0.8 * gl.viewportWidth / (1.0 * (SIZE_BOARD_X + 2));

            break;
        }

        case Common_Utils.model_monsterous : {

            seed_fish   = 100000;
            seed_sharks = 100000;

            SIZE_BOARD_X = 1500;
            SIZE_BOARD_Y = SIZE_BOARD_X;    // do a square board for now could be rectangular

            do_output = false;
            do_single_step = false;

            time_for_birthin_fish = 10;
            time_for_birthin_shark = 95;
            time_for_shark_starvation = 7;

            // time_for_birthin_fish = 999999
            // time_for_birthin_shark = 999999;
            // time_for_shark_starvation = 999999;

            // desired_point_size = 0.2;
            desired_point_size = 0.8 * gl.viewportWidth / (1.0 * (SIZE_BOARD_X + 2));

            // allow_sharks_to_eat_fish = false;

            break;
        }

        default : {

            break;
        }
    }

    MAX_NUM_ANIMALS_PER_SPECIES   = SIZE_BOARD_X * SIZE_BOARD_Y;
    // MAX_NUM_SHARKS = SIZE_BOARD_X * SIZE_BOARD_Y;

    // console.log('end of fns init model with desired_point_size ', desired_point_size);

}               //          init_model



function show_values() {

    console.log('curr_doughnut_vertex   ', curr_doughnut_vertex); 
    console.log('curr_doughnut_color   ', curr_doughnut_color); 
    console.log('curr_doughnut_index   ', curr_doughnut_index); 


    console.log('vertex_position_buffer.numItems   ', animals_doughnut.vertex_position_buffer.numItems);
    console.log('vertex_color_buffer.numItems   ',    animals_doughnut.vertex_color_buffer.numItems);
    console.log('vertex_indices_buffer.numItems   ',  animals_doughnut.vertex_indices_buffer.numItems);
}

// ------------
/*
function transfer_constants(given_namespace) {

    R = given_namespace.R;
    G = given_namespace.G;
    B = given_namespace.B;
    A = given_namespace.A;

    X = given_namespace.X;
    Y = given_namespace.Y;
    Z = given_namespace.Z;
    min = given_namespace.min;
    max = given_namespace.max;
    median = given_namespace.median;

    SIZE_DIM_3D     = given_namespace.SIZE_DIM_3D;
    SIZE_DIM_COLORS = given_namespace.SIZE_DIM_COLORS;
}
*/

/*
function inner_draw(given_animal, given_point_size, given_rotation) {

    mvPushMatrix();
    // Common_Utils.mvPushMatrix(mvMatrix, mvMatrixStack);

    if (given_animal.want_translate == true) {

        mat4.translate(mvMatrix, [  0.5, 
                                    0.5,
                                    0.5]);   // OK for board 4 by 4
    }

    // mat4.rotate(mvMatrix, degToRad(curr_degree_rotation_grid), [-0.1, -0.1, 0.1]);
    // mat4.rotate(mvMatrix, degToRad(given_rotation), [-0.1, -0.1, 0.1]);
    mat4.rotate(mvMatrix, Common_Utils.degToRad(given_rotation), [-0.09, -0.08, 0.11]);

    if (given_animal.want_translate == true) {

        mat4.translate(mvMatrix, [  -0.5, 
                                    -0.5,
                                    -0.5]);   // OK for board 4 by 4
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_position_buffer);

    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(given_animal.vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, given_animal.vertex_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    // -------------------------------------

    gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_color_buffer);

    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(given_animal.colors), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, given_animal.colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, given_animal.vertex_color_buffer.itemSize, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setMatrixUniforms(given_point_size, gl);

    // gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    gl.drawArrays(gl.POINTS, 0, given_animal.vertex_position_buffer.numItems);

    mvPopMatrix();
    // Common_Utils.mvPopMatrix(mvMatrix, mvMatrixStack);

    // console.log("mvMatrix = " + mat4.str(this.mvMatrix));
    console.log("mvMatrix = " + mat4.str(mvMatrix));


    // console.log('fish n shark numItems ', given_animal.vertex_position_buffer.numItems);

}		//		inner_draw
*/

// function wrapper_f_n_s_draw(given_mvMatrix) {

// 	mvMatrix = given_mvMatrix;

//     inner_draw(animals_fish, desired_point_size, 0);
//     inner_draw(animals_sharks, desired_point_size, 0);
// }


function get_desired_point_size() {

    return desired_point_size;
}

function init_f_N_s(given_chosen_model,
					min_x, min_y, max_x, max_y,
					given_gl, given_shaderProgram) {

    shaderProgram = given_shaderProgram;
    gl = given_gl;

	init_model(given_chosen_model);

    // console.log('about to draw desired_point_size ', desired_point_size);


    world_min_x = min_x;
    world_min_y = min_y;

    world_max_x = max_x;
    world_max_y = max_y;

    playboard.grid_board = init_board(SIZE_BOARD_X, SIZE_BOARD_Y);

    init_buffers(playboard, SIZE_BOARD_X, SIZE_BOARD_Y, seed_fish, seed_sharks);

    init_doughnut();

    init_torus_buffers();	
}

return {	// to make visible to calling reference frame list function here

  init_f_N_s: init_f_N_s,
  update_board: update_board,
  // wrapper_f_n_s_draw: wrapper_f_n_s_draw,
  animals_fish: animals_fish,
  animals_sharks: animals_sharks,
  animals_doughnut: animals_doughnut,
  update_board: update_board,
  get_desired_point_size: get_desired_point_size
};

}();	//	fns = function() 