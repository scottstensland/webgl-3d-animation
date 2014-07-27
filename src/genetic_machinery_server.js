

// --- genetic_machinery_server

//	http://nodejs.org/api/modules.html


var events = require('events');

// var genetic_machinery_obj = function() {


var channel = new events.EventEmitter();
channel.clients = {};
channel.subscriptions = {};

 // ---

 channel.on('create_curve', function (audio_obj, given_socket_conn, callback_when_done) {

	audio_obj.flavor = "genetic_synthesis";

	var size_buffer = audio_obj.size_buffer;

	console.log("inside callback :  create_curve       ........... ", size_buffer);

	var num_channels = audio_obj.num_channels;

	console.log('inside genetic_launch with     num_channels ', num_channels);


	// var desired_frequency = 800.0;	// Hertz == cycles per second
	// var desired_frequency = 3600.0;	// Hertz == cycles per second
	var desired_frequency = audio_obj.frequency;	// Hertz == cycles per second

	// var sample_rate = 44100;	// samples_per_second
	var sample_rate = audio_obj.sample_rate;	// samples_per_second

	console.log('GGGG   size_buffer       ', size_buffer);
	console.log('GGGG   desired_frequency ', desired_frequency);
	console.log('GGGG   sample_rate       ', sample_rate);
	console.log('GGGG   num_channels      ', num_channels);


	audio_obj.duration = size_buffer / (desired_frequency * sample_rate * num_channels);

	console.log('hhhhhhhh   audio_obj.duration ', audio_obj.duration);


	// var total_samples = size_buffer;
	// var total_seconds = size_buffer / sample_rate;
	// var total_cycles = total_seconds * desired_frequency;
	// var samples_per_cycle = total_samples / total_cycles;
	// var radians_per_cycle = 2.0 * Math.PI;
	// var radians_per_sample = radians_per_cycle / samples_per_cycle;


	var radians_per_sample = (2.0 * Math.PI * desired_frequency) / (sample_rate);

	console.log('radians_per_sample ', radians_per_sample);
	// new radians_per_sample  0.11398068584452764 

	console.log("pppppppp sample_rate ", sample_rate);
	console.log("desired_frequency ", desired_frequency);
	console.log("radians_per_sample ", radians_per_sample);


	audio_obj.buffer = new Float32Array(size_buffer);


	var curr_y;
	var theta = 0.0;
	var incr_theta = radians_per_sample;
	var index_buff = 0;

	do {

	
		// curr_y = octave_offset * seed_obj.buffer[index_seed];

		// // console.log('curr_y ', curr_y);

		// curr_y = curr_y / octave_offset;

		// buff_obj.buffer[index_buff] += curr_y;	// stens TODO may need to normalize post this loop

		// // console.log('index_seed ', index_seed, index_buff, octave_offset,
		// // 				' strat ', buff_obj.buffer[index_buff]);

		// index_seed++;

		// if (! (index_seed < size_seed)) {

		// 	index_seed = 0;	// loop back to beginning as we repeat this seed buffer to pop main buff
		// }
	

		// ------------- below synthesizes sine wave --------------  //

		audio_obj.buffer[index_buff] = Math.sin(theta);

		theta += incr_theta;

	} while (++index_buff < size_buffer);

	channel.emit('synthesis_done', audio_obj, given_socket_conn, callback_when_done);

 });

channel.on('synthesis_done', function (audio_obj, given_socket_conn, callback_when_done) {

	console.log("COOOOOOOOOOOOOOlllllllll server side buff synth is DONE");
	console.log("COOOOOOOOOOOOOOlllllllll server side buff synth is DONE");
	console.log("COOOOOOOOOOOOOOlllllllll server side buff synth is DONE");
	console.log("COOOOOOOOOOOOOOlllllllll server side buff synth is DONE");

	callback_when_done(audio_obj, given_socket_conn);	// bbb
});


channel.on('do_genetic_synth', function (audio_obj, given_socket_conn, callback_when_done) {

    console.log("inside do_genetic_synth callback from genetic_main .....  |||||||||||||||");

    for (var property in audio_obj) {

        console.log("aaaaaaaaa do_genetic_synth property ", property, audio_obj[property]);
    }

    channel.emit('create_curve', audio_obj, given_socket_conn, callback_when_done);

});

exports.genetic_main = function (buff_obj, given_socket_conn, callback_when_done) {

	channel.emit('do_genetic_synth', buff_obj, given_socket_conn, callback_when_done);

}		//		genetic_launch

// ---------------------------------------

