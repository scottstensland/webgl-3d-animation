import * as Common_Utils from './common/Common_Utils.js';
import { mat4 } from 'gl-matrix';


const fish_colors = {
  R: 0.0,
  G: 1.0,
  B: 0.0,
  A: 1.0
};

const shark_colors = {
  R: 1.0,
  G: 0.0,
  B: 0.0,
  A: 1.0
};

const blank_colors = {
  R: 0.0,
  G: 0.0,
  B: 0.0,
  A: 1.0
};

// ---

// CONSTANTS
const index_species = 0;  // grid_board[source_x][source_y][index_species] = species_fish;
const index_animal = 1;   // grid_board[source_x][source_y][index_animal]  = 4;
const index_age = 2;      // grid_board[source_x][source_y][index_age]     = 17;
const index_hunger = 3;   // grid_board[source_x][source_y][index_hunger]  = 14;
const MAX_BOARD_ATTRIBUTES = 4;   // IMPORTANT - if new index entries added above increment this

// CONSTANTS
const species_fish = 0;
const species_shark = 1;
const species_no_animal_here = 2;

const unused = -1;    // place holder of no real value
const hunger_starved = -2;  // only used for shark after starvation

// ---

let desired_point_size = 1.0;

// ---

let conversion_grid_to_world_x;
let conversion_grid_to_world_y;

let conversion_world_to_grid_x;
let conversion_world_to_grid_y;

// ---------------------------------

const object_handle = {}; // holds all the various flavors of graphic object types

const animals_fish = "animals_fish";
const animals_sharks = "animals_sharks";
const animals_doughnut = "animals_doughnut";

object_handle[animals_fish] = {};
object_handle[animals_sharks] = {};
object_handle[animals_doughnut] = {};

const all_object_labels = [];

all_object_labels.push(animals_fish);
all_object_labels.push(animals_sharks);
all_object_labels.push(animals_doughnut);

// ---------------------------------

const playboard = {};        // grab bag of board items

// ---

// ---  CONSTANTS

let stop_early = false;
let count_chronos = 0;

let time_for_birthin_fish;
let time_for_birthin_shark;
let time_for_shark_starvation;

let invisible = 88888.0;

let do_output;
let do_single_step;
let allow_sharks_to_eat_fish;

// -------  now setup doughnut -----------  //

let doughnut_box = [];          // stens TODO - maybe not needed used for static other doughnut visual
let curr_doughnut_box = 0;

let doughnut_box_vertices;
let curr_doughnut_vertex = 0;

let doughnut_box_colors;
let curr_doughnut_color = 0;

let doughnut_indices;
let curr_doughnut_index = 0;

// ---

let random_sequence;
const MAX_SIZE_RAND_SEQUENCE = 233;   // arbitrary ... just pick a nice prime
let curr_random = 0; // increment to walk thru sequence .. loop back to 0

let dead_fish_bucket = [];  // maintains index of dead fish
let dead_shark_bucket = [];

let curr_dead_fish = 0;
let curr_dead_shark = 0;

let SIZE_BOARD_X;
let SIZE_BOARD_Y;    // do a square board for now could be rectangular

let MAX_NUM_ANIMALS_PER_SPECIES;

let world_min_x;
let world_min_y;

let world_max_x;
let world_max_y;

let shaderProgram;

let gl;

let R = 0;
let G = 1;
let B = 2;
let A = 3;

let X = 0;
let Y = 1;
let Z = 2;
let min_val = 3;
let max_val = 4;
let median = 5;

let SIZE_DIM_3D = 3;
let SIZE_DIM_COLORS = 4;

let FLT_MAX = 99999.99;
let FLT_MIN_nnnn = -99999.99;

// ---

let neighbor_min_value = 0;     // sequence consists of random series of 0, 1, 2 or 3
let neighbor_max_value = 3;     // which indicate N, S, E or West IE. neighbor directions

// pre calculated random sequence 0<->3
random_sequence = Common_Utils.generate_random_sequence(MAX_SIZE_RAND_SEQUENCE, neighbor_min_value, neighbor_max_value);

let mvMatrix = mat4.create();
let mvMatrixStack = [];
let pMatrix = mat4.create();

function mvPushMatrix() {
  const copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}

function mvPopMatrix() {
  if (mvMatrixStack.length === 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}

function init_board(size_x, size_y) {
  const local_grid_board = [];   // flat surface animals walk about across X & Y

  for (let index_x = 0; index_x < size_x; index_x++) {
    local_grid_board[index_x] = [];

    for (let index_y = 0; index_y < size_y; index_y++) {
      local_grid_board[index_x][index_y] = [];

      for (let curr_attrib = 0; curr_attrib < MAX_BOARD_ATTRIBUTES; curr_attrib++) {
        if (curr_attrib === index_species) {
          local_grid_board[index_x][index_y][curr_attrib] = species_no_animal_here;
        } else {
          local_grid_board[index_x][index_y][curr_attrib] = 0;
        }
      }
    }
  }

  return local_grid_board;
}

function init_this_buffer(board, given_animal, given_max_animal, given_species, is_animal_fish) {
  const this_species_vertices = new Float32Array(MAX_NUM_ANIMALS_PER_SPECIES * SIZE_DIM_3D);
  given_animal.vertices = this_species_vertices;

  const this_species_colors = new Float32Array(MAX_NUM_ANIMALS_PER_SPECIES * SIZE_DIM_COLORS);

  given_animal.colors = this_species_colors;

  let color_index = 0;
  let curr_vertex = 0;
  let curr_individual = 0;
  for (; curr_vertex < given_max_animal;) {
    let x_index = null;
    let y_index = null;

    let curr_x = null;
    let curr_y = null;

    let num_trials = 0;
    const max_attemps_find_empty_spot = 200;
    do {
      x_index = Common_Utils.get_random_in_range_inclusive_int(board.board_min_x, board.board_max_x - 1);
      y_index = Common_Utils.get_random_in_range_inclusive_int(board.board_min_y, board.board_max_y - 1);

      curr_x = x_index * conversion_grid_to_world_x;
      curr_y = y_index * conversion_grid_to_world_y;

      num_trials++;
    } while (species_no_animal_here !== board.grid_board[x_index][y_index][index_species] &&
      num_trials < max_attemps_find_empty_spot);

    if (num_trials >= max_attemps_find_empty_spot) {
      const error_msg_grid_too_full = 'ERROR - grid board is TOO full cannot find empty spot for baby animal';
      console.log(error_msg_grid_too_full);
      alert(error_msg_grid_too_full);
    }

    board.grid_board[x_index][y_index][index_species] = given_species;
    board.grid_board[x_index][y_index][index_animal] = curr_individual;
    board.grid_board[x_index][y_index][index_age] = 0;

    given_animal.vertices[curr_vertex * SIZE_DIM_3D + X] = curr_x;
    given_animal.vertices[curr_vertex * SIZE_DIM_3D + Y] = curr_y;
    given_animal.vertices[curr_vertex * SIZE_DIM_3D + Z] = 0.0;

    given_animal.colors[color_index + R] = is_animal_fish ? fish_colors.R : shark_colors.R;
    given_animal.colors[color_index + G] = is_animal_fish ? fish_colors.G : shark_colors.G;
    given_animal.colors[color_index + B] = is_animal_fish ? fish_colors.B : shark_colors.B;
    given_animal.colors[color_index + A] = is_animal_fish ? fish_colors.A : shark_colors.A;

    curr_vertex++;
    color_index += SIZE_DIM_COLORS;

    curr_individual++;
  }

  given_animal.count = curr_vertex;

  given_animal.vertex_position_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_position_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, given_animal.vertices, gl.STATIC_DRAW);
  given_animal.vertex_position_buffer.itemSize = 3;
  given_animal.vertex_position_buffer.numItems = curr_vertex;

  given_animal.vertex_color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, given_animal.vertex_color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, given_animal.colors, gl.STATIC_DRAW);
  given_animal.vertex_color_buffer.itemSize = 4;
  given_animal.vertex_color_buffer.numItems = curr_vertex;
}

function init_buffers(given_playboard, given_size_board_x, given_size_board_y, given_max_fish, given_max_shark) {
  const board_min_x = 0;
  const board_max_x = given_size_board_x;

  const board_min_y = 0;
  const board_max_y = given_size_board_y;

  conversion_grid_to_world_x = (world_max_x - world_min_x) / (board_max_x - board_min_x);
  conversion_grid_to_world_y = (world_max_y - world_min_y) / (board_max_y - board_min_y);

  conversion_world_to_grid_x = (board_max_x - board_min_x) / (world_max_x - world_min_x);
  conversion_world_to_grid_y = (board_max_y - board_min_y) / (world_max_y - world_min_y);

  given_playboard.board_min_x = board_min_x;
  given_playboard.board_max_x = board_max_x;
  given_playboard.board_min_y = board_min_y;
  given_playboard.board_max_y = board_max_y;

  given_playboard.world_min_x = world_min_x;
  given_playboard.world_min_y = world_min_y;

  object_handle[animals_fish].want_translate = false;

  let is_animal_fish = true;
  init_this_buffer(given_playboard, object_handle[animals_fish], given_max_fish, species_fish, is_animal_fish);

  object_handle[animals_sharks].want_translate = false;

  is_animal_fish = false;
  init_this_buffer(given_playboard, object_handle[animals_sharks], given_max_shark, species_shark, is_animal_fish);
}

function setMatrixUniforms(given_point_size, gl) {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  gl.uniform1f(shaderProgram.point_size, given_point_size);
  gl.uniform2f(shaderProgram.screen_resolution, gl.viewportWidth, gl.viewportHeight); // vec2 for shader
}

function get_neighbor_x(given_source_x, chosen_neighbor_index) {
  let answer_x;

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

      if (answer_x === playboard.board_max_x) {
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
  }

  return answer_x;
}

function get_neighbor_y(given_source_y, chosen_neighbor_index) {
  let answer_y;

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

      if (answer_y === playboard.board_max_y) {
        answer_y = playboard.board_min_y;   // wrap back to far top
      }
      break;
    }
  }

  return answer_y;
}

function show_grid() {
  console.log('show_grid  ........ grid_board  ');

  for (let index_x = 0; index_x < SIZE_BOARD_X; index_x++) {
    for (let index_y = 0; index_y < SIZE_BOARD_Y; index_y++) {
      let this_line = " attrib values ";

      for (let curr_attrib = 0; curr_attrib < MAX_BOARD_ATTRIBUTES; curr_attrib++) {
        this_line += "  " + playboard.grid_board[index_x][index_y][curr_attrib];
      }

      console.log("x&y ", index_x, index_y, this_line);
    }
  }
}

function show_animals(given_animal, given_label) {
  console.log('show_animals ', given_label, ' count ', given_animal.count);

  let label_invisible = " <-- invisible";
  let msg_invisible;

  for (let curr_animal = 0; curr_animal < given_animal.count; curr_animal++) {
    msg_invisible = "";

    if (invisible === given_animal.vertices[curr_animal * SIZE_DIM_3D + X]) {
      msg_invisible = label_invisible;
    }

    console.log(given_label, ' vertices ', curr_animal,
      ' index X ', given_animal.vertices[curr_animal * SIZE_DIM_3D + X] * conversion_world_to_grid_x,
      ' index Y ', given_animal.vertices[curr_animal * SIZE_DIM_3D + Y] * conversion_world_to_grid_y,
      msg_invisible
    );
  }
}

function update_board() {
  if (do_single_step && stop_early) {
    return;
  }

  let found_new_location = false;
  let neighbor_index;
  let chosen_neighbor_index;
  let source_x, source_y;
  let target_x, target_y;

  if (do_output) {
    show_animals(object_handle[animals_fish], 'fish');
    show_animals(object_handle[animals_sharks], 'shark');
    show_grid();

    console.log('------------ top of chronos ------------------ ', count_chronos);
  }

  // ------------------ do fish movement ------------------

  let curr_animal_index = 0;
  let color_index = 0;

  let current_fish_count = object_handle[animals_fish].count;

  if (do_output) {
    console.log('prior to for loop current_fish_count ', current_fish_count);
  }

  for (; curr_animal_index < current_fish_count; curr_animal_index++) {
    let local_fish = curr_animal_index * SIZE_DIM_3D;

    if (invisible === object_handle[animals_fish].vertices[local_fish + X]) {
      continue;   // skip over dead fish
    }

    source_x = Math.round(object_handle[animals_fish].vertices[local_fish + X] * conversion_world_to_grid_x);
    source_y = Math.round(object_handle[animals_fish].vertices[local_fish + Y] * conversion_world_to_grid_y);

    if (isNaN(source_x) || isNaN(source_y)) {
      continue;
    }

    if (source_x >= SIZE_BOARD_X) source_x = SIZE_BOARD_X - 1;
    if (source_x < 0) source_x = 0;
    if (source_y >= SIZE_BOARD_Y) source_y = SIZE_BOARD_Y - 1;
    if (source_y < 0) source_y = 0;

    if (do_output) {
      console.log('TOP for loop fish curr_animal_index ', curr_animal_index,
        ' source_x ', source_x, ' source_y ', source_y);
    }

    if (species_fish !== playboard.grid_board[source_x][source_y][index_species]) {
      console.log('ERROR - looking at grid board for fish ', species_fish,
        ' but saw : grid_board index_species ',
        playboard.grid_board[source_x][source_y][index_species],
        ' at source_x ', source_x, ' source_y ', source_y
      );
    }

    playboard.grid_board[source_x][source_y][index_age]++;  // advance age by one chronos

    found_new_location = false;
    neighbor_index = 0;

    do {
      chosen_neighbor_index = random_sequence[curr_random];

      target_x = get_neighbor_x(source_x, chosen_neighbor_index);
      target_y = get_neighbor_y(source_y, chosen_neighbor_index);

      neighbor_index++;

      if (species_no_animal_here === playboard.grid_board[target_x][target_y][index_species]) {
        if (do_output) {
          console.log('moving fish to empty spot   target ', target_x, target_y);
        }

        playboard.grid_board[target_x][target_y][index_species] = species_fish;

        playboard.grid_board[target_x][target_y][index_animal] =
          playboard.grid_board[source_x][source_y][index_animal];

        playboard.grid_board[target_x][target_y][index_age] =
          playboard.grid_board[source_x][source_y][index_age];

        object_handle[animals_fish].vertices[local_fish + X] = target_x * conversion_grid_to_world_x;
        object_handle[animals_fish].vertices[local_fish + Y] = target_y * conversion_grid_to_world_y;
        object_handle[animals_fish].vertices[local_fish + Z] = 0.0;

        // Update torus color for this cell to Green (Fish)
        let cell_index = (target_x * SIZE_BOARD_Y + target_y) * 6; // 6 vertices per cell
        for (let k = 0; k < 6; k++) {
          doughnut_box_colors[(cell_index + k) * 3 + R] = 0.0;
          doughnut_box_colors[(cell_index + k) * 3 + G] = 1.0;
          doughnut_box_colors[(cell_index + k) * 3 + B] = 0.0;
        }

        if (playboard.grid_board[source_x][source_y][index_animal] === curr_animal_index) {
          // OK cool
        } else {
          console.log('ERROR - NO fish curr_animal_index is NOT == playboard.grid_board[source_x][source_y][index_animal]');
        }

        if (time_for_birthin_fish < playboard.grid_board[source_x][source_y][index_age]) {
          if (do_output) {
            console.log('fish gives birth');
          }

          playboard.grid_board[target_x][target_y][index_age] = 0; // parent moves to new location

          playboard.grid_board[source_x][source_y][index_species] = species_fish;
          playboard.grid_board[source_x][source_y][index_age] = 0;

          let baby_fish_index;

          if (do_output) {
            console.log('prior  object_handle[animals_fish].count  ', object_handle[animals_fish].count);
          }

          if (curr_dead_fish > 0) {
            curr_dead_fish--;
            baby_fish_index = dead_fish_bucket[curr_dead_fish];
          } else {
            baby_fish_index = object_handle[animals_fish].count++;

            object_handle[animals_fish].vertex_position_buffer.numItems++;
            object_handle[animals_fish].vertex_color_buffer.numItems++;
          }

          if (do_output) {
            console.log('post object_handle[animals_fish].count  ', object_handle[animals_fish].count,
              ' baby_fish_index ', baby_fish_index);
          }

          playboard.grid_board[source_x][source_y][index_animal] = baby_fish_index;

          object_handle[animals_fish].vertices[baby_fish_index * SIZE_DIM_3D + X] =
            source_x * conversion_grid_to_world_x;

          object_handle[animals_fish].vertices[baby_fish_index * SIZE_DIM_3D + Y] =
            source_y * conversion_grid_to_world_y;

          object_handle[animals_fish].vertices[baby_fish_index * SIZE_DIM_3D + Z] = 0.0;

          if (do_output) {
            console.log('baby vertices X ', baby_fish_index * SIZE_DIM_3D + X,
              ' Y ', baby_fish_index * SIZE_DIM_3D + Y,
              ' source_x ', source_x, ' source_y ', source_y
            );
          }

          object_handle[animals_fish].colors[baby_fish_index * SIZE_DIM_COLORS + R] = fish_colors.R;
          object_handle[animals_fish].colors[baby_fish_index * SIZE_DIM_COLORS + G] = fish_colors.G;
          object_handle[animals_fish].colors[baby_fish_index * SIZE_DIM_COLORS + B] = fish_colors.B;
          object_handle[animals_fish].colors[baby_fish_index * SIZE_DIM_COLORS + A] = fish_colors.A;
        } else {
          if (do_output) {
            console.log('no birth yet so vacate space ');
          }

          playboard.grid_board[source_x][source_y][index_species] = species_no_animal_here;
          playboard.grid_board[source_x][source_y][index_animal] = unused;
          playboard.grid_board[source_x][source_y][index_age] = unused;
          playboard.grid_board[source_x][source_y][index_hunger] = unused;

          // Update torus color for source cell to Blue (Water)
          let cell_index = (source_x * SIZE_BOARD_Y + source_y) * 6;
          for (let k = 0; k < 6; k++) {
            doughnut_box_colors[(cell_index + k) * 3 + R] = 0.0;
            doughnut_box_colors[(cell_index + k) * 3 + G] = 0.0;
            doughnut_box_colors[(cell_index + k) * 3 + B] = 1.0;
          }
        }

        found_new_location = true;
      }

      curr_random++;

      if (curr_random === MAX_SIZE_RAND_SEQUENCE) {
        curr_random = 0;
      }
    } while (!found_new_location && neighbor_index < 4);
  }

  let baby_shark_index;

  if (do_output) {
    show_animals(object_handle[animals_fish], 'fish');
    show_animals(object_handle[animals_sharks], 'shark');

    show_grid();

    console.log('\n<><><>    end of fish ... start of shark   <><><>', count_chronos, '\n');
  }

  let current_shark_count = object_handle[animals_sharks].count;

  if (do_output) {
    console.log('prior to for loop current_shark_count ', current_shark_count);
  }

  curr_animal_index = 0;
  for (; curr_animal_index < current_shark_count; curr_animal_index++) {
    let local_shark = curr_animal_index * SIZE_DIM_3D;

    if (invisible === object_handle[animals_sharks].vertices[local_shark + X]) {
      continue;   // skip over dead shark
    }

    source_x = Math.round(object_handle[animals_sharks].vertices[local_shark + X] * conversion_world_to_grid_x);
    source_y = Math.round(object_handle[animals_sharks].vertices[local_shark + Y] * conversion_world_to_grid_y);

    if (isNaN(source_x) || isNaN(source_y)) {
      continue;
    }

    if (source_x >= SIZE_BOARD_X) source_x = SIZE_BOARD_X - 1;
    if (source_x < 0) source_x = 0;
    if (source_y >= SIZE_BOARD_Y) source_y = SIZE_BOARD_Y - 1;
    if (source_y < 0) source_y = 0;

    if (do_output) {
      console.log('TOP for loop shark curr_animal_index ', curr_animal_index,
        ' source_x ', source_x, ' source_y ', source_y);
    }

    if (species_shark !== playboard.grid_board[source_x][source_y][index_species]) {
      console.log('ERROR - looking at grid board for shark ', species_shark,
        ' but saw : grid_board index_species ',
        playboard.grid_board[source_x][source_y][index_species],
        ' at source_x ', source_x, ' source_y ', source_y
      );
    }

    playboard.grid_board[source_x][source_y][index_age]++;  // advance age by one chronos
    playboard.grid_board[source_x][source_y][index_hunger]++;  // advance hunger by one chronos

    found_new_location = false;
    neighbor_index = 0;

    do {
      chosen_neighbor_index = random_sequence[curr_random];

      target_x = get_neighbor_x(source_x, chosen_neighbor_index);
      target_y = get_neighbor_y(source_y, chosen_neighbor_index);

      neighbor_index++;

      if (species_fish === playboard.grid_board[target_x][target_y][index_species] && allow_sharks_to_eat_fish) {
        const target_fish_index = playboard.grid_board[target_x][target_y][index_animal];

        dead_fish_bucket[curr_dead_fish++] = target_fish_index;

        object_handle[animals_fish].vertices[target_fish_index * SIZE_DIM_3D + X] = invisible;
        object_handle[animals_fish].vertices[target_fish_index * SIZE_DIM_3D + Y] = invisible;
        object_handle[animals_fish].vertices[target_fish_index * SIZE_DIM_3D + Z] = invisible;

        if (do_output) {
          console.log('shark ', curr_animal_index, ' ATE fish ', target_fish_index,
            ' source_x ', source_x, ' source_y ', source_y,
            ' target_x ', target_x, ' target_y ', target_y
          );
        }

        playboard.grid_board[target_x][target_y][index_species] = species_shark;

        playboard.grid_board[target_x][target_y][index_animal] =
          playboard.grid_board[source_x][source_y][index_animal];

        playboard.grid_board[target_x][target_y][index_age] =
          playboard.grid_board[source_x][source_y][index_age];

        object_handle[animals_sharks].vertices[local_shark + X] = target_x * conversion_grid_to_world_x;
        object_handle[animals_sharks].vertices[local_shark + Y] = target_y * conversion_grid_to_world_y;
        object_handle[animals_sharks].vertices[local_shark + Z] = 0.0;

        // Update torus color for this cell to Red (Shark)
        let cell_index = (target_x * SIZE_BOARD_Y + target_y) * 6;
        for (let k = 0; k < 6; k++) {
          doughnut_box_colors[(cell_index + k) * 3 + R] = 1.0;
          doughnut_box_colors[(cell_index + k) * 3 + G] = 0.0;
          doughnut_box_colors[(cell_index + k) * 3 + B] = 0.0;
        }

        if (playboard.grid_board[source_x][source_y][index_animal] === curr_animal_index) {
          // OK cool
        } else {
          console.log('ERROR - while eating fish NO shark curr_animal_index is NOT == grid_board[source_x][source_y][animal_index]');
        }

        if (time_for_birthin_shark < playboard.grid_board[source_x][source_y][index_age]) {
          playboard.grid_board[source_x][source_y][index_species] = species_shark;
          playboard.grid_board[source_x][source_y][index_age] = 0;
          playboard.grid_board[source_x][source_y][index_hunger] = 0;

          if (0 < curr_dead_shark) {
            curr_dead_shark--;
            baby_shark_index = dead_shark_bucket[curr_dead_shark];
          } else {
            baby_shark_index = object_handle[animals_sharks].count++;

            object_handle[animals_sharks].vertex_position_buffer.numItems++;
            object_handle[animals_sharks].vertex_color_buffer.numItems++;
          }

          playboard.grid_board[source_x][source_y][index_animal] = baby_shark_index;

          object_handle[animals_sharks].vertices[baby_shark_index * SIZE_DIM_3D + X] =
            source_x * conversion_grid_to_world_x;
          object_handle[animals_sharks].vertices[baby_shark_index * SIZE_DIM_3D + Y] =
            source_y * conversion_grid_to_world_y;
          object_handle[animals_sharks].vertices[baby_shark_index * SIZE_DIM_3D + Z] = 0.0;

          object_handle[animals_sharks].colors[baby_shark_index * SIZE_DIM_COLORS + R] = shark_colors.R;
          object_handle[animals_sharks].colors[baby_shark_index * SIZE_DIM_COLORS + G] = shark_colors.G;
          object_handle[animals_sharks].colors[baby_shark_index * SIZE_DIM_COLORS + B] = shark_colors.B;
          object_handle[animals_sharks].colors[baby_shark_index * SIZE_DIM_COLORS + A] = shark_colors.A;
        } else {
          playboard.grid_board[source_x][source_y][index_species] = species_no_animal_here;
          playboard.grid_board[source_x][source_y][index_animal] = unused;
          playboard.grid_board[source_x][source_y][index_age] = unused;

          // Update torus color for source cell to Blue (Water)
          let cell_index = (source_x * SIZE_BOARD_Y + source_y) * 6;
          for (let k = 0; k < 6; k++) {
            doughnut_box_colors[(cell_index + k) * 3 + R] = 0.0;
            doughnut_box_colors[(cell_index + k) * 3 + G] = 0.0;
            doughnut_box_colors[(cell_index + k) * 3 + B] = 1.0;
          }
        }

        found_new_location = true;
      }

      curr_random++;
      if (curr_random === MAX_SIZE_RAND_SEQUENCE) {
        curr_random = 0;
      }
    } while (!found_new_location && neighbor_index < 4);

    if (found_new_location) {
      continue;
    }

    if (time_for_shark_starvation < playboard.grid_board[source_x][source_y][index_hunger]) {
      if (do_output) {
        console.log("shark just starved to death ", curr_animal_index);
      }

      dead_shark_bucket[curr_dead_shark++] = curr_animal_index;

      playboard.grid_board[source_x][source_y][index_species] = species_no_animal_here;
      playboard.grid_board[source_x][source_y][index_animal] = unused;
      playboard.grid_board[source_x][source_y][index_age] = unused;

      object_handle[animals_sharks].vertices[local_shark + X] = invisible;
      object_handle[animals_sharks].vertices[local_shark + Y] = invisible;
      object_handle[animals_sharks].vertices[local_shark + Z] = invisible;

      // Update torus color for source cell to Blue (Water)
      let cell_index = (source_x * SIZE_BOARD_Y + source_y) * 6;
      for (let k = 0; k < 6; k++) {
        doughnut_box_colors[(cell_index + k) * 3 + R] = 0.0;
        doughnut_box_colors[(cell_index + k) * 3 + G] = 0.0;
        doughnut_box_colors[(cell_index + k) * 3 + B] = 1.0;
      }

      continue;
    }

    neighbor_index = 0;

    do {
      chosen_neighbor_index = random_sequence[curr_random];

      target_x = get_neighbor_x(source_x, chosen_neighbor_index);
      target_y = get_neighbor_y(source_y, chosen_neighbor_index);

      neighbor_index++;

      if (species_no_animal_here === playboard.grid_board[target_x][target_y][index_species]) {
        playboard.grid_board[target_x][target_y][index_species] = species_shark;

        playboard.grid_board[target_x][target_y][index_animal] =
          playboard.grid_board[source_x][source_y][index_animal];

        playboard.grid_board[target_x][target_y][index_age] =
          playboard.grid_board[source_x][source_y][index_age];

        object_handle[animals_sharks].vertices[local_shark + X] = target_x * conversion_grid_to_world_x;
        object_handle[animals_sharks].vertices[local_shark + Y] = target_y * conversion_grid_to_world_y;
        object_handle[animals_sharks].vertices[local_shark + Z] = 0.0;

        // Update torus color for this cell to Red (Shark)
        let cell_index = (target_x * SIZE_BOARD_Y + target_y) * 6;
        for (let k = 0; k < 6; k++) {
          doughnut_box_colors[(cell_index + k) * 3 + R] = 1.0;
          doughnut_box_colors[(cell_index + k) * 3 + G] = 0.0;
          doughnut_box_colors[(cell_index + k) * 3 + B] = 0.0;
        }

        if (playboard.grid_board[source_x][source_y][index_animal] === curr_animal_index) {
          // OK cool
        } else {
          console.log("ERROR - moving to blank NO shark curr_animal_index is NOT == grid_board[source_x][source_y][animal_index]");
        }

        if (time_for_birthin_shark < playboard.grid_board[source_x][source_y][index_age]) {
          playboard.grid_board[source_x][source_y][index_species] = species_shark;
          playboard.grid_board[source_x][source_y][index_age] = 0;
          playboard.grid_board[source_x][source_y][index_hunger] = 0;

          if (0 < curr_dead_shark) {
            curr_dead_shark--;
            baby_shark_index = dead_shark_bucket[curr_dead_shark];
          } else {
            baby_shark_index = object_handle[animals_sharks].count++;

            object_handle[animals_sharks].vertex_position_buffer.numItems++;
            object_handle[animals_sharks].vertex_color_buffer.numItems++;
          }

          playboard.grid_board[source_x][source_y][index_animal] = baby_shark_index;

          object_handle[animals_sharks].vertices[baby_shark_index * SIZE_DIM_3D + X] =
            source_x * conversion_grid_to_world_x;
          object_handle[animals_sharks].vertices[baby_shark_index * SIZE_DIM_3D + Y] =
            source_y * conversion_grid_to_world_y;
          object_handle[animals_sharks].vertices[baby_shark_index * SIZE_DIM_3D + Z] = 0.0;

          object_handle[animals_sharks].colors[baby_shark_index * SIZE_DIM_COLORS + R] = shark_colors.R;
          object_handle[animals_sharks].colors[baby_shark_index * SIZE_DIM_COLORS + G] = shark_colors.G;
          object_handle[animals_sharks].colors[baby_shark_index * SIZE_DIM_COLORS + B] = shark_colors.B;
          object_handle[animals_sharks].colors[baby_shark_index * SIZE_DIM_COLORS + A] = shark_colors.A;
        } else {
          playboard.grid_board[source_x][source_y][index_species] = species_no_animal_here;
          playboard.grid_board[source_x][source_y][index_animal] = unused;
          playboard.grid_board[source_x][source_y][index_age] = unused;

          // Update torus color for source cell to Blue (Water)
          let cell_index = (source_x * SIZE_BOARD_Y + source_y) * 6;
          for (let k = 0; k < 6; k++) {
            doughnut_box_colors[(cell_index + k) * 3 + R] = 0.0;
            doughnut_box_colors[(cell_index + k) * 3 + G] = 0.0;
            doughnut_box_colors[(cell_index + k) * 3 + B] = 1.0;
          }
        }

        found_new_location = true;
      }

      curr_random++;
      if (curr_random === MAX_SIZE_RAND_SEQUENCE) {
        curr_random = 0;
      }
    } while (!found_new_location && neighbor_index < 4);
  }


  // IMPORTANT: Re-buffer the modified colors to the GPU
  if (object_handle[animals_doughnut] && object_handle[animals_doughnut].vertex_color_buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_doughnut].vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, doughnut_box_colors, gl.DYNAMIC_DRAW);
  }

  if (do_output) {
    show_animals(object_handle[animals_fish], 'fish');
    show_animals(object_handle[animals_sharks], 'shark');
    show_grid();

    console.log('count fish ', object_handle[animals_fish].count);
    console.log('count shark ', object_handle[animals_sharks].count);

    console.log('------------ bottom of chronos ------------------ ', count_chronos++);
  }

  if (do_single_step) {
    stop_early = true;
  }

  // Update buffers for fish
  gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_fish].vertex_position_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_fish].vertices, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_fish].vertex_color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_fish].colors, gl.DYNAMIC_DRAW);

  // Update buffers for sharks
  gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_sharks].vertex_position_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_sharks].vertices, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_sharks].vertex_color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_sharks].colors, gl.DYNAMIC_DRAW);

  // Update buffers for doughnut (colors only change, but let's be safe)
  gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_doughnut].vertex_color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_doughnut].colors, gl.DYNAMIC_DRAW);

  // Unbind
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}


function init_torus_buffers() {

  object_handle[animals_doughnut].vertices = doughnut_box_vertices;

  object_handle[animals_doughnut].colors = doughnut_box_colors;

  object_handle[animals_doughnut].indices = doughnut_indices;

  // ---

  object_handle[animals_doughnut].vertex_position_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_doughnut].vertex_position_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_doughnut].vertices, gl.STATIC_DRAW);
  object_handle[animals_doughnut].vertex_position_buffer.itemSize = 3;
  object_handle[animals_doughnut].vertex_position_buffer.numItems = curr_doughnut_vertex / 3;

  // gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, object_handle[animals_doughnut].vertex_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

  // ---

  object_handle[animals_doughnut].vertex_color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_doughnut].vertex_color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, object_handle[animals_doughnut].colors, gl.STATIC_DRAW);
  object_handle[animals_doughnut].vertex_color_buffer.itemSize = 3;
  object_handle[animals_doughnut].vertex_color_buffer.numItems = curr_doughnut_color / 3;

  // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, object_handle[animals_doughnut].vertex_color_buffer.itemSize, gl.FLOAT, false, 0, 0);

  // ---

  object_handle[animals_doughnut].vertex_indices_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object_handle[animals_doughnut].vertex_indices_buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, object_handle[animals_doughnut].indices, gl.STATIC_DRAW);
  object_handle[animals_doughnut].vertex_indices_buffer.itemSize = 1;
  object_handle[animals_doughnut].vertex_indices_buffer.numItems = curr_doughnut_index;

}       //      init_torus_buffers


// ---------------------------------------------

function init_doughnut() {


  // Correct allocation for torus geometry:
  // grid size: SIZE_BOARD_X * SIZE_BOARD_X
  // 2 triangles per grid cell = 6 vertices per grid cell.
  // Each vertex has 3 components (SIZE_DIM_3D).

  var num_grid_cells = SIZE_BOARD_X * SIZE_BOARD_X;
  var num_vertices_per_cell = 6;
  var total_vertices = num_grid_cells * num_vertices_per_cell;

  doughnut_box_vertices = new Float32Array(total_vertices * SIZE_DIM_3D);
  doughnut_box_colors = new Float32Array(total_vertices * SIZE_DIM_3D); // colors use same size (RGB)
  doughnut_indices = new Uint16Array(total_vertices); // 1 index per vertex

  var toggle_red_N_green = true;

  // var radius_of_letter_C = 0.16;    // thickness of doughnut
  // var radius_of_letter_C = 0.2;    // thickness of doughnut
  var radius_of_letter_C = 0.24;    // thickness of doughnut
  // var radius_of_letter_C = 1.6;    // thickness of doughnut
  // var radius_of_letter_C = 0.36;    // thickness of doughnut

  var x_center = -0.3;
  //  float y_center = 0.5;
  //  float z_center = 0.5;

  var working_main_radius;      // size of entire doughnut ... influenced by x_center above

  // var two_pi = 2.0 * M_PI;
  var two_pi = 2.0 * Math.PI;

  var incr_of_circle = 2.0 * Math.PI / SIZE_BOARD_X;
  //  float outer_curr_x, outer_curr_y, outer_curr_z;
  var outer_curr_x, outer_curr_z;
  var inner_curr_x, inner_curr_y, inner_curr_z;

  var doughnut_offset_x = 0.0;
  var doughnut_offset_y = 0.5;
  var doughnut_offset_z = 0.5;

  // std::cout << "incr_neck_choaker " << incr_of_circle << std::endl;

  // ------- synthesize a doughnut ---------       https://en.wikipedia.org/wiki/Unit_circle

  // --- first create a circle - lay a doughnut on a table cut through its diameter
  //                             so you have two C shaped halves - its cross section is this outer circle

  var total_count_outer_dim = (SIZE_BOARD_X * SIZE_BOARD_X);

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

  object_handle[animals_doughnut].min_max = min_max;

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

      inner_curr_x = x_center + working_main_radius * Math.cos(inner_curr_radian);
      inner_curr_y = doughnut_offset_y + working_main_radius * Math.sin(inner_curr_radian);
      inner_curr_z = outer_curr_z;

      Common_Utils.populate_min_max(min_max, inner_curr_x, inner_curr_y, inner_curr_z);

      if (do_output) {

        console.log(" inner_curr_x ", inner_curr_x,
          " inner_curr_y ", inner_curr_y,
          " inner_curr_z ", inner_curr_z
        );
      }

      temp_doughnut_box[curr_temp_doughnut_box * SIZE_DIM_3D + X] = inner_curr_x;
      temp_doughnut_box[curr_temp_doughnut_box * SIZE_DIM_3D + Y] = inner_curr_y;
      temp_doughnut_box[curr_temp_doughnut_box * SIZE_DIM_3D + Z] = inner_curr_z;

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


  for (var i = 0; i < SIZE_BOARD_X; i++) {

    for (var j = 0; j < SIZE_BOARD_X; j++) {

      var bigger_i = i + 1;
      if (bigger_i == SIZE_BOARD_X) bigger_i = 0;

      var bigger_j = j + 1;
      if (bigger_j == SIZE_BOARD_X) bigger_j = 0;

      // -----------

      var corner_0 = i * SIZE_BOARD_X + j;    // remember where we started from
      var corner_1 = bigger_i * SIZE_BOARD_X + j;
      var corner_2 = bigger_i * SIZE_BOARD_X + bigger_j;
      var corner_3 = i * SIZE_BOARD_X + bigger_j;


      if (do_output) {

        console.log("corner_0 ", corner_0,
          " corner_1 ", corner_1,
          " corner_2 ", corner_2,
          " corner_3 ", corner_3
        );
      }

      // -------- cut the first triangle of current facet

      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + X] = off_x + temp_doughnut_box[corner_0 * SIZE_DIM_3D + X];    // triangle 1 point 0
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Y] = off_y + temp_doughnut_box[corner_0 * SIZE_DIM_3D + Y];
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Z] = off_z + temp_doughnut_box[corner_0 * SIZE_DIM_3D + Z];


      //          fprintf(stdout, "TRI 1 PT 0 %5.2f  %5.2f  %5.2f\n",
      //                  doughnut_box[curr_doughnut_box][X],
      //                  doughnut_box[curr_doughnut_box][Y],
      //                  doughnut_box[curr_doughnut_box][Z]
      //                  );

      curr_doughnut_box++;

      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + X] = off_x + temp_doughnut_box[corner_1 * SIZE_DIM_3D + X];    // triangle 1 point 1
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Y] = off_y + temp_doughnut_box[corner_1 * SIZE_DIM_3D + Y];
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Z] = off_z + temp_doughnut_box[corner_1 * SIZE_DIM_3D + Z];


      //          fprintf(stdout, "TRI 1 PT 1 %5.2f  %5.2f  %5.2f\n",
      //                  doughnut_box[curr_doughnut_box][X],
      //                  doughnut_box[curr_doughnut_box][Y],
      //                  doughnut_box[curr_doughnut_box][Z]
      //                  );

      curr_doughnut_box++;

      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + X] = off_x + temp_doughnut_box[corner_2 * SIZE_DIM_3D + X];    // triangle 1 point 2
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Y] = off_y + temp_doughnut_box[corner_2 * SIZE_DIM_3D + Y];
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Z] = off_z + temp_doughnut_box[corner_2 * SIZE_DIM_3D + Z];


      //          fprintf(stdout, "TRI 1 PT 1 %5.2f  %5.2f  %5.2f\n",
      //                  doughnut_box[curr_doughnut_box][X],
      //                  doughnut_box[curr_doughnut_box][Y],
      //                  doughnut_box[curr_doughnut_box][Z]
      //                  );

      curr_doughnut_box++;

      // -------- craft the second triangle of current facet
      // left off here
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + X] = off_x + temp_doughnut_box[corner_2 * SIZE_DIM_3D + X];    // triangle 2 point 2
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Y] = off_y + temp_doughnut_box[corner_2 * SIZE_DIM_3D + Y];
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Z] = off_z + temp_doughnut_box[corner_2 * SIZE_DIM_3D + Z];


      //          fprintf(stdout, "TRI 2 PT 2 %5.2f  %5.2f  %5.2f\n",
      //                  doughnut_box[curr_doughnut_box][X],
      //                  doughnut_box[curr_doughnut_box][Y],
      //                  doughnut_box[curr_doughnut_box][Z]
      //                  );

      curr_doughnut_box++;

      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + X] = off_x + temp_doughnut_box[corner_3 * SIZE_DIM_3D + X];    // triangle 2 point 3
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Y] = off_y + temp_doughnut_box[corner_3 * SIZE_DIM_3D + Y];
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Z] = off_z + temp_doughnut_box[corner_3 * SIZE_DIM_3D + Z];


      //          fprintf(stdout, "TRI 2 PT 3 %5.2f  %5.2f  %5.2f\n",
      //                  doughnut_box[curr_doughnut_box][X],
      //                  doughnut_box[curr_doughnut_box][Y],
      //                  doughnut_box[curr_doughnut_box][Z]
      //                  );

      curr_doughnut_box++;

      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + X] = off_x + temp_doughnut_box[corner_0 * SIZE_DIM_3D + X];    // triangle 2 point 0
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Y] = off_y + temp_doughnut_box[corner_0 * SIZE_DIM_3D + Y];
      doughnut_box[curr_doughnut_box * SIZE_DIM_3D + Z] = off_z + temp_doughnut_box[corner_0 * SIZE_DIM_3D + Z];


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

      doughnut_box_vertices[curr_doughnut_vertex++] = vertex_offset_x + temp_doughnut_box[corner_0 * SIZE_DIM_3D + X];
      doughnut_box_vertices[curr_doughnut_vertex++] = vertex_offset_y + temp_doughnut_box[corner_0 * SIZE_DIM_3D + Y];
      doughnut_box_vertices[curr_doughnut_vertex++] = vertex_offset_z + temp_doughnut_box[corner_0 * SIZE_DIM_3D + Z];
      //          curr_doughnut_box++;

      var animal_red = 1.0;
      var animal_green = 0.0;
      var animal_blue = 0.0;

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

function init_fish_N_sharks(given_gl, given_size_board_x, given_size_board_y, given_max_fish, given_max_shark, given_time_for_birthin_fish, given_time_for_birthin_shark, given_time_for_shark_starvation, given_world_min_x, given_world_min_y, given_world_max_x, given_world_max_y, given_do_output, given_do_single_step, given_allow_sharks_to_eat_fish) {
  gl = given_gl;

  SIZE_BOARD_X = given_size_board_x;
  SIZE_BOARD_Y = given_size_board_y;

  MAX_NUM_ANIMALS_PER_SPECIES = Math.max(given_max_fish, given_max_shark);

  time_for_birthin_fish = given_time_for_birthin_fish;
  time_for_birthin_shark = given_time_for_birthin_shark;
  time_for_shark_starvation = given_time_for_shark_starvation;

  world_min_x = given_world_min_x;
  world_min_y = given_world_min_y;

  world_max_x = given_world_max_x;
  world_max_y = given_world_max_y;

  do_output = given_do_output;
  do_single_step = given_do_single_step;
  allow_sharks_to_eat_fish = given_allow_sharks_to_eat_fish;

  playboard.grid_board = init_board(SIZE_BOARD_X, SIZE_BOARD_Y);

  init_buffers(playboard, SIZE_BOARD_X, SIZE_BOARD_Y, given_max_fish, given_max_shark);

  init_doughnut();
  init_torus_buffers();
}

function get_object_handle() {
  return object_handle;
}

function get_all_object_labels() {
  return all_object_labels;
}

function init_f_N_s(given_model, given_world_min_x, given_world_min_y, given_world_max_x, given_world_max_y, given_gl, given_shader) {

  // Default settings
  let local_size_board_x = 100;
  let local_size_board_y = 100;
  let local_max_fish = 2000;
  let local_max_shark = 2000;
  let local_time_for_birthin_fish = 1;
  let local_time_for_birthin_shark = 55;
  let local_time_for_shark_starvation = 50;
  let local_do_output = false;
  let local_do_single_step = false;
  let local_allow_sharks_to_eat_fish = true;

  // console.log('given_model in fns of ', given_model);

  if (given_model === Common_Utils.model_tiny) {

    // seed_fish   = 1;
    // seed_sharks = 1;

    local_size_board_x = 4;
    local_size_board_y = local_size_board_x;

    // local_do_output = true;
    local_do_output = false;
    local_do_single_step = true;

    local_time_for_birthin_fish = 1;
    local_time_for_birthin_shark = 3;
    local_time_for_shark_starvation = 2;

    desired_point_size = 0.8 * given_gl.viewportWidth / (1.0 * (local_size_board_x + 2));

  } else if (given_model === Common_Utils.model_small) {

    // seed_fish   = 1;
    // seed_sharks = 1;

    local_size_board_x = 50;
    local_size_board_y = local_size_board_x;

    local_do_output = false;
    local_do_single_step = false;

    local_time_for_birthin_fish = 1;
    local_time_for_birthin_shark = 55;
    // time_for_birthin_shark = 999999;

    local_time_for_shark_starvation = 50;
    // time_for_shark_starvation = 999999; 

    desired_point_size = 6.0;

  } else if (given_model === Common_Utils.model_medium) {

    local_size_board_x = 100;
    local_size_board_y = local_size_board_x;

    local_do_output = false;
    local_do_single_step = false;

    local_time_for_birthin_fish = 1;
    local_time_for_birthin_shark = 55;
    local_time_for_shark_starvation = 50;

    local_max_fish = 20000;
    local_max_shark = 20000;

    desired_point_size = 3.0;

  } else if (given_model === Common_Utils.model_large) {

    local_size_board_x = 200;
    local_size_board_y = local_size_board_x;

    local_do_output = false;
    local_do_single_step = false;

    local_time_for_birthin_fish = 1;
    local_time_for_birthin_shark = 55;
    local_time_for_shark_starvation = 50;

    local_max_fish = 20000;
    local_max_shark = 20000;

    desired_point_size = 3.0;

  } else if (given_model === Common_Utils.model_huge) {

    local_size_board_x = 200;
    local_size_board_y = local_size_board_x;

    local_do_output = false;
    local_do_single_step = false;

    local_time_for_birthin_fish = 1;
    local_time_for_birthin_shark = 55;
    local_time_for_shark_starvation = 50;

    local_max_fish = 40000;
    local_max_shark = 40000;

    desired_point_size = 2.0;
  }

  init_fish_N_sharks(given_gl,
    local_size_board_x, local_size_board_y,
    local_max_fish, local_max_shark,
    local_time_for_birthin_fish, local_time_for_birthin_shark, local_time_for_shark_starvation,
    given_world_min_x, given_world_min_y, given_world_max_x, given_world_max_y,
    local_do_output, local_do_single_step, local_allow_sharks_to_eat_fish);
}

function get_desired_point_size() {
  return desired_point_size;
}


let external_fft_object = null;

function set_external_fft_object(obj) {
  external_fft_object = obj;
}

export { init_fish_N_sharks, init_f_N_s, get_object_handle, get_all_object_labels, update_board, get_desired_point_size, set_external_fft_object };
