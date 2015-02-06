var communication_sockets_obj = function() {

    // http://www.websocket.org/aboutwebsocket.html

    // http://caniuse.com/websockets

    // for binary types (WebSockets supports raw frames using ArrayBuffers and Blobs)

    // var WebSocket;

    // ---

    function show_buffer(given_audio_buffer, given_buffer_size, limit_to_see) {

        console.log('about to show buffer of size ', given_buffer_size);

        var max_visible_index = (given_buffer_size > limit_to_see) ? limit_to_see : given_buffer_size;

        for (var curr_index = 0; curr_index < max_visible_index; curr_index++) {

            console.log(curr_index, given_audio_buffer[curr_index]);
        }

        console.log('end of show buffer of size ', given_buffer_size);
    }

    // ---

    var socket;

    function connect_client_socket() {

        if ("WebSocket" in window) {

            console.log('client in browser says ... WebSocket is supported by your browser.');

            // return; // stens TODO - remove this when live 20140729

            // var chosen_port_client = process.env.PORT;	// OK prior to nodejitsu

            // var chosen_port_client = 80; // change for nodejitsu
            // var chosen_port_client = 8801;	// OK prior to nodejitsu
            // var chosen_port_client = 8888;

            // var chosen_port_client = 8800;


            // console.log("process.env.HOSTING_VENDOR ", process.env.HOSTING_VENDOR);
            // console.log("process.env.NODE_ENV ", process.env.NODE_ENV);
            // console.log("process.env.SUBDOMAIN ", process.env.SUBDOMAIN);
            // console.log("process.env.PORT ", process.env.PORT);
            // console.log("chosen_port_client ", chosen_port_client);

            console.log("version: 0.0.27   ");

            var serviceUrl;

            // if (process.env.NODE_ENV && process.env.NODE_ENV == "production") {

            // serviceUrl = "ws://webgl-3d-animation.jit.su:" + chosen_port_client + '/';
            // serviceUrl = "ws://gentle-cliffs-8200.herokuapp.com:" + chosen_port_client + '/';

            serviceUrl = location.origin.replace(/^http/, 'ws');

            //      } else {

            // serviceUrl = 'ws://localhost:' + chosen_port_client + '/';
            //      }

            // var serviceUrl = 'ws://localhost:8800/';
            // var serviceUrl = 'ws://localhost:' + chosen_port_client + '/';

            var protocol = 'Chat-1.0';

            // http://webgl-3d-animation.jit.su/

            console.log('serviceUrl ', serviceUrl);

            // var socket = new WebSocket(serviceUrl, protocol);
            // socket = new WebSocket(serviceUrl);

            // WebSocket = require('ws');
            socket = new WebSocket(serviceUrl);

            socket.binaryType = "arraybuffer"; // stens TODO - added April 30 2014


            socket.onopen = function() {
                console.log('Connection Established!');
            };

            socket.onclose = function() {
                console.log('Connection Closed!');
            };

            socket.onerror = function(error) {
                console.log('Error Occured: ' + error);
            };

            socket.onmessage = function(e) {

                var binary_bytes = null;
                if (typeof e.data === "string") {
                    console.log('String message received: ' + e.data);
                } else if (e.data instanceof ArrayBuffer) {

                    console.log("ArrayBuffer received: " + e.data,
                        " received size ", e.data.size,
                        " size ", e.size);

                    // var binary_bytes = new ArrayBuffer(e.data);

                    binary_bytes = new Uint8Array(e.data);

                    for (var i = 0; i < 200; i++) {

                        console.log(binary_bytes[i]);
                    }

                } else if (e.data instanceof Blob) { // binary    bbb

                    // console.log('Blob received on client browser side of length ', e.data.length);
                    // console.log('Blob received on client browser side of length      size ', e.size);
                    console.log('Blob received on client browser side of length data.size ', e.data.size);

                    var size_buffer = e.data.size;

                    // var binary_bytes = new Uint8Array(e.data);
                    // var binary_bytes = new ArrayBuffer(e.data);
                    binary_bytes = new Blob(e.data);
                    // var image = context.createImageData(canvas.width, canvas.height);
                    // for (var i = 0; i < 200; i++) {

                    //     console.log(binary_bytes[i]);
                    // }
                    // context.drawImage(image, 0, 0);



                    /*
				var audio_buffer = new Uint8Array(e.data, 0, size_buffer);

				show_buffer(audio_buffer, size_buffer, 20);
				*/


                    // ---
                    // bbb

                    for (var property in Blob) {

                        console.log("Blob property ", property, " value ", Blob[property]);
                    }

                }
            };

            // socket.send("Hello WebSocket!");
            // socket.close();

        } else {

            var error_msg = "ERROR - failed to find WebSocket in client";

            console.log(error_msg);
            alert(error_msg);
        }
    }

    function pop_monster(given_data_blob) {

        var curr_value;
        var inneri = 0;
        var index_int_from_float = 0;

        var one_float = new Float32Array(1);

        var one_float_in_four_bytes_int;
        var size_monster = given_data_blob.size_buffer;

        for (var index = 0; index < size_monster; index++) {

            if (given_data_blob.datatype == 'int') {

                // big_monster_data_int8[index] = Common_Utils.get_random_in_range_inclusive_int(0, 255);
                given_data_blob.buffer[index] = Common_Utils.get_random_in_range_inclusive_int(0, 255);

                console.log(index, ' value ', given_data_blob.buffer[index]);

            } else if (given_data_blob.datatype == 'float') {

                // big_monster_data_float32[index] = Common_Utils.get_random_in_range_inclusive_float( -0.9999, 0.9999);

                // big_monster_data_float32[index] = 0.0;
                // big_monster_data_float32[index] = 1.0;

                one_float[0] = Common_Utils.get_random_in_range_inclusive_float(-0.9999, 0.9999);



                one_float_in_four_bytes_int = new Uint8Array(one_float.buffer, 0, Float32Array.BYTES_PER_ELEMENT); // First float of fa.

                console.log(index, ' this array size should be 4 ', one_float_in_four_bytes_int.length,
                    ' originally value as a float ', one_float[0]);

                for (inneri = 0; inneri < 4; inneri++) {

                    console.log(inneri, ' int value ', one_float_in_four_bytes_int[inneri]);

                    given_data_blob.buffer[index_int_from_float++] = one_float_in_four_bytes_int[inneri];
                }

                // big_monster_data_int8_from_float32[index] = 1.0;




                console.log(index, ' value ', one_float[0]);

            } else {

                var error_msg = 'ERROR - failed to find data type in given_data_blob';
                console.log(error_msg);
                alert(error_msg);
            }

            // if (index % 200000 == 0) {

            // console.log(index, ' value ', big_monster_data[index]);
            // }
        }


        // var size_monster = 10;
        // var big_monster_data = new Uint8Array(size_monster);

    }

    // communication_sockets_obj.socket_client(1);

    // function convert_32bit_float_typed_array_into_4_bytes_ints_typed_array(given_data_blob, given_binary_data) {
    function convert_32bit_float_typed_array_into_4_bytes_ints_typed_array(data_input, data_output) {

        /*

		given binary data can be either int or float typed array,
		output will be Uint8Array which can be handles OK by web socket
	*/

        var curr_value;
        var inneri = 0;
        var index_int_from_float = 0;

        var one_float = new Float32Array(1);

        var one_float_in_four_bytes_int;
        var size_monster = data_output.buffer.length;

        console.log(' big data blog datatype ', data_output.datatype, " size ", size_monster);

        for (var index = 0; index < size_monster; index++) {

            if (data_output.datatype == 'int') {

                // big_monster_data_int8[index] = Common_Utils.get_random_in_range_inclusive_int(0, 255);
                data_output.buffer[index] = Common_Utils.get_random_in_range_inclusive_int(0, 255);

            } else if (data_output.datatype == 'float') {

                // one_float[0] = Common_Utils.get_random_in_range_inclusive_float( -0.9999, 0.9999);
                // one_float[0] = data_input[index];
                one_float[0] = data_input.buffer[index];

                one_float_in_four_bytes_int = new Uint8Array(one_float.buffer, 0, Float32Array.BYTES_PER_ELEMENT); // First float of fa.

                // console.log(index, ' as float ', one_float[0], " as int ", one_float_in_four_bytes_int);

                // console.log(index, ' this array size should be 4 ', one_float_in_four_bytes_int.length,
                // 	' originally value as a float ', one_float[0]);

                // bbb
                for (inneri = 0; inneri < 4; inneri++) {

                    // console.log(inneri, ' int value ', one_float_in_four_bytes_int[inneri]);

                    data_output.buffer[index_int_from_float++] = one_float_in_four_bytes_int[inneri];
                }

                if (index_int_from_float % 20000 === 0) {

                    console.log(index, ' currated sampled every 200 float value ', one_float[0]);
                }

            } else {

                var error_msg = 'ERROR - failed to find data type in data_output';
                console.log(error_msg);
                alert(error_msg);
            }

            // if (index % 200000 == 0) {

            // console.log(index, ' value ', big_monster_data[index]);
            // }
        }
    } //		convert_32bit_float_typed_array_into_4_bytes_ints_typed_array


    function socket_client(given_mode, given_binary_data) {
        // function socket_client(given_mode) {

        // http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/

        // http://www.codeproject.com/Articles/531698/Introduction-to-HTML-WebSocket

        console.log('inside socket_client with given_mode ', given_mode);

        console.log('about to probe   socket   ');

        if (typeof socket !== 'undefined') {

            console.log('OK OK OK socket is defined');

        } else {

            console.log('Boo Boo Boo socket is NOT NOT NOT defined');
        }

        if (given_mode == 1) {

            connect_client_socket();

        } else if (given_mode == 2) {

            socket.send("Hello WebSocket!");
            // socket.close();

        } else if (given_mode == 3 || given_mode == 4 || given_mode == 5) {

            console.log("socket_client    given_mode ", given_mode);

            // typed arrays :  3 = ints   4 = floats  5 = elephant roar

            // binary typed array

            // stens TODO - below does NOTHING - has NO impact on sending typed arrays
            // socket.binaryType = 'arraybuffer';	// tell socket to get into Binary node

            // if (given_binary_data) {

            if (typeof given_binary_data !== 'undefined') {

                console.log("cool was given binary data to send to server side length ",
                    given_binary_data.size_buffer);

                switch (given_mode) {

                    case 4:
                        { // genetic synth on server side

                            console.log('... bundling genetic synth data   ');

                            for (var property in given_binary_data) {

                                if (property == "buffer") {

                                    console.log("seeing property property Genetic  will skip over");

                                    // console.log("here is big buffer ", big_data_blob.buffer);

                                } else {

                                    console.log("socket_client EEEEEEEEnetiCCCCC ", property,
                                        given_binary_data[property]);

                                    socket.send(property + "=" + given_binary_data[property]);

                                    // socket.send("request_flavor=elephant_roar");
                                }
                            }

                            // --- must send actual binary audio buffer AFTER above parms are sent over

                            // socket.send(big_data_blob.buffer);	// no binary in this direction
                            break;
                        }


                    case 3:
                        { // elephant roar

                            console.log('... bundling elephant roar data   ');

                            var big_data_blob = {}; // parent object for big data
                            var blob_property = null;

                            for (blob_property in given_binary_data) { // copy over from source to target

                                if (blob_property != "buffer") {

                                    big_data_blob[blob_property] = given_binary_data[blob_property];
                                }
                            }

                            // ---

                            big_data_blob.datatype = 'float';

                            var size_int_buff = given_binary_data.buffer.length * Float32Array.BYTES_PER_ELEMENT;

                            console.log("output big buffer size ", size_int_buff);

                            // big_data_blob.buffer = new Uint8Array(given_binary_data.buffer.length * Float32Array.BYTES_PER_ELEMENT);
                            big_data_blob.buffer = new Uint8Array(size_int_buff);

                            convert_32bit_float_typed_array_into_4_bytes_ints_typed_array(given_binary_data, big_data_blob);

                            big_data_blob.size_buffer = big_data_blob.buffer.length;
                            big_data_blob.size = big_data_blob.buffer.length;
                            big_data_blob.data_type_buffer = "Uint8Array"; // descriptive buffer typeof

                            console.log("ssss elephant roar POST float to int has buffer length ",
                                big_data_blob.buffer.length);

                            for (blob_property in big_data_blob) {

                                if (blob_property == "buffer") {

                                    console.log("seeing property property SSSSSSSOOO will skip over");

                                    console.log("here is big buffer ", big_data_blob.buffer);

                                } else {

                                    console.log("socket_client TTTTTTT ", blob_property,
                                        big_data_blob[blob_property]);

                                    socket.send(blob_property + "=" + big_data_blob[blob_property]);
                                }
                            }

                            // --- must send actual binary audio buffer AFTER above parms are sent over

                            socket.send(big_data_blob.buffer);
                            break;
                        }

                    case 0:
                        {

                            // console.log('... OK synth from sample is available so render is progressing  341 ');

                            // chosen_buff_obj.buffer = synth_from_sample_buffer;
                            // chosen_buff_obj.size = desired_synth_buff_size;

                            // return chosen_buff_obj;
                            break;
                        }

                        // --- default - catch all if not identifed above

                        // socket.send(big_data_blob.buffer);

                        break;
                }



                // socket.send(big_data_blob.buffer);
                // socket.send(big_data_blob);

            } else {

                console.log('inside socket_client  about to pop_monster ');

                var monster_blob = {}; // parent object for big data

                monster_blob.size_buffer = 3; // number of elements in numeric array

                if (given_mode == 3) {

                    monster_blob.datatype = 'int';

                    monster_blob.buffer = new Uint8Array(monster_blob.size_buffer);

                } else if (given_mode == 4) {

                    monster_blob.datatype = 'float';

                    monster_blob.buffer = new Uint8Array(monster_blob.size_buffer * Float32Array.BYTES_PER_ELEMENT);
                }

                pop_monster(monster_blob);

                socket.send(monster_blob.buffer);

                // ---

                /*
			if (big_data_blob.datatype == 'int') {

				// socket.send(big_monster_data_int8);
				socket.send(big_data_blob.buffer);
				// socket.send(big_monster_data_int8, {binary: true, mask: true});

				// ws.send(array, {binary: true, mask: true});

			} else if (big_data_blob.datatype == 'float') {

				// socket.send(big_monster_data_float32, {binary: true, mask: true});
				// socket.send(big_monster_data_float32);

				var size_mm = big_data_blob.buffer.buffer.length;

				console.log('showing each int element of array prior to socket send ');

				for (var index = 0; index < size_mm; index++) {

					// console.log(index, big_monster_data_int8_from_float32[index]);
					console.log(index, big_data_blob.buffer[index]);
				}

				// socket.send(big_monster_data_int8_from_float32);
				socket.send(big_data_blob.buffer);


				// ws.send(array, {binary: true, mask: true});

			} else {

				var error_msg = 'ERROR - failed to find data type in pop_monster';
				console.log(error_msg);
				alert(error_msg);
			}
			*/

            }

        } else if (given_mode == 5) {

            console.log("cool about to send elephant roar data to nodejs server side file");

            // socket.send(big_data_blob.buffer);



        } else {

            var error_msg = "ERROR - did not recognize given_mode sent to socket_client";

            console.log(error_msg);
            alert(error_msg);
        }
    } //		socket_client


    // https://stackoverflow.com/questions/19462705/nodejs-websocket-server-http-trigger

    // communication_sockets_obj.socket_server


    // ---------------------------------------

    return { // to make visible to calling reference frame list function here comma delimited,

        socket_client: socket_client
        // socket_server: socket_server

        // get_size_buffer: get_size_buffer,
        // get_sampled_buffer: get_sampled_buffer,
        // get_size_sampled_buffer: get_size_sampled_buffer
    };

}(); //  communication_sockets_obj = function()