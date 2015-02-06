

var audio_process_obj = function() {

var aggregate_buffer_size = 0;

var desired_synth_buff_size;
var curr_sampled_buffer;
var synth_from_sample_buffer;	// actual audio curve NOT for display
var running_sampled_offset = 0; // count in bytes size buffer already set into sampled buffer storage

var continue_sampling = false;

var animals_synth   = {};	// to display synthesized buffer
var animals_sampled = {};	// to display sampled buffer

var synth_object = {};

var gl;		// handle given from calling context

// var suggested_max_num_control_points = 10;
// var curr_control_point;
// var DIM_CONTROL_POINTS = 3;

var X = 0;		// index into DIM_CONTROL_POINTS - each control points has XY and MASS
var Y = 1;
var Z = 2;
// var MASS = 3;

var R = 0;
var G = 1;
var B = 2;
var A = 3;

// var control_point_buffer = new Float32Array(suggested_max_num_control_points * DIM_CONTROL_POINTS);



// ---------- setup display geometry ---------- //


animals_synth.pre_translate  = [  0.5,  1.5,  1.5];
animals_synth.post_translate = Common_Utils.negate_array(animals_synth.pre_translate);

// we want dupe of above here
animals_sampled.pre_translate  = [  0.5,  1.5,  1.5];
animals_sampled.post_translate = Common_Utils.negate_array(animals_sampled.pre_translate);

// ---


var curr_3D_array = []; // each NON 0.0 element says to rotation cylinder about this axis by this radians

// curr_3D_array[X] = 0.0;
curr_3D_array[X] = Math.PI / 2.0;

// curr_3D_array[Y] = 3.0 * Math.PI / 2.0;     // rotate Y axis by this number of radians
curr_3D_array[Y] = 0.0;     // rotate Y axis by this number of radians
curr_3D_array[Z] = 0.0;
// curr_3D_array[Z] = 3.0 * Math.PI / 2.0;

synth_object.rotate_3D_per_axis = curr_3D_array;

// console.log('aaaaaaa X ', synth_object.rotate_3D_per_axis[X]);


// synth_object.translate_x =  1.5;    // voluntary translation of each of X Y & Z post cylinder synth
// synth_object.translate_y =  2.0;
// synth_object.translate_z =  0.5;

// vvv


synth_object.translate_x = -1.0;    // voluntary translation of each of X Y & Z post cylinder synth
synth_object.translate_y =  2.0;
synth_object.translate_z =  1.0;


// -------------------------------------------- //


// var SIZE_DIM_2D = 2;	// X and Y
var SIZE_DIM_3D = 3;
var SIZE_DIM_COLORS = 4;

var is_synth_ready_to_display = false;

var was_a_sample_taken = false;

// ---



function get_size_sampled_buffer() {

	return desired_synth_buff_size;
}

function get_sampled_buffer() {

	if (was_a_sample_taken) {

		console.log('... playback actual sample buffer   ');

		return curr_sampled_buffer;

	} else {

        console.log('not so fast ... no sample buffer to play so return');

		return null;
	}
}

// ---

// function get_size_buffer(given_flavor) {		//		get_size_synth_from_sample_buffer   

// 	// for now all flavors are same size ... may change later

// 	return desired_synth_buff_size;
// }


// ---

function pop_seed_buff(seed_obj) {

	var size_seed = seed_obj.size;
	var seed_buffer = seed_obj.buffer;

	var min_boundary = -1.0;
	var max_boundary = 1.0;
	var size_swiggle = 0.2;

	var curr_y = 0.0;
	var tmp_y;

	for (var index = 0; index < size_seed; index++) {

		seed_buffer[index] = curr_y;

		do {

			tmp_y = Common_Utils.get_random_in_range_inclusive_float(
																curr_y - size_swiggle, 
																curr_y + size_swiggle);
		} while (tmp_y <= min_boundary || tmp_y >= max_boundary);

		curr_y = tmp_y;
	}
}

// ---

function pop_buff_seed(seed_obj) {

	var min_y = -1.0;
	var max_y =  1.0;

	var size_seed = seed_obj.size;
	var curr_y = 0.0;
	var y_incr = 0.08;
	var tmp_y;

	for (var index = 0; index < size_seed; index++) {

		// console.log('pop_buff_seed ', index, curr_y);

		seed_obj.buffer[index] = curr_y;

		do {

			tmp_y = Common_Utils.get_random_in_range_inclusive_float(curr_y - y_incr, curr_y + y_incr);

		}  while ( tmp_y < min_y || tmp_y > max_y);

		curr_y = tmp_y;
	}

	seed_obj.buffer[size_seed - 1] = 0.0;	// assure it finishes back at zero so no distortion crackle
}

function pop_stradivarius(seed_obj, buff_obj, octave_offset) {

	var size_seed = seed_obj.size;
	var size_buff = buff_obj.size;

	var index_buff = 0;
	var index_seed = 0;

/*
	chosen_buff_obj.frequency    = 8000.0;	// Hertz - only valid for primatives like sin waves
	chosen_buff_obj.sample_rate  = 44100;	// number of samples taken per second of time
	chosen_buff_obj.bit_depth    = 16;		// when converted from float into int precision (16) 
	chosen_buff_obj.num_channels = 1;		// number of channels - mono = 1, stereo = 2 ...
	chosen_buff_obj.duration     = 3.5;		// number of seconds for this sound sample
											// since we drive this from chosen buffer size
											// this value gets overriden post calculation 
											// factoring in sample_rate, frequency, num_channels ...
*/


	var num_channels = buff_obj.num_channels;

	console.log('inside pop_stradivarius with     num_channels ', num_channels);


	// var desired_frequency = 800.0;	// Hertz == cycles per second
	// var desired_frequency = 3600.0;	// Hertz == cycles per second
	var desired_frequency = buff_obj.frequency;	// Hertz == cycles per second

	// var sample_rate = 44100;	// samples_per_second
	var sample_rate = buff_obj.sample_rate;	// samples_per_second

	console.log('size_buff    ', size_buff);


	buff_obj.duration = size_buff / (desired_frequency * sample_rate * num_channels);

	console.log('buff_obj.duration    ', buff_obj.duration);

/*
	var total_samples = size_buff;
	var total_seconds = size_buff / sample_rate;
	var total_cycles = total_seconds * desired_frequency;
	var samples_per_cycle = total_samples / total_cycles;
	var radians_per_cycle = 2.0 * Math.PI;
	var radians_per_sample = radians_per_cycle / samples_per_cycle;
*/

	var radians_per_sample = (2.0 * Math.PI * desired_frequency) / (sample_rate);

	console.log('radians_per_sample ', radians_per_sample);
	// new radians_per_sample  0.11398068584452764 

	var synth_mode = 1;	// 1 == generate sin wave
	// var synth_mode = 2;	// 2 == elephant roar

	console.log("bbb sample_rate ", sample_rate);
	console.log("desired_frequency ", desired_frequency);
	console.log("radians_per_sample ", radians_per_sample);

	var curr_y;
	var theta = 0.0;
	var incr_theta = radians_per_sample;

	do {

	/*	
		curr_y = octave_offset * seed_obj.buffer[index_seed];

		// console.log('curr_y ', curr_y);

		curr_y = curr_y / octave_offset;

		buff_obj.buffer[index_buff] += curr_y;	// stens TODO may need to normalize post this loop

		// console.log('index_seed ', index_seed, index_buff, octave_offset,
		// 				' strat ', buff_obj.buffer[index_buff]);

		index_seed++;

		if (! (index_seed < size_seed)) {

			index_seed = 0;	// loop back to beginning as we repeat this seed buffer to pop main buff
		}
	*/

		// ------------- below synthesizes sine wave --------------  //

		buff_obj.buffer[index_buff] = Math.sin(theta);

		theta += incr_theta;

	} while (++index_buff < size_buff);

	buff_obj.buffer[size_buff - 1] = 0.0;	// assure it finishes back at zero so no distortion crackle

}		//		pop_stradivarius


function do_stradivari(seed_obj, buff_obj) {

	// take seed buffer and create multiple octaves of it across 8 or so layers

	// see image :  ~/Dropbox/Documents/data/audio
	//           :  Elephant_sounds_rgUFu_hVhlk_roar_spectrogram_sonic_visualizer.png

	pop_buff_seed(seed_obj);

	// ---       realtimeweb.co 

	pop_stradivarius(seed_obj, buff_obj, 1.0);
	// pop_stradivarius(seed_obj, buff_obj, 2.0);
	// pop_stradivarius(seed_obj, buff_obj, 3.0);
	// pop_stradivarius(seed_obj, buff_obj, 4);
	// pop_stradivarius(seed_obj, buff_obj, 5);

	// show_buffer(buff_obj.buffer, buff_obj.buffer.length, 100);

	// show_buffer(given_audio_buffer, given_buffer_size, limit_to_see)

}

// ---

function genetic_synth(buff_obj) {

	console.log("inside genetic_synth ......... ");

	for (var property in buff_obj) {

		console.log("genetic_synth ", property, " value ", buff_obj[property]);
	}

	buff_obj.buffer = new Float32Array(desired_synth_buff_size);

	genetic_machinery_obj.genetic_launch(buff_obj);

}		//		genetic_synth

var is_elephant_roar_done = false;

function elephant_roar(buff_obj) {

	// var buff_obj = {};

	buff_obj.size = desired_synth_buff_size;	// stens TODO - put this back its correct
	// buff_obj.size = 1;

		// elephant_buffer          = new Float32Array(desired_synth_buff_size);

	// bbb

	/*

		if we synthesize octaves based on some seed curve :

		1 - if we seed low and synth octaves by doubling freq we do NOT loose information
			its just curve points get closer

		2 - if we seed high and synth octaves by halving frequencies the curves would loose info
			since we could only make distance btw points greater for each new octave

		NOTICE - so we want to seed low and synth octaves by going up frequencies

	*/

	var seed_obj = {};

	var size_seed = 60;
	// var size_seed = 120;


	seed_obj.buffer = new Float32Array(size_seed);
	seed_obj.size   = size_seed;

	if (is_elephant_roar_done) {

		console.log('cool elephant roar is already created so just return it');

		buff_obj.buffer = elephant_buffer;

	} else {

		console.log("Let's create an elephant roar !!!!!!! ... desired_synth_buff_size",
			desired_synth_buff_size);

		pop_seed_buff(seed_obj);

		// ---

		buff_obj.buffer = elephant_buffer;

		do_stradivari(seed_obj, buff_obj);

		is_elephant_roar_done = true;
	}

	console.log('just cut fresh elephant roar size ', buff_obj.size, ' length ', buff_obj.buffer.length);

	// buff_obj

	// bbb

	console.log("point beta");

	// show_buffer(buff_obj.buffer, buff_obj.size);

	// return buff_obj;

}		//		elephant_roar

function count_properties(given_obj) {

	var count = 0;
	for (var curr_property in given_obj) {

		if (curr_property != "buffer") {

			count += 1;
		}

		console.log(count, "  count_properties with ... ", curr_property, given_obj[curr_property]);
	}
	return count;
}

// ---

function get_buffer(given_flavor) {		//		get_synth_from_sample_buffer

	var chosen_buff_obj = {};	// object to which we store :  buffer, frequency, sample_rate, bit_depth

	if ((given_flavor === 1 || given_flavor === 2) && (! was_a_sample_taken)) {

        console.log('not so fast ... no sampling was done so return');

		return null;
	}

	switch (given_flavor) {

		case 1: {

			console.log('... OK sample was taken so render is progressing   341  ');

			chosen_buff_obj.buffer = curr_sampled_buffer;
			chosen_buff_obj.size_buffer = desired_synth_buff_size;

			return chosen_buff_obj;
			// break;
		}

		case 2: {

			console.log('... OK synth from sample is available so render is progressing  341 ');

			chosen_buff_obj.buffer = synth_from_sample_buffer;
			chosen_buff_obj.size_buffer = desired_synth_buff_size;

			return chosen_buff_obj;
			// break;
		}

		case 3: {

			console.log('... OK elephant synth  ');

			chosen_buff_obj.flavor = "elephant_roar";

			chosen_buff_obj.size_buffer = desired_synth_buff_size;

			// chosen_buff_obj.frequency    = 8000.0;	// Hertz - only valid for primatives like sin waves
			// chosen_buff_obj.frequency    = 44.0;	// Hertz - only valid for primatives like sin waves
			// chosen_buff_obj.frequency    = 1111.0;	// Hertz - only valid for primatives like sin waves
			chosen_buff_obj.frequency    = 1000;	// Hertz

			chosen_buff_obj.sample_rate  = 44100;	// number of samples taken per second of time
			// chosen_buff_obj.sample_rate  = 22050;	// number of samples taken per second of time
			// chosen_buff_obj.sample_rate  = 88200;	// number of samples taken per second of time
			// chosen_buff_obj.sample_rate  = 176400;	// number of samples taken per second of time

//  stens TODO - only handles 16 bit_depth see notes in combo.html   
			chosen_buff_obj.bit_depth    = 16;		// when converted from float into int precision (16) 
			// chosen_buff_obj.bit_depth    = 8;		// when converted from float into int precision (16) 

// stens TODO only handles 1 channel so far
			chosen_buff_obj.num_channels = 1;		// number of channels - mono = 1, stereo = 2 ...
			chosen_buff_obj.duration     = 3.5;		// number of seconds for this sound sample
													// since we drive this from chosen buffer size
													// this value gets overriden post calculation 
													// factoring in sample_rate, frequency, num_channels ...
			elephant_roar(chosen_buff_obj);
			return chosen_buff_obj;
			// break;
		}

		case 4: {

			console.log('... OK genetic synth  setup all parms here ');

			chosen_buff_obj.flavor = "genetic_synthesis";

			// chosen_buff_obj.frequency    = 8000.0;	// Hertz - only valid for primatives like sin waves
			// chosen_buff_obj.frequency    = 44.0;	// Hertz - only valid for primatives like sin waves
			chosen_buff_obj.frequency    = 1111.0;	// Hertz - only valid for primatives like sin waves

			chosen_buff_obj.sample_rate  = 44100;	// number of samples taken per second of time
			// chosen_buff_obj.sample_rate  = 22050;	// number of samples taken per second of time
			// chosen_buff_obj.sample_rate  = 88200;	// number of samples taken per second of time
			// chosen_buff_obj.sample_rate  = 176400;	// number of samples taken per second of time

//  stens TODO - only handles 16 bit_depth see notes in combo.html   
			chosen_buff_obj.bit_depth    = 16;		// when converted from float into int precision (16) 
			// chosen_buff_obj.bit_depth    = 8;		// when converted from float into int precision (16) 

// stens TODO only handles 1 channel so far
			chosen_buff_obj.num_channels = 1;		// number of channels - mono = 1, stereo = 2 ...
			// chosen_buff_obj.duration     = 3.5;		// number of seconds for this sound sample
													// since we drive this from chosen buffer size
													// this value gets overriden post calculation 
													// factoring in sample_rate, frequency, num_channels ...

			chosen_buff_obj.size_buffer = desired_synth_buff_size;

			chosen_buff_obj.manifest_count = 1 + count_properties(chosen_buff_obj);// must count itself

			genetic_synth(chosen_buff_obj);	// skip over since we do synth work on server side
			return chosen_buff_obj;
			// break;
		}



		// --- default

		break;
	}
}		//		get_buffer

// ---

var flag_trim_sampled_buffer_to_match_source_size = false;

function take_another_sample(when_sample_is_done_callback, given_mode) {

	synth_object.ondone = null;

// console.log('\n\ncw + ss    wednesday        444             \n\n');

	if (null === given_mode) {

		alert("ERROR - seeing null given_mode in take_another_sample");
	}

	if (2 === given_mode) {

		flag_trim_sampled_buffer_to_match_source_size = true;
	}


	if (when_sample_is_done_callback) {

		synth_object.ondone = when_sample_is_done_callback;

		console.log('take_another_sample has a REALLLL  first parm    given_mode ', given_mode);

	} else {

		console.log('take_another_sample has a null first parm    given_mode ', given_mode);
	}

	if (false === continue_sampling) {

		continue_sampling = true;

	} else {

		console.log('... am already in middle of previous sampling   133   ');
	}
}		//		take_another_sample


function init_audio_processing(given_gl, BUFF_SIZE) {

	// 

	// console.log('\n\ncw + ss    sat      944             \n\n');


	gl = given_gl;


    // var sample_synth_buff_size_multiplier = 1; // size of synth/sampled buff as multiple of source buff size
    var sample_synth_buff_size_multiplier = 5; // size of synth/sampled buff as multiple of source buff size
    // var sample_synth_buff_size_multiplier = 10; // size of synth/sampled buff as multiple of source buff size
    // var sample_synth_buff_size_multiplier = 20; // size of synth/sampled buff as multiple of source buff size
    // var sample_synth_buff_size_multiplier = 50; // size of synth/sampled buff as multiple of source buff size
    // var sample_synth_buff_size_multiplier = 100; // size of synth/sampled buff as multiple of source buff size
    // var sample_synth_buff_size_multiplier = 250; // size of synth/sampled buff as multiple of source buff size
    // var sample_synth_buff_size_multiplier = 500; // size of synth/sampled buff as multiple of source buff size
    // var sample_synth_buff_size_multiplier = 1000; // size of synth/sampled buff as multiple of source buff size
    
    // IMPORTANT - make it a multiple of BUFF_SIZE
    desired_synth_buff_size = sample_synth_buff_size_multiplier * BUFF_SIZE;


	console.log('EEEEEEEEE   427    desired_synth_buff_size ', desired_synth_buff_size);

	curr_sampled_buffer      = new Float32Array(desired_synth_buff_size);
	synth_from_sample_buffer = new Float32Array(desired_synth_buff_size);
	elephant_buffer          = new Float32Array(desired_synth_buff_size);
}

function show_buffer(given_audio_buffer, given_buffer_size, limit_to_see) {

	console.log('about to show buffer of size ', given_buffer_size);

	var max_visible_index = (given_buffer_size > limit_to_see) ? limit_to_see : given_buffer_size;

	for (var curr_index = 0; curr_index < max_visible_index; curr_index++) {

		console.log(curr_index, given_audio_buffer[curr_index]);
	}

	console.log('end of show buffer of size ', given_buffer_size);
}

// ------------------------------------

/*
function seed_control_points_curve(given_buffer, suggested_max_num_control_points, given_inverse_density, given_max_x) {

	console.log('seed_control_points_curve   given_max_x ', given_max_x);

	curr_control_point = 0;

	var MAX_VALUE = 1.0;
	var MIN_VALUE = -1.0;
	
	var curr_x = 0.0;	// start X at left most position
	var curr_y, curr_mass;
	var incr_x;
	var prev_x = 0.0;
	var prev_y = 999.99;
	var prev_index;
	// var max_incr_x = given_inverse_density;	// smaller more dense, larger less dense
	var max_incr_x = 2.0 * given_max_x / (suggested_max_num_control_points - 1);

	console.log('max_incr_x ', max_incr_x);

	var enough_points = false;

	for (; enough_points == false; curr_control_point++) {

		do {

			incr_x = Common_Utils.get_random_in_range_inclusive_float(0.0, max_incr_x);

		} while (incr_x == 0.0);

		do {

			curr_y = Common_Utils.get_random_in_range_inclusive_float(MIN_VALUE, MAX_VALUE);

		} while (curr_y == prev_y);

		do {

			curr_mass = Common_Utils.get_random_in_range_inclusive_float(0.0, MAX_VALUE);

		} while (curr_mass == 0.0);

		curr_x = prev_x + incr_x;

		if (curr_x >= given_max_x || (curr_control_point + 1) == suggested_max_num_control_points) {

			enough_points = true;

			curr_x = (given_max_x - 1);
		}

		given_buffer[curr_control_point * DIM_CONTROL_POINTS + X]    = curr_x;
		given_buffer[curr_control_point * DIM_CONTROL_POINTS + Y]    = curr_y;
		given_buffer[curr_control_point * DIM_CONTROL_POINTS + Z]    = 0.0;
		given_buffer[curr_control_point * DIM_CONTROL_POINTS + MASS] = curr_mass;

		console.log('seed ', curr_control_point, curr_x, curr_y, curr_mass);

		given_buffer.count_control_points = curr_control_point + 1;

		// prev_index =
		prev_x = curr_x;
		prev_y = curr_y;
	}
}
*/

function pop_display_buff(given_buff, given_index, given_x, given_y, given_z, given_R, given_G, given_B, given_A) {

    var this_pt = {};

    this_pt.x = given_x;
    this_pt.y = given_y;
    this_pt.z = given_z;

    Common_Utils.rotate_about_xyz_axis(synth_object.rotate_3D_per_axis, this_pt);

    this_pt.x += synth_object.translate_x;
    this_pt.y += synth_object.translate_y;
    this_pt.z += synth_object.translate_z;

    // -------------

	given_buff.vertices[given_index * SIZE_DIM_3D + X] = this_pt.x;
	given_buff.vertices[given_index * SIZE_DIM_3D + Y] = this_pt.y;
	given_buff.vertices[given_index * SIZE_DIM_3D + Z] = this_pt.z;

	given_buff.colors[given_index * SIZE_DIM_COLORS + R] = given_R;
	given_buff.colors[given_index * SIZE_DIM_COLORS + G] = given_G;
	given_buff.colors[given_index * SIZE_DIM_COLORS + B] = given_B;
	given_buff.colors[given_index * SIZE_DIM_COLORS + A] = given_A;
}

// console.log('\n\ncw + ss    mon      101             \n\n');


var seeing_zero_value = false;
var index_when_zero_value_started = 0;
var count_num_zero_seen_consecutive = 0;
var max_count_num_zero_seen_consecutive = 0;


function synth_audio_curve_pop_buff(given_sampled_buffer, d_sample_buff, d_synth_buffer, buffer_size, percent_probed) {

	console.log('TOP of synth_audio_curve_pop_buff ... sampled buffer size ', buffer_size);


	if (100 != percent_probed) {

		var err_msg = "ERROR - currently only handles 100% sampling";

		console.log(err_msg);
		alert(err_msg);
	}

	var synth_mode_monte_carlo = 1;
	var synth_mode_half_split  = 2;

	var curr_x = 0.0, curr_y = 0.0, curr_z = 0.0;

	// var max_size_incr_y = 1.0 / 10.0;
	// var max_size_incr_y = 1.0 / 8.0;
	// var min_size_incr_y = -1.0 * max_size_incr_y;

	var min_y = -1.0;
	var max_y =  1.0;

	var tmp_y;

	var max_y_error = 0.001;	// make this smaller for more accurate half splitting probe discovery of actual y
	// var max_y_error = 0.005;	// make this smaller for more accurate half splitting probe discovery of actual y
	// var max_y_error = 0.005;	// make this smaller for more accurate half splitting probe discovery of actual y
	var max_trials = 8;	// maximum number of iterations of below probe to half split distance until we find y
	

	var curr_trial = 0;

	// working_y = curr_y;

	// below pair of condition counters allows us to fine tune above parms: max_y_error <--> max_trials
	//			such that on average limiting condition is about equally due to either condition
	//			elsewise we are too strict on one so we starve from ever reaching other condition
	var count_limiting_condition_error = 0;		// running total to see how many iterations due to error reached
	var count_limiting_condition_count = 0;		// how many due to maxxing out of permitted iterations 

	var synth_mode = synth_mode_monte_carlo;
	// var synth_mode = synth_mode_half_split;


	// var best_y_so_far_error_distance = Number.MAX_VALUE;
	var best_y_so_far_error_distance = 999.99;
	var best_y_so_far;

	var curr_abs_error_distance;

	var fl_pr = 2;

	for (var index = 0; index < buffer_size; index++) {

		max_y =  1.0;
		min_y = -1.0;

		best_y_so_far_error_distance = 999.99;

        curr_x = 4.0 * index / buffer_size;
        curr_y = given_sampled_buffer[index];	// actual source sample y value we want to discover below
        curr_z = 0.0;

        // ---


// var seeing_zero_value = false;
// var index_when_zero_value_started = 0;
// var count_num_zero_seen_consecutive = 0;


        if (curr_y === 0) {

        	count_num_zero_seen_consecutive++;

        	if (max_count_num_zero_seen_consecutive < count_num_zero_seen_consecutive) {

        		max_count_num_zero_seen_consecutive = count_num_zero_seen_consecutive;
        	}

        	if (! seeing_zero_value) {

        		index_when_zero_value_started = index;
        	}

        	seeing_zero_value = true;

        } else {

        	seeing_zero_value = false;
        	count_num_zero_seen_consecutive = 0;
        }

        // ---

		pop_display_buff(d_sample_buff, index, curr_x, curr_y, curr_z, 0,1,0,1);

		// ---------------- 

		curr_trial = 0;

		// stens TODO - beef up below by making min/max Y close to previous Y

		switch (synth_mode) {

			case synth_mode_monte_carlo: {

				// ---

				do {

					tmp_y = min_y + (max_y - min_y)/2.0;

					// ---

					curr_abs_error_distance = Math.abs(curr_y - tmp_y);

					if (curr_abs_error_distance < best_y_so_far_error_distance) {

						best_y_so_far_error_distance = curr_abs_error_distance;
						best_y_so_far = tmp_y;
					}

					// ---

					if (curr_y > tmp_y) {

						min_y = tmp_y;

						// console.log('curr > tmp_y so')

					} else {

						max_y = tmp_y;
					}

					// ---

					// if (index % 33 == 0) {


						// console.log(index, curr_trial, 'curr_y ', curr_y.toFixed(fl_pr), ' tmp_y ', tmp_y, 
						// 	' max_y ', max_y, ' min_y ', min_y,
						// 	' dist ', curr_abs_error_distance.toFixed(fl_pr), 
						// 	' best dist ', best_y_so_far_error_distance.toFixed(fl_pr), 
						// 	' best y ', best_y_so_far );

					// }

				} while ((best_y_so_far_error_distance > max_y_error) && (curr_trial++ < max_trials));

				// --- check as to what limiting condition was --- //

				// if (! (best_y_so_far_error_distance > max_y_error)) {
				if (best_y_so_far_error_distance <= max_y_error) {

					// console.log('limiting condition was max_y_error ', best_y_so_far_error_distance);

					count_limiting_condition_error++;

				} else {

					// console.log('limiting condition was max permitted iterations reached ');

					count_limiting_condition_count++;
				}

				// ---

				break;
			}

			case synth_mode_half_split: {

				console.log('synth using synth_mode_half_split ');

				// ---

				do {
					do {

						tmp_y = Common_Utils.get_random_in_range_inclusive_float(min_y, max_y);

					// } while ( tmp_y <= min_y || tmp_y >= max_y);
					} while ( tmp_y < min_y || tmp_y > max_y);

				} while ((max_y_error < Math.abs(curr_y - tmp_y)) && curr_trial++ < max_trials);

				// ---

				break;
			}
			break;
		}

		// ---

		synth_from_sample_buffer[index] = best_y_so_far;

		pop_display_buff(d_synth_buffer, index, curr_x, best_y_so_far, curr_z, 1,0,0,1);
	}

	// ---

	if (synth_mode === synth_mode_monte_carlo) {

		// console.log('synth curve monte carlo iteration limiting condition counts : max_y_error ',
		// 	count_limiting_condition_error, ' max_trials ', count_limiting_condition_count);
	}

	console.log('max_count_num_zero_seen_consecutive ', max_count_num_zero_seen_consecutive);

	if (max_count_num_zero_seen_consecutive == buffer_size) {

		console.log('NOTE - seeing ALL zeros buffer_size == max_count_num_zero_seen_consecutive ',
			max_count_num_zero_seen_consecutive);
	}

}		//		synth_audio_curve_pop_buff


function get_display_ready_flag() {

	return is_synth_ready_to_display;
}

function allocate_buffers_vertices_N_colors(given_buffer, given_buffer_size) {

	given_buffer.vertices = new Float32Array(given_buffer_size * SIZE_DIM_3D);	// times 2 for X & Y
	given_buffer.colors   = new Float32Array(given_buffer_size * SIZE_DIM_COLORS);	// times 2 for X & Y
}

function setup_gl_buffers(given_buffer, given_buffer_size) {

	// --- setup display of synthesis buffer --- //

    given_buffer.vertex_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, given_buffer.vertex_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_buffer.vertices, gl.STATIC_DRAW);
    given_buffer.vertex_position_buffer.itemSize = SIZE_DIM_3D;
    given_buffer.vertex_position_buffer.numItems = given_buffer_size;

    // ---

    given_buffer.vertex_color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, given_buffer.vertex_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, given_buffer.colors, gl.STATIC_DRAW);
    given_buffer.vertex_color_buffer.itemSize = SIZE_DIM_COLORS;
    given_buffer.vertex_color_buffer.numItems = given_buffer_size;
}

function synth_curve(sampled_buffer, given_buffer_size) {

	var percent_probed = 100;	// percentage of x values in source sampled curve recreated in synth

	/*
		stens TODO - for now go with 100%  later for speed may permit fractions like 10%
	*/

	// vvv

	// console.log('\n\ncw + ss    wednesday   316             \n\n');

	console.log('synth_buffer SIZE aggregate_buffer_size ', given_buffer_size);

	// animals_sampled

	allocate_buffers_vertices_N_colors(animals_synth, given_buffer_size);
	allocate_buffers_vertices_N_colors(animals_sampled, given_buffer_size);

	synth_audio_curve_pop_buff(sampled_buffer, animals_sampled, animals_synth, given_buffer_size, percent_probed);

	setup_gl_buffers(animals_synth, given_buffer_size);
	setup_gl_buffers(animals_sampled, given_buffer_size);

    is_synth_ready_to_display = true;

	// ---

	console.log('now synth is done do done callback');

	if (synth_object.ondone) {

		synth_object.ondone();	
	}
}		//		synth_curve

// ---

function process_sampled_audio(sampled_buffer, aggregate_buffer_size) {

	if (sampled_buffer.length != aggregate_buffer_size) {

		var err_msg = "ERROR - mismatch on sampled buffer size and given size";

		console.log(err_msg);
		alert(err_msg);
		return;
	}

	console.log('now analyzing sampled audio ... size ', aggregate_buffer_size);

	// stens TODO - put this analysis into event driven callback based so NOT block main thread

	synth_curve(sampled_buffer, aggregate_buffer_size);
}

// --------------------------------------------------------------------

function perform_sampling(given_audio_buffer, given_buffer_size, providence) {

	// providence == flavor of audio getting sampled

	// stens TODO - enable mode of constant sampling into circular buffer
	//              then when new sample is desired just persist circular buffer ... no wait

    if (continue_sampling) {

		// console.log('\n\ncw + ss    friday   205             \n\n');

        curr_sampled_buffer.set(given_audio_buffer, aggregate_buffer_size);

        aggregate_buffer_size += given_buffer_size;
    }

    if (0 === aggregate_buffer_size % 1024) {

        // console.log('aggregate_buffer_size ', aggregate_buffer_size);
    }

    if (continue_sampling && aggregate_buffer_size >= desired_synth_buff_size) {

        // console.log('Float32Array.BYTES_PER_ELEMENT ', Float32Array.BYTES_PER_ELEMENT);

        if (aggregate_buffer_size != desired_synth_buff_size) {

            var err_msg = 'ERROR - desired_synth_buff_size is NOT multiple of aggregate_buffer_size';
            console.log(err_msg);
            alert(err_msg);
        }

        continue_sampling = false;

        console.log('mmm sampling is complete ... desired_synth_buff_size ', desired_synth_buff_size, providence);

        // show_buffer(curr_sampled_buffer, aggregate_buffer_size, 10);

        process_sampled_audio(curr_sampled_buffer, aggregate_buffer_size);

        aggregate_buffer_size = 0;	// reset sampled buffer for next fresh sample cycle

        was_a_sample_taken = true;	// vvv
    }
}		//		perform_sampling


// ---------------------------------------

return {    // to make visible to calling reference frame list function here comma delimited,

  perform_sampling: perform_sampling,
  take_another_sample: take_another_sample,
  animals_synth: animals_synth,
  animals_sampled: animals_sampled,
  init_audio_processing: init_audio_processing,
  get_display_ready_flag: get_display_ready_flag,
  get_buffer: get_buffer,
  // get_size_buffer: get_size_buffer,
  // get_sampled_buffer: get_sampled_buffer,
  // get_size_sampled_buffer: get_size_sampled_buffer
};

}();    //  audio_process_obj = function() 


