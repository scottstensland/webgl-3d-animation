//   HTTPD server from scratch

//step 1) require the modules we need
var httpd = require('http');
var path = require('path');
var fs = require('fs');
var ws = require("nodejs-websocket"); // https://www.npmjs.org/package/nodejs-websocket

// var jdataview = require('jdataview');

// var events = require('events');


// var channel = new events.EventEmitter();
// channel.clients = {};
// channel.subscriptions = {};

//  // ---

// var gene_mach = require('./genetic_machinery_server.js')
//  , inherits     = require('util').inherits
//  ;

// ---

//helper function handles file verification
function getFile(filePath, res, page404) {

    // console.log('TOP getFile filePath ', filePath);

    //does the requested file exist?
    fs.exists(filePath, function(exists) {
        //if it does...
        if (exists) {
            //read the fiule, run the anonymous function
            fs.readFile(filePath, function(err, contents) {

                // console.log('filePath   ', filePath);

                if (!err) {
                    //if there was no error
                    //send the contents with the default 200/ok header

                    var tmp = filePath.lastIndexOf(".");
                    var extension = filePath.substring((tmp + 1));

                    // if (extension === 'js') {

                    //     res.writeHead(200, {"Content-Type": 'text/javascript'});
                    // }

                    // to EXTEND below listing of file types see :

                    // https://gist.github.com/rrobe53/976610

                    // set content type
                    if (extension === 'html') res.writeHeader(200, {
                        "Content-Type": 'text/html'
                    });
                    else if (extension === 'htm') res.writeHeader(200, {
                        "Content-Type": 'text/html'
                    });
                    else if (extension === 'css') res.writeHeader(200, {
                        "Content-Type": 'text/css'
                    });
                    else if (extension === 'js') res.writeHeader(200, {
                        "Content-Type": 'text/javascript'
                    });
                    else if (extension === 'png') res.writeHeader(200, {
                        "Content-Type": 'image/png'
                    });
                    else if (extension === 'jpg') res.writeHeader(200, {
                        "Content-Type": 'image/jpg'
                    });
                    else if (extension === 'jpeg') res.writeHeader(200, {
                        "Content-Type": 'image/jpeg'
                    });
                    else if (extension === 'ico') res.writeHeader(200, {
                        'Content-Type': 'image/x-icon'
                    });
                    else if (extension === 'wav') res.writeHeader(200, {
                        'Content-Type': 'audio/x-wav'
                    });
                    else if (extension === 'ogg') res.writeHeader(200, {
                        'Content-Type': 'audio/ogg'
                    });



                    else {
                        console.log("ERROR - NO CORRECT EXTENSION")
                    };

                    res.end(contents);

                } else {
                    //for our own troubleshooting
                    console.dir(err);
                };
            });
        } else {
            //if the requested file was not found
            //serve-up our custom 404 page
            fs.readFile(page404, function(err, contents) {
                //if there was no error
                if (!err) {
                    //send the contents with a 404/not found header 
                    res.writeHead(404, {
                        'Content-Type': 'text/html'
                    });
                    // res.writeHead(404, {"Content-Type": "text/plain"});
                    res.write("404 Not Found\n");
                    res.write(contents);
                    res.end();
                } else {
                    //for our own troubleshooting

                    console.log("ERROR - failed to find file :  " + filePath);

                    console.dir(err);
                };
            });
        };
    });
};

// ---  websocket server


function is_origin_allowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

// ---

function get_good_timestamp() {

    Date.prototype.yyyymmdd = function() {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
        var dd = this.getDate().toString();
        var time = this.getTime().toString();

        // return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]) + time; // padding
        return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]) + '_' + time; // padding
    };

    return (new Date().yyyymmdd());
}

/*
function write_filetype_specified() {

    // var fs = require('fs');

    var path = '/tmp/test_nodejs_friday_april_8_247_some_data.txt';

    var buffer = new Buffer("some content\n");

    fs.open(path, 'w', function(err, fd) {

        // fs.open(path, 'b', function(err, fd) {   // b for binary ... w for normal write

        if (err) {

            throw 'error opening file: ' + err;

        } else {

            fs.write(fd, buffer, 0, buffer.length, null, function(err) {

            if (err) throw 'error writing file: ' + err;
                fs.close(fd, function() {
                console.log('file written');
                })
            });
        }
    });
}
*/

// ---


function write_nonblocking_async(data_to_persist) {

    // var fs = require('fs');

    //          test_nodejs_friday_april_4_1247_NON_blocking

    var stream = fs.createWriteStream("/tmp/test_nodejs_friday_april_4_1247_NON_blocking.txt");

    stream.once('open', function(fd) {
        stream.write("My first row\n");
        stream.write("My second row\n");
        stream.end();
    });
}

// ---

function write_json_serialized(data_to_persist) {

    // var curr_timestamp = new Date().getTime();
    // var curr_timestamp = new Date().toDateString();
    var curr_timestamp = get_good_timestamp();


    var outputFilename = "/tmp/test_nodejs_write_json_serialized_" + curr_timestamp + ".txt";

    console.log('outputFilename ', outputFilename);

    fs.writeFile(outputFilename, JSON.stringify(data_to_persist, null, 4), function(err) {

        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + outputFilename);
        }
    });
}

// ---



function write_buffer_to_file(data_to_persist) {

    // var curr_timestamp = new Date().getTime();
    // var curr_timestamp = new Date().toDateString();
    var curr_timestamp = get_good_timestamp();


    var output_filename = "/tmp/test_nodejs_write_buffer_to_file_v3_" + curr_timestamp + ".txt";

    console.log('output_filename ', output_filename);
    console.log('data_to_persist length ', data_to_persist.length);

    var write_stream = fs.createWriteStream(output_filename);

    write_stream.on('finish', function() {

        console.log('file has been written');
    });

    // write_stream.write(data_to_persist);
    // write_stream.end();


    var size_buff = data_to_persist.length;

    for (var index = 0; index < size_buff; index++) {

        // write_stream.write(data_to_persist[index] + "\n");

        var curr_value = data_to_persist[index];

        // console.log(curr_value);

        write_stream.write(curr_value + "\n");
    }

    write_stream.end();
}

function writeUTFBytes(view, offset, string) {

    var lng = string.length;
    for (var i = 0; i < lng; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}



function mergeBuffers(channelBuffer, recordingLength) {

    var result = new Float32Array(recordingLength);
    var offset = 0;
    var lng = channelBuffer.length;
    for (var i = 0; i < lng; i++) {
        var buffer = channelBuffer[i];
        result.set(buffer, offset);
        offset += buffer.length;
    }
    return result;
}


function interleave(leftChannel, rightChannel) {
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);

    var inputIndex = 0;

    for (var index = 0; index < length;) {
        result[index++] = leftChannel[inputIndex];
        result[index++] = rightChannel[inputIndex];
        inputIndex++;
    }
    return result;
}



function checkEndian() {

    // https://stackoverflow.com/questions/7869752/javascript-typed-arrays-and-endianness

    var a = new ArrayBuffer(4);
    var b = new Uint8Array(a);
    var c = new Uint32Array(a);
    b[0] = 0xa1;
    b[1] = 0xb2;
    b[2] = 0xc3;
    b[3] = 0xd4;
    if (c[0] == 0xd4c3b2a1) return "little endian";
    if (c[0] == 0xa1b2c3d4) return "big endian";
    else throw new Error("Something crazy just happened");
}

function parse_wav(wav_input_file_obj) {

    // http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/WAVE.html
    // http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/Samples.html

    var raw_buffer = wav_input_file_obj.raw_buffer; // entire contents of input file which is parsed 

    console.log("top of parse_wav +++++++++++++++++++++  raw_buffer.length ", raw_buffer.length);

    var size_header = 44;
    var offset = 0;

    var RIFF = new Buffer(4); // these MUST remain size 4
    var WAVE = new Buffer(4);
    var fmt = new Buffer(4);
    var data = new Buffer(4);


    raw_buffer.copy(RIFF, 0, offset, RIFF.length); //  chunckID 0 offset 4 bytes
    offset += 4;

    // console.log("is this RIFF or what ",RIFF.toString('ascii',0,RIFF.length)," RIFF.length ",RIFF.length);

    if (RIFF != "RIFF") {

        var err_msg = "ERROR - failed to see RIFF at top of input WAV file parse";
        console.log(err_msg);

        return new Error(err_msg); // stens TODO - this require caller to handle this error

        // https://stackoverflow.com/questions/7310521/node-js-best-practice-exception-handling
    }

    var chunckSize;
    chunckSize = raw_buffer.readUInt32LE(offset); //  chunckSize 4 offset 4 bytes
    offset += 4;
    console.log("on read ... chunckSize ", chunckSize);


    raw_buffer.copy(WAVE, 0, offset, offset + WAVE.length); //  format 8 offset 4 bytes
    offset += 4;
    console.log("on read ... WAVE is what  ", WAVE.toString('ascii', 0, WAVE.length), " WAVE.length ", WAVE.length);




    raw_buffer.copy(fmt, 0, offset, offset + fmt.length); // subchunk1ID  12 offset 4 bytes
    offset += 4;
    console.log("on read ... fmt is what  ", fmt.toString('ascii', 0, fmt.length), " fmt.length ", fmt.length);



    wav_input_file_obj.pcm_format = raw_buffer.readUInt32LE(offset); //  subchunk1Size 16 offset 4 bytes
    offset += 4;
    console.log("on read ... pcm_format ", wav_input_file_obj.pcm_format);
    // valid values of Chunk size :   16 or 18 or 40




    wav_input_file_obj.audio_format = raw_buffer.readUInt16LE(offset); //  audioFormat 20 offset 2 bytes
    offset += 2;
    console.log('on read ... audio_format ', wav_input_file_obj.audio_format);


    wav_input_file_obj.num_channels = raw_buffer.readUInt16LE(offset); //  numChannels 22 offset 2 bytes
    offset += 2;
    console.log('on read ... num_channels ', wav_input_file_obj.num_channels);
    //  Number of interleaved channels



    wav_input_file_obj.sample_rate = raw_buffer.readUInt32LE(offset); //  sampleRate 24 offset 4 bytes
    offset += 4;
    console.log('on read ... sample_rate ', wav_input_file_obj.sample_rate);
    // blocks per second


    wav_input_file_obj.byte_rate = raw_buffer.readUInt32LE(offset); //  byteRate 28 offset 4 bytes
    offset += 4;
    console.log("on read ... byte_rate ", wav_input_file_obj.byte_rate);
    // byteRate = sampleRate * numChannels * bitDepth / 8;
    wav_input_file_obj.bit_depth = (wav_input_file_obj.byte_rate * 8.0) /
        (wav_input_file_obj.sample_rate * wav_input_file_obj.num_channels);
    console.log("on read ... bit_depth    ", wav_input_file_obj.bit_depth);
    // average bytes per second - data rate




    wav_input_file_obj.block_align = raw_buffer.readUInt16LE(offset); //  blockAlign 32 offset 2 bytes
    offset += 2;
    console.log("on read .... block_align ", wav_input_file_obj.block_align);
    // data block size in bytes


    wav_input_file_obj.bits_per_sample = raw_buffer.readUInt16LE(offset); //  bitsPerSample 34 offset 2 bytes
    offset += 2;
    console.log("on read ... bits_per_sample ", wav_input_file_obj.bits_per_sample);
    // bits per sample



    raw_buffer.copy(data, 0, offset, offset + data.length); //  subchunk2ID 36 offset 4 bytes
    offset += 4;
    console.log("data is what  ", data.toString('ascii', 0, data.length), " data.length ", data.length);




    var subchunk2Size;
    subchunk2Size = raw_buffer.readUInt32LE(offset); //  subchunk1Size 16 offset 4 bytes
    offset += 4;
    console.log("subchunk2Size ", subchunk2Size);


    if (!(size_header == offset)) {

        var err_msg = "ERROR - input file header must contain " + size_header +
            " bytes it incorrectly contains : " + offset;

        console.log(err_msg);
    }

    console.log("end of read header ......... offset ", offset);


    var size_buffer = wav_input_file_obj.raw_buffer.length - size_header

    wav_input_file_obj.buffer = new Buffer(size_buffer);

    raw_buffer.copy(wav_input_file_obj.buffer, 0, offset, offset + size_buffer);

    console.log("end of read payload buffer size  ", wav_input_file_obj.buffer.length);

} //      parse_wav

function read_file_into_buffer(input_file_obj, callback) {

    console.log("IIIIIIIII inside read_file_into_buffer   filename ", input_file_obj.filename);

    var input_read_stream = fs.createReadStream(input_file_obj.filename);

    var max_print_count = 5;
    var curr_print_count = 0;

    input_read_stream.on('readable', function() {

        var newData;

        // console.log('inside READABLEEEEEEEEEE of read_file_into_buffer ');

        while (null !== (newData = input_read_stream.read())) {

            if (curr_print_count < max_print_count) {

                console.log('CCCCCC binary newData length this callback cycle is ', newData.length);
            }

            input_file_obj.raw_buffer = Buffer.concat([input_file_obj.raw_buffer, newData], input_file_obj.raw_buffer.length + newData.length);

            if (curr_print_count < max_print_count) {

                console.log('binary input_file_obj.raw_buffer length post concat  ', input_file_obj.raw_buffer.length);
            }
            curr_print_count++;
        }
    });


    // Done, process the big data
    input_read_stream.on("error", function(error) {

        console.log("ERROR - failure when attempting to read ", input_file_obj.filename, error);
    });


    // Done, process the big data
    input_read_stream.on("end", function() {

        console.log('ENNNNNNNNNNDDDD input_file_obj.raw_buffer length ', input_file_obj.raw_buffer.length);

        callback(input_file_obj); // do something with data read from file - parse_wav

        // ---

        delete input_file_obj["raw_buffer"]; // no longer need raw pre parse buffer

        console.log("post callback to parse_wav with property iteration of input_file_obj");
    });

} //      read_file_into_buffer

function write_wav(wav_file_obj) {

    // --- iterate across all properties of given audio file object to see things like sample_rate

    // var sampleRate  = 44100;    // defaults to be overridden in below switch statement
    // var bitDepth    = 16;
    // var numChannels = 1;
    // var pcm_format = 16;
    // var audio_format = 1; // raw PCM


    var sample_rate = 44100; // defaults to be overridden in below switch statement
    var bit_depth = 16;
    var num_channels = 1;
    var pcm_format = 16; // valid values of Chunk size :   16 or 18 or 40
    var audio_format = 1; // raw PCM

    show_object_with_buffer(wav_file_obj, "in write_wav");

    for (var property in wav_file_obj) {

        // console.log("1111111  write_wav ", property, wav_file_obj[property]);

        switch (property) {

            case "sample_rate":
                {

                    sample_rate = wav_file_obj[property];
                    break;
                }

            case "bit_depth":
                {

                    bit_depth = wav_file_obj[property];
                    break;
                }

            case "num_channels":
                {

                    num_channels = wav_file_obj[property];
                    break;
                }

                // --- default - catch all if not identifed above

                console.log("ignore this ... seeing property NOT on authorized list : ", property,
                    " value ", wav_file_obj[property]);
                break;
        }
    }

    console.log("FFFFFFFF sample_rate  ", sample_rate);
    console.log("FFFFFFFF bit_depth    ", bit_depth);
    console.log("FFFFFFFF num_channels ", num_channels);


    // ---

    var size_header = 44; // constant number of bytes in WAV header as per spec

    var RIFF = new Buffer('RIFF'); // each of these constant MUST remain 4 bytes in size
    var WAVE = new Buffer('WAVE');
    var fmt = new Buffer('fmt ');
    var data = new Buffer('data');

    // ---

    var path = wav_file_obj.filename;

    console.log("/////////// about to write wav output file path ", path);
    console.log("size buffer to write  ", wav_file_obj.buffer.length); // deal with 1 channel for now

    console.log(checkEndian());

    // ---

    var data_length = wav_file_obj.buffer.length;

    var entire_size_file = data_length + size_header;

    var write_stream = fs.createWriteStream(path);

    // ---

    var header = new Buffer(size_header);
    var offset = 0;

    // write the "RIFF" identifier
    RIFF.copy(header, offset); //  chunckID 0 offset  4 bytes
    offset += 4;


    var chunckSize = entire_size_file - 8;
    // write the file size minus the identifier and this 32-bit int
    // header['writeUInt32' + this.endianness](entire_size_file - 8, offset);
    header.writeUInt32LE(chunckSize, offset); //  chunckSize 4 offset 4 bytes
    offset += 4;


    // write the "WAVE" identifier
    WAVE.copy(header, offset); // format   8 offset 4 bytes
    offset += 4;


    // write the "fmt " sub-chunk identifier
    fmt.copy(header, offset); //  subchunk1ID 12 offset 4 bytes
    offset += 4;


    // write the size of the "fmt " chunk
    // XXX: value of 16 is hard-coded for raw PCM format. other formats have
    // different size.
    // header['writeUInt32' + this.endianness](16, offset);
    // var pcm_format = 16;
    header.writeUInt32LE(pcm_format, offset); //  subchunk1Size 16 offset 4 bytes
    offset += 4;
    console.log('write pcm_format ', pcm_format, " post incr offset ", offset);
    // valid values of Chunk size :   16 or 18 or 40



    // write the audio format code
    // header['writeUInt16' + this.endianness](this.format, offset);
    // var audio_format = 1; // raw PCM
    header.writeUInt16LE(audio_format, offset); //  audioFormat  20 offset 2 bytes    
    offset += 2;
    console.log('write audio_format ', audio_format, " post incr offset ", offset);


    // write the number of channels
    // var num_channels = 1;
    // header['writeUInt16' + this.endianness](this.channels, offset);
    header.writeUInt16LE(num_channels, offset); //  num_channels  22 offset 2 bytes     
    offset += 2;

    console.log('write num_channels ', num_channels, " post incr offset ", offset);

    // write the sample rate
    // var sampleRate = 44100;
    // header['writeUInt32' + this.endianness](this.sampleRate, offset);
    header.writeUInt32LE(sample_rate, offset); //  sampleRate  24 offset 4 bytes     
    offset += 4;
    console.log('write sample_rate ', sample_rate, " post incr offset ", offset);


    // var bitDepth = 16;
    // write the byte rate
    var byteRate = this.byteRate;
    if (null == byteRate) {

        byteRate = sample_rate * num_channels * bit_depth / 8;

        console.log("on write byteRate was null so post calculation its ", byteRate);
    }
    // header['writeUInt32' + this.endianness](byteRate, offset);
    header.writeUInt32LE(byteRate, offset); //  byteRate  28 offset 4 bytes
    offset += 4;
    console.log("on write ... byteRate ", byteRate);
    console.log("on write ... sample_rate ", sample_rate);
    console.log("on write ... num_channels ", num_channels);
    console.log("on write ... bit_depth ", bit_depth);


    console.log('write byteRate ', byteRate, " post incr offset ", offset);


    // write the block align
    var blockAlign = this.blockAlign;
    if (null == blockAlign) {
        blockAlign = num_channels * bit_depth / 8;
    }
    // header['writeUInt16' + this.endianness](blockAlign, offset);
    header.writeUInt16LE(blockAlign, offset); //  blockAlign  32 offset 2 bytes     
    offset += 2;
    console.log("on write ... blockAlign ", blockAlign);


    // write the bits per sample
    var bitsPerSample = bit_depth;
    // header['writeUInt16' + this.endianness](this.bitDepth, offset);
    header.writeUInt16LE(bitsPerSample, offset); //  bitsPerSample  34 offset 2 bytes     
    offset += 2;

    // offset += 2;                                    // filler_01  36 offset 2 bytes - just ignore

    // write the "data" sub-chunk ID
    data.copy(header, offset); // subchunk2ID  36 offset 4 bytes
    offset += 4;

    // write the remaining length of the rest of the data
    // header['writeUInt32' + this.endianness](dataLength, offset);
    var subchunk2Size = data_length;
    header.writeUInt32LE(data_length, offset); //  subchunk2Size  40 offset 4 bytes
    offset += 4;

    if (!(44 == offset)) {

        var err_msg = "ERROR - input file header must contain " + size_header +
            " bytes it incorrectly contains : " + offset;

        console.log(err_msg);
    }

    console.log("end of write ........... offset ", offset);

    // ---

    write_stream.write(header);

    // ---

    show_object_with_buffer(wav_file_obj, "spot_alpha");

    write_stream.write(wav_file_obj.buffer);

    write_stream.end();

    console.log("write_wav is complete");

} //      write_wav

// ---

var received_data_arraybuffer;

function process_my_data(given_data) {

    // multi byte typed array websocket how to reassemble

    // http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/

    // data comes over as Uint8Array - unsigned integer array - we want floating 32 bit array

    // var given_datatype = 'int';
    var given_datatype = 'float';


    console.log('given_datatype is ', given_datatype);

    var size_buff = given_data.length;

    console.log('size_buff is ', size_buff);

    var index_float = 0;

    var big_binary_float = new Float32Array(size_buff / 4); // stens TODO assure it divides evenly

    if (given_datatype == 'int') {

        // following is OK for int Uint8Array
        received_data_arraybuffer = new Uint8Array(given_data, 0, Uint8Array.BYTES_PER_ELEMENT);

        write_json_serialized(received_data_arraybuffer);

    } else if (given_datatype == 'float') {

        received_data_arraybuffer = new Uint8Array(given_data, 0, Uint8Array.BYTES_PER_ELEMENT);


        console.log('float received_data_arraybuffer size ', received_data_arraybuffer.length);


        var buffer_single_byte_sized = new Buffer(4); // holds enough to populate a single float
        var number_float;

        var index_int = 0;

        for (var index = 0; index < size_buff; index += 4) {
            // for (var index = 0; index < size_buff; index++) {

            // console.log('raw ', index, given_data[index]);


            // for (var inneri = 0; inneri < 4; inneri++) { // take float sized gulps endian
            for (var inneri = 3; inneri >= 0; inneri--) { // take float sized gulps other endian

                buffer_single_byte_sized[inneri] = given_data[index_int++];

                // console.log('raw ', index, inneri, buffer_single_byte_sized[inneri]);
            }

            // var view = new jDataView(buffer_single_byte_sized);
            var view = new jdataview(buffer_single_byte_sized);




            number_float = view.getFloat32(0);

            // console.log('binary number_float ', number_float);

            big_binary_float[index_float++] = number_float;

        }

        // write_json_serialized(big_binary_float);
        write_buffer_to_file(big_binary_float);
    }
} //      process_my_data

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

function write_8_bit_buffer_to_32_bit_output_file(input_data, output_data) {

    var index_float = 0;
    var buffer_single_byte_sized = new Buffer(4); // holds enough to populate a single float
    var number_float;

    var size_buff = input_data.buffer.length;
    var index_int = 0;

    console.log("size_buff ", size_buff);

    for (var index = 0; index < size_buff; index += 4) {
        // for (var index = 0; index < size_buff; index++) {

        // for (var inneri = 0; inneri < 4; inneri++) { // take float sized gulps endian
        for (var inneri = 3; inneri >= 0; inneri--) { // take float sized gulps other endian

            buffer_single_byte_sized[inneri] = input_data.buffer[index_int++];

            // if (index < 100) {

            //     console.log('raw ', index, inneri, buffer_single_byte_sized[inneri]);
            // }
        }

        // var view = new jDataView(buffer_single_byte_sized);
        var view = new jdataview(buffer_single_byte_sized);



        number_float = view.getFloat32(0);

        if (index < 100) {

            console.log(index, ' binary number_float ', number_float);
        }

        output_data.buffer[index_float++] = number_float;

    }
} //      write_8_bit_buffer_to_32_bit_output_file

// ---


function write_8_bit_buffer_to_16_bit_output_file(input_data, output_data) {

    // http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/

    var size_one_16_bit_in_bytes = Int16Array.BYTES_PER_ELEMENT;

    console.log("size_one_16_bit_in_bytes ", size_one_16_bit_in_bytes);

    var index_16bit_int = 0;
    var buffer_one_16_bit_value = new Buffer(size_one_16_bit_in_bytes); // holds single 16 bit value
    var number_16bit_int;

    var size_buff = input_data.buffer.length;
    var index_int = 0;

    console.log("size_buff ", size_buff);

    for (var index = 0; index < size_buff; index += size_one_16_bit_in_bytes) {
        // for (var index = 0; index < size_buff; index++) {

        // for (var inneri = 0; inneri < 4; inneri++) { // take float sized gulps endian
        // for (var inneri = 3; inneri >= 0; inneri--) {  // take float sized gulps other endian
        for (var inneri = (size_one_16_bit_in_bytes - 1); inneri >= 0; inneri--) { // take 16bit sized gulps other endian

            buffer_one_16_bit_value[inneri] = input_data.buffer[index_int++];

            // if (index < 100) {

            //     console.log('raw ', index, inneri, buffer_one_16_bit_value[inneri]);
            // }
        }

        // var view = new jDataView(buffer_one_16_bit_value);
        var view = new jdataview(buffer_one_16_bit_value);



        // number_16bit_int = view.getFloat32(0);
        // number_16bit_int = view.getUint16(0);
        number_16bit_int = view.getInt16(0);

        if (index < 100) {

            console.log(index, ' binary number_16bit_int ', number_16bit_int);
        }

        output_data.buffer[index_16bit_int++] = number_16bit_int;
    }
} //      write_8_bit_buffer_to_16_bit_output_file

// ---


function convert_8_bit_buffer_from_32_bit_float_to_16_bit_int(input_data, output_data) {

    // http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/

    var size_one_16_bit_in_bytes = Int16Array.BYTES_PER_ELEMENT;

    // Int16Array

    console.log("size_one_16_bit_in_bytes ", size_one_16_bit_in_bytes);

    console.log("size input_data ", input_data.buffer.length);
    console.log("size output_data ", output_data.buffer.length);

    var offset = 0;
    var index_float = 0;
    var buffer_single_byte_sized = new Buffer(4); // holds enough to populate a single float
    var number_float;

    // var buffer_single_16bit_sized = new Buffer(2);   // holds enough to populate a single 16 bit signed int

    var size_buff = input_data.buffer.length;
    var index_int = 0;

    console.log("size_buff ", size_buff);

    for (var index = 0; index < size_buff; index += 4) {
        // for (var index = 0; index < size_buff; index++) {

        // for (var inneri = 0; inneri < 4; inneri++) { // take float sized gulps endian
        for (var inneri = 3; inneri >= 0; inneri--) { // take float sized gulps other endian

            buffer_single_byte_sized[inneri] = input_data.buffer[index_int];

            if (index < 100) {

                console.log('rawrawraw ', index, inneri, buffer_single_byte_sized[inneri],
                    input_data.buffer[index_int]);
            }

            index_int++;
        }

        // var view = new jDataView(buffer_single_byte_sized);
        var view = new jdataview(buffer_single_byte_sized);

        number_float = view.getFloat32(0);


        // output_data.buffer[index_float++] = number_float;
        // output_data.buffer[index_float++] = number_float;

        // var same_value_in_16_bit_signed_int = number_float * (32768 - 1)
        var same_value_in_16_bit_signed_int = ~~ (number_float * (32768 - 1));

        if (index < 20) {

            console.log(index, ' binary number_float ', number_float, ' int ',
                same_value_in_16_bit_signed_int);
        }

        output_data.buffer.writeInt16LE(same_value_in_16_bit_signed_int, offset);
        offset += 2;
    }



    // write_json_serialized(big_binary_float);
    // write_buffer_to_file(big_binary_float);
    // write_buffer_to_file(output_data.buffer);


} //      convert_8_bit_buffer_from_32_bit_float_to_16_bit_int

// ---

function show_object_with_buffer(given_obj, given_label) {

    console.log("__________ show_object_with_buffer __________ top ", given_label);

    var count_num_rows_to_show = 10;

    for (var property in given_obj) {

        if ("buffer" == property) {

            // show_buffer(given_obj[property]);
            show_buffer(given_obj[property], given_obj[property].length, count_num_rows_to_show);
        }
    }

    console.log("__________ show_object_with_buffer __________ bottom ", given_label);
}

// ---

function convert_32bit_float_typed_array_into_4_bytes_ints_typed_array(input_32_bit_float_blob, output_ints_blob) {

    /*

        given binary data can be either int or float typed array,
        output will be Uint8Array which can be handles OK by web socket

    http://stackoverflow.com/questions/20925527/convert-float32array-to-16-bit-float-array-buffer-javascript

    */

    var curr_value;
    var inneri = 0;
    var index_int_from_float = 0;

    var one_float = new Float32Array(1);

    var one_float_in_four_bytes_int;
    var size_monster = input_32_bit_float_blob.buffer.length;

    console.log(' big data blog datatype ', output_ints_blob.datatype, " size_monster ", size_monster);

    for (var index = 0; index < size_monster; index++) {

        if (output_ints_blob.datatype == 'int') {

            // big_monster_data_int8[index] = Common_Utils.get_random_in_range_inclusive_int(0, 255);
            output_ints_blob.buffer[index] = Common_Utils.get_random_in_range_inclusive_int(0, 255);

        } else if (output_ints_blob.datatype == 'float') {

            // one_float[0] = Common_Utils.get_random_in_range_inclusive_float( -0.9999, 0.9999);
            one_float[0] = input_32_bit_float_blob.buffer[index];

            if (index < 20) {

                console.log(index, 'current float is ', one_float[0]);
            }

            one_float_in_four_bytes_int = new Uint8Array(one_float.buffer, 0, Float32Array.BYTES_PER_ELEMENT); // First float of fa.

            // console.log(index, ' this array size should be 4 ', one_float_in_four_bytes_int.length,
            //  ' originally value as a float ', one_float[0]);

            for (var inneri = 0; inneri < 4; inneri++, index_int_from_float++) {

                // console.log(inneri, ' int value ', one_float_in_four_bytes_int[inneri]);

                output_ints_blob.buffer[index_int_from_float] = one_float_in_four_bytes_int[inneri];

                if (index < 20) {

                    console.log("index_int_from_float ", output_ints_blob.buffer[index_int_from_float]);
                }
            }

            if (index_int_from_float % 20000 == 0) {

                console.log(index, ' currated sampled every 200 float value ', one_float[0]);
            }

        } else {

            var error_msg = 'ERROR - failed to find data type in output_ints_blob';
            console.log(error_msg);
            alert(error_msg);
            process.exit(5);
        }

        // if (index % 200000 == 0) {

        // console.log(index, ' value ', big_monster_data[index]);
        // }
    }
} //      convert_32bit_float_typed_array_into_4_bytes_ints_typed_array

// ---

function done_sending_binary() {

    console.log("COOooooollllLLLLL we are done sending binary to browser");
}

// ---

function send_answer_back_to_browser(audio_obj, given_socket_conn) {


    // https://stackoverflow.com/questions/9546437/how-send-arraybuffer-as-binary-via-websocket/11426037

    // https://www.npmjs.org/package/nodejs-websocket

    // javascript web socket receive binary data

    // https://www.adobe.com/devnet/html5/articles/real-time-data-exchange-in-html5-with-websockets.html

    given_socket_conn.sendText("nobody in here but us chickens");

    // ---

    var blob_8_bit_typed_array_for_socket = {}; // parent object for big data

    copy_properties_across_objects(audio_obj, blob_8_bit_typed_array_for_socket);

    blob_8_bit_typed_array_for_socket.datatype = 'float';

    blob_8_bit_typed_array_for_socket.size_buffer = audio_obj.buffer.length * Float32Array.BYTES_PER_ELEMENT;

    console.log("IN send_answer_back_to_browser blob_8_bit_typed_array_for_socket.size_buffer ",
        blob_8_bit_typed_array_for_socket.size_buffer);

    // blob_8_bit_typed_array_for_socket.buffer = new Uint8Array(audio_obj.buffer.length * Float32Array.BYTES_PER_ELEMENT);
    // blob_8_bit_typed_array_for_socket.buffer = new Uint8Array(blob_8_bit_typed_array_for_socket.size_buffer);

    // blob_8_bit_typed_array_for_socket.buffer = new Buffer(data_length / 2.0);// input buffer is 32 bit we want 16 bit so half it
    blob_8_bit_typed_array_for_socket.buffer = new Buffer(blob_8_bit_typed_array_for_socket.size_buffer); // input buffer is 32 bit we want 16 bit so half it

    // below gives :     TypeError: Object #<Uint8Array> has no method 'copy'
    // blob_8_bit_typed_array_for_socket.buffer = new Uint8Array(blob_8_bit_typed_array_for_socket.size_buffer);// input buffer is 32 bit we want 16 bit so half it


    // Uint8Array


    // convert_8_bit_buffer_from_32_bit_float_to_16_bit_int(blob_8_bit_typed_array_for_socket, audio_obj);
    // convert_8_bit_buffer_from_32_bit_float_to_16_bit_int(audio_obj, blob_8_bit_typed_array_for_socket);

    console.log("... calling     convert_32bit_float_typed_array_into_4_bytes_ints_typed_array");

    convert_32bit_float_typed_array_into_4_bytes_ints_typed_array(audio_obj, blob_8_bit_typed_array_for_socket);

    // bbb

    console.log("about to call write_wav from callback done genetic synth for today");

    show_object_with_buffer(blob_8_bit_typed_array_for_socket, "callbackanswertobrowser");

    // audio_obj.is_buffer_converted_to_ints = true;

    // --- now we need to convert 32 bit float typed array into array of 16 bit ints to output to WAV

    console.log("now we need to convert 32 bit float typed array into array of 16 bit ints to output to WAV");

    var output_16_bit_audio_obj = {};

    copy_properties_across_objects(audio_obj, output_16_bit_audio_obj);

    convert_32_bit_floats_into_16_bit_ints(audio_obj, output_16_bit_audio_obj);

    output_16_bit_audio_obj.filename = "/tmp/genetic_synth_01_output.wav";

    console.log("WARNING - stubbed out writing WAV output file");
    // write_wav(output_16_bit_audio_obj);

    console.log("AAAAAA bout to send binary from server to client browser");

    // bbb

    console.log("AAAAAA typeof buffer is ", typeof blob_8_bit_typed_array_for_socket.buffer);

    /*
    for (var property in blob_8_bit_typed_array_for_socket) {

        console.log("blob_8_bit_typed_array_for_socket property ", 
                property, "\t", blob_8_bit_typed_array_for_socket[property]);
    }
    */

    show_object_with_buffer(blob_8_bit_typed_array_for_socket, "about_to_send_to_browser");

    // blob_8_bit_typed_array_for_socket.size_buffer = blob_8_bit_typed_array_for_socket.buffer.length;

    var curr_msg = "size_buffer=" + blob_8_bit_typed_array_for_socket.buffer.length;

    console.log("curr_msg ", curr_msg);

    given_socket_conn.sendText(curr_msg);

    // var socket_writable_stream = given_socket_conn.beginBinary().end(blob_8_bit_typed_array_for_socket.buffer);
    // given_socket_conn.sendBytes(blob_8_bit_typed_array_for_socket.buffer);

    // given_socket_conn.binaryType = "arraybuffer";

    given_socket_conn.sendBinary(blob_8_bit_typed_array_for_socket.buffer, done_sending_binary);

    // given_socket_conn.send(blob_8_bit_typed_array_for_socket.buffer, done_sending_binary);

} //      send_answer_back_to_browser

function copy_properties_across_objects(input_obj, output_obj) {

    for (var property in input_obj) {

        output_obj[property] = input_obj[property];
    }
}

// bbb

function convert_8_bit_ints_into_32_bit_float(input_8_bit_ints_obj, output_32_bit_float_obj) {

    // convert Uint8Array into Float32Array

    console.log("HHHHHH size ", input_8_bit_ints_obj.buffer.length);

    var size_32_bit_float_buff = input_8_bit_ints_obj.buffer.length *
        Uint8Array.BYTES_PER_ELEMENT / Float32Array.BYTES_PER_ELEMENT;

    console.log("HHHHHH size_32_bit_float_buff ", size_32_bit_float_buff);

    output_32_bit_float_obj.buffer = new Float32Array(size_32_bit_float_buff);

    var one_float = new Buffer(4);
    var number_float;

    output_32_bit_float_obj.size_buffer = size_32_bit_float_buff;
    output_32_bit_float_obj.size = size_32_bit_float_buff;

    var size_8_bit_buff = input_8_bit_ints_obj.buffer.length;

    var index_32_bit_float = 0;

    for (var index = 0; index < size_8_bit_buff;) {

        // var four_byte_ints = new Uint8Array(4);

        // var four_byte_ints = new ArrayBuffer();

        // for (var index_int = 0; index_int < 4;) {   // big endian
        for (var index_int = 3; index_int >= 0;) { // little endian

            one_float[index_int] = input_8_bit_ints_obj.buffer[index];

            index++;
            index_int--;
        }

        // var one_float = new Float32Array(four_byte_ints); // ArrayBuffer

        // one_float = four_byte_ints;

        // var one_float = new Float32Array(four_byte_ints, 0, 4);
        // var one_float = new Float32Array(four_byte_ints);

        var view = new jdataview(one_float);

        number_float = view.getFloat32(0);


        // console.log("here is number_float ", number_float); //  is OK

        output_32_bit_float_obj.buffer[index_32_bit_float] = number_float;

        index_32_bit_float++;
    }
} //      convert_8_bit_ints_into_32_bit_float

// ---

function convert_32_bit_floats_into_16_bit_ints(input_32_bit_float_audio_obj, output_16_bit_audio_obj) {

    var size_32_bit_float_buff = input_32_bit_float_audio_obj.buffer.length;

    console.log("size 32 bit float ", size_32_bit_float_buff);

    var num_16_bit_chunks_per_32_bit_float = Float32Array.BYTES_PER_ELEMENT /
        Uint16Array.BYTES_PER_ELEMENT;

    console.log("num_16_bit_chunks_per_32_bit_float ", num_16_bit_chunks_per_32_bit_float);


    var size_16_bit_int_buff = size_32_bit_float_buff * num_16_bit_chunks_per_32_bit_float;

    console.log("size 16 bit ints ", size_16_bit_int_buff); //  is OK

    output_16_bit_audio_obj.buffer = new Buffer(size_16_bit_int_buff); // input buffer is 32 bit we want 16 bit so half it

    var one_float = new Float32Array(1);

    var one_float_in_2_16_bit_ints;
    var curr_float;
    var index_16_bit_ints = 0;

    var offset = 0;

    for (var index_float = 0; index_float < size_32_bit_float_buff; index_float++) {

        one_float[0] = input_32_bit_float_audio_obj.buffer[index_float];

        if (index_float < 20) {

            console.log("one_float ", one_float[0]); // is OK            
        }

        var same_value_in_16_bit_signed_int = ~~ (one_float[0] * (32768 - 1));

        if (index_float < 20) {

            console.log("same_value_in_16_bit_signed_int ", same_value_in_16_bit_signed_int);
        }

        // output_16_bit_audio_obj.buffer[index_16_bit_ints++] = one_float_in_two_16_bit_ints[index_16_bit];

        output_16_bit_audio_obj.buffer.writeInt16LE(same_value_in_16_bit_signed_int, offset);
        offset += num_16_bit_chunks_per_32_bit_float;
    }

    // process.exit(3);

} //      convert_32_bit_floats_into_16_bit_ints

function convert_8_bit_ints_into_16_bit_ints(input_8_bit_ints_obj, output_16_bit_ints_obj) {

    // convert Uint8Array into signed 16 bit ints

    var size_8_bit_buff = input_8_bit_ints_obj.buffer.length;

    // console.log("HHHHHH size ", input_8_bit_ints_obj.buffer.length);

    // var size_32_bit_float_buff = input_8_bit_ints_obj.buffer.length * 
    //                             Uint8Array.BYTES_PER_ELEMENT / Float32Array.BYTES_PER_ELEMENT;

    console.log("VVVVVVVVV .... size_8_bit_buff ", size_8_bit_buff);

    // var one_float = new Float32Array(1);

    output_16_bit_ints_obj.buffer = new Buffer(size_8_bit_buff / 2.0);
    // output_16_bit_ints_obj.buffer = new Int16Array(size_8_bit_buff / 2.0);

    var one_float = new Buffer(4);

    var number_one_16_bit_int;

    var offset = 0;

    for (var index = 0; index < size_8_bit_buff;) {

        // for (var index_int = 0; index_int < 4;) {   // big endian
        for (var index_int = 3; index_int >= 0;) { // little endian

            one_float[index_int] = input_8_bit_ints_obj.buffer[index];

            index++;
            index_int--;
        }

        var view = new jdataview(one_float);
        number_float = view.getFloat32(0);

        var same_value_in_16_bit_signed_int = ~~ (number_float * (32768 - 1)); // OK

        output_16_bit_ints_obj.buffer.writeInt16LE(same_value_in_16_bit_signed_int, offset); // OK works
        offset += 2; // OK works
    }

    output_16_bit_ints_obj.size_buffer = output_16_bit_ints_obj.buffer.length;
    output_16_bit_ints_obj.size = output_16_bit_ints_obj.buffer.length;

    console.log("output buffer size (offset) ", offset, " size_buffer ", output_16_bit_ints_obj.size_buffer);

} //      convert_8_bit_ints_into_16_bit_ints

// ---

function process_received_msg(audio_file_obj, given_socket_conn) {

    var given_flavor;

    if (typeof audio_file_obj.flavor == "undefined") {

        var err_msg = "ERROR - web socket did not see flavor property";
        console.log(err_msg);
        return;

    } else {

        given_flavor = audio_file_obj.flavor;
    }

    console.log("process_received_msg  seeing flavor ", given_flavor);

    switch (given_flavor) {

        case "genetic_synthesis":
            {

                console.log("... OK genetic_synthesis  ");

                for (var property in audio_file_obj) {

                    console.log("sssssss genetic_synthesis property ", property, audio_file_obj[property]);
                }

                console.log("commented out this for now ...");

                // gene_mach.genetic_main(audio_file_obj, given_socket_conn, send_answer_back_to_browser);

                break;
            }

        case "elephant_roar":
            {

                console.log("seeing elephant_roar RRRRRRRRRR");

                // ---

                var wav_input_filename = "/tmp/elephant_roar_synthesized_02_input.wav";
                var wav_output_filename = "/tmp/elephant_roar_synthesized_02_output.wav";

                var wav_file_input_obj = {}; // create stub object to which we attach .buffer

                wav_file_input_obj.filename = wav_input_filename;
                wav_file_input_obj.buffer = null;

                wav_file_input_obj.raw_buffer = new Buffer(0);

                console.log('pppprrreeeeeeee read input file ');

                read_file_into_buffer(wav_file_input_obj, parse_wav); // populates field : raw_buffer with file data

                console.log('PPPPPOOOOOOOOst read input file ');

                // ---

                for (var property in audio_file_obj) {

                    console.log("server side socket sees ", property, "\t", audio_file_obj[property]);
                }

                // --- received over socket is 8 bit ints - we need 16 bit ints for WAV format

                var output_16_bit_audio_obj = {};

                copy_properties_across_objects(audio_file_obj, output_16_bit_audio_obj);

                convert_8_bit_ints_into_16_bit_ints(audio_file_obj, output_16_bit_audio_obj);

                // ---

                output_16_bit_audio_obj.filename = wav_output_filename;

                // show_buffer(wav_file_obj.buffer, wav_file_obj.buffer.length, 100);

                console.log("WARNING - stubbed out writing output WAV file : " + output_16_bit_audio_obj.filename);
                // write_wav(output_16_bit_audio_obj);

                // ---

                break;
            }

            // --- default

            console.log("ERROR - failed to find matching flavor in process_received_msg");
            process.exit(1);

            break;
    }
} //      process_received_msg


var received_data_arraybuffer;

var count_num_connections = 0;

function socket_server() {

    // var chosen_port_listening = 80;     // change for nodejitsu
    var chosen_port_listening = 8801; // OK prior to nodejitsu
    // var chosen_port_listening = 8888;
    // var chosen_port_sending   = 8800;


    // var ws = require("nodejs-websocket");   // https://www.npmjs.org/package/nodejs-websocket


    var server = ws.createServer(function(connection_request) {

        var number_received_properties = 0;
        var element_token, element_value;
        count_num_connections++;

        var audio_file_obj = {}; // will pin up file properties like sample_rate

        console.log("New connection          monday 447   count_num_connections ",
            count_num_connections);

        var request_flavor;

        if (!is_origin_allowed(connection_request.origin)) {
            // Make sure we only accept requests from an allowed origin
            connection_request.reject();
            console.log((new Date()) + ' Connection from origin ' + connection_request.origin + ' rejected.');
            return;
        }


        connection_request.on("text", function(received_data) {

            console.log("Received text format : " + received_data);

            var list_text_elements = received_data.split("=");

            if (0 == list_text_elements.length) {

                console.log("ERROR - faild to find text with = to denote conn parms");

            } else {

                // console.log('cool saw = somewhere in this text msg');
            }

            console.log("length of list_text_elements ", list_text_elements.length);

            if (2 != list_text_elements.length) {

                var err_msg = "ERROR - malformed property - does NOT contain equal sign " + received_data;
                console.log(err_msg);
            }

            element_token = list_text_elements[0];
            element_value = list_text_elements[1];

            // console.log("here is list_text_elements ", list_text_elements);

            console.log("parm token  ", element_token, "parm value  ", element_value);

            connection_request.sendText(received_data.toUpperCase() +
                " was received on server side echo back");

            // ---

            // Received text format : frequency=8000
            // Received text format : sample_rate=44100
            // Received text format : bit_depth=16
            // Received text format : num_channels=1
            // Received text format : duration=0.00014512471655328798
            // Received text format : size=51200

            // audio_file_obj.list_text_elements[0] = list_text_elements[1];
            // audio_file_obj[list_text_elements[0]] = list_text_elements[1];
            audio_file_obj[element_token] = element_value;

            // ---  manifest_count

            if (element_token == "manifest_count") {

                number_received_properties = Object.keys(audio_file_obj).length;

                console.log("COOL seeing manifest_count of ", element_value);
                console.log("Object.keys(audio_file_obj).length  ", number_received_properties);

                if (element_value != number_received_properties) {

                    var err_msg = "ERROR - number of TEXT properties received " +
                        number_received_properties +
                        " fails to match value of manifest_count " + element_value;
                    console.log(err_msg);
                    return;
                }

                // --- OK all properties received and accounted for in manifest 

                console.log("OK all properties received and accounted for in manifest");

                process_received_msg(audio_file_obj, connection_request);
            }
        });


        // http://granular.cs.umu.se/browserphysics/?p=865


        // I booked ticket asking for advice on how to handle binary data
        // https://github.com/sitegui/nodejs-websocket/issues/4
        /*
        connection_request.on("binary", function (received_data) {

            console.log("Received binary format of length ", received_data.length);

            //Object #<Connection> no method 'sendBytes'
            // connection_request.sendBytes(received_data.binaryData);


            // if (received_data.data instanceof ArrayBuffer) {
            if (received_data instanceof ArrayBuffer) {

                console.log("rokk on seeing instanceof ArrayBuffer");

            } else {

                console.log("did NOT recognize data as instanceof ArrayBuffer");                
            }


            received_data_arraybuffer = received_data;

            for (var index = 0; index < 10; index++) {

                console.log("binary ", index, received_data_arraybuffer[index]);
            }

            // connection_request.sendText(received_data.toUpperCase()+"!!!");
            connection_request.sendText("OK server nodejs receieved the binary data !!!");
        });
*/

        // https://github.com/guilhermef

        // below binary callback was given as answer to question I posted 
        //    at github sitegui nodejs-websocket - April 8 2014
        // https://github.com/sitegui/nodejs-websocket/issues/4

        // https://github.com/sitegui/nodejs-websocket/issues/5

        // stens TODO - this works OK for int typed arrays following callback is attempt for floats
        // Listen for binary event
        connection_request.on("binary", function(inStream) {

            // Collect all the data in a buffer
            var data = new Buffer(0);

            // Get all frames of binary data and add to the buffer
            inStream.on("readable", function() {

                var newData = inStream.read();

                if (newData) {

                    console.log('WWWWWWWWW  websocket binary newData length this callback cycle is ',
                        newData.length);

                    data = Buffer.concat([data, newData], data.length + newData.length)
                }
            });

            // Done, process the big data
            inStream.on("end", function() {

                console.log("now doing binary end callback");

                audio_file_obj.buffer = data;

                process_received_msg(audio_file_obj);

                console.log("WARNING - stubbed out for now");

                // genetic_synthesis

                // process_my_data(data);   // stens TODO put this back its OK

            });
        });

        connection_request.on("close", function(code, reason) {
            console.log("Connection closed");
        });

    }).listen(chosen_port_listening);

    // console.log('chosen_port_listening ', chosen_port_listening);

}; //      socket_server

// ---

//a helper function to handle HTTP requests
function requestHandler(req, res) {

    console.log("------------- TOP requestHandler -----------------");

    console.log('   __dirname   ', __dirname);


    // var localFolder = __dirname + '/public/';
    var localFolder = __dirname + '/';
    // var localFolder = __dirname + '/../';

    console.log('localFolder ', localFolder);

    console.log('req.url ', req.url);

    /*
    var fileName;
    if (req.url == "/") {

        // fileName = path.join(req.url + 'combo.html');
        fileName = "combo.html";

    } else {

        // fileName = path.join(req.url);
        fileName = req.url;
    }
*/
    // var fileName = (req.url == "/") ? "src/combo.html" : req.url;
    var fileName = (req.url == "/") ? "combo.html" : req.url;

    console.log('fileName ', fileName);


    // var fileName = path.basename(req.url) || 'index.html';
    // var fileName = req.url || 'combo.html';
    // var fileName = path.basename(req.url) || 'combo.html';


    var full_path_file = path.join(localFolder, fileName);
    // var full_path_file = fileName;

    console.log('full_path_file ', full_path_file);


    var page404 = localFolder + '404.html'; // stens TODO - deal with using something for this file

    //call our helper function
    //pass in the path to the file we want,
    //the response object, and the 404 page path
    //in case the requestd file is not found
    // getFile((localFolder + fileName),res,page404);
    getFile(full_path_file, res, page404);
};

// ---

socket_server();

// ---

// httpd.createServer(requestHandler).listen(8888); // OK pre appfog
// https://stackoverflow.com/questions/16573668/best-practices-when-running-node-js-with-port-80-ubuntu-linode


console.log("process.env.HOSTING_VENDOR ", process.env.HOSTING_VENDOR);
console.log("process.env.NODE_ENV ", process.env.NODE_ENV);
console.log("process.env.SUBDOMAIN ", process.env.SUBDOMAIN);
console.log("process.env.PORT ", process.env.PORT);

console.log("version: 0.0.47   ");

var serviceUrl;
var servicePort;

if (process.env.HOSTING_VENDOR == "heroku") {

    serviceUrl = "http://gentle-cliffs-8200.herokuapp.com:";
    // http://gentle-cliffs-8200.herokuapp.com

    servicePort = process.env.PORT || 3000;
    // servicePort = 80;

} else if (process.env.NODE_ENV == "production" && process.env.SUBDOMAIN == "webgl-3d-animation") {

    serviceUrl = "http://webgl-3d-animation.jit.su:"; //   http://webgl-3d-animation.jit.su/

    // servicePort = 80;

    servicePort = process.env.PORT || 3000;

} else {

    serviceUrl = "http://localhost:";
    servicePort = 8888;
};

console.log("\nPoint your browser at \n\n\t\t", serviceUrl + servicePort, "\n");

httpd.createServer(requestHandler).listen(servicePort, null);