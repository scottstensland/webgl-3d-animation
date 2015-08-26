
var render_to_texture_obj = function() {

// ---

var object_handle = {}; // holds all the various flavors of graphic object types

var animals_render_to_texture  = "animals_render_to_texture";

object_handle[animals_render_to_texture] = {};

var all_object_labels = [];

all_object_labels.push(animals_render_to_texture);

// ------------

var SIZE_DIM_3D = 3;
var NUM_ITEMS = 24;

function init_buffers(gl) {

  object_handle[animals_render_to_texture].vertex_position_buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_render_to_texture].vertex_position_buffer);

  var vertices = [

  // Front face
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,

  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0, -1.0, -1.0,

  // Top face
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0, -1.0,

  // Bottom face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,

  // Right face
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0,  1.0,  1.0,
   1.0, -1.0,  1.0,

  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0

  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  object_handle[animals_render_to_texture].vertex_position_buffer.itemSize = 3;
  object_handle[animals_render_to_texture].vertex_position_buffer.numItems = 24;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  object_handle[animals_render_to_texture].vertex_texture_coord_buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, object_handle[animals_render_to_texture].vertex_texture_coord_buffer);

  var textureCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

  object_handle[animals_render_to_texture].vertex_texture_coord_buffer.itemSize = 2;
  object_handle[animals_render_to_texture].vertex_texture_coord_buffer.numItems = 24;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  object_handle[animals_render_to_texture].vertex_index_buffer = gl.createBuffer();

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object_handle[animals_render_to_texture].vertex_index_buffer);

  var cubeVertexIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);

  object_handle[animals_render_to_texture].vertex_index_buffer.itemSize = 1;
  object_handle[animals_render_to_texture].vertex_index_buffer.numItems = 36;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

function setupTextureFilteringAndMips(gl, width, height) {

// this fixes error :
// [WebGLRenderingContext]RENDER WARNING: texture bound to texture unit 0 is not renderable. 
// It maybe non-power-of-2 and have incompatible texture filtering or is not 'texture complete'
// https://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load

  if (isPowerOf2(width) && isPowerOf2(height)) {
    // the dimensions are power of 2 so generate mips and turn on 
    // tri-linear filtering.
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  } else {
    // at least one of the dimensions is not a power of 2 so set the filtering
    // so WebGL will render it.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
}

function handleLoadedTexture(gl, texture) {

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

    setupTextureFilteringAndMips(gl, texture.image.width, texture.image.height);
}

function init_texture(gl) {

  object_handle[animals_render_to_texture].texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, object_handle[animals_render_to_texture].texture);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([255, 0, 0, 255])); // red

  object_handle[animals_render_to_texture].texture.image = new Image();

  object_handle[animals_render_to_texture].texture.image.onload = function () {

      handleLoadedTexture(gl, object_handle[animals_render_to_texture].texture);
  };

  // object_handle[animals_render_to_texture].texture.image.src = "nehe.gif";
  // object_handle[animals_render_to_texture].texture.image.src = "lawn_backyard_south_new_berlin.jpg";
  object_handle[animals_render_to_texture].texture.image.src = "157.jpg";

}

function init(gl) {

    init_buffers(gl);
    init_texture(gl);

    // ----------------------

}       //      init

var get_object_handle = function() {

    return object_handle;
};

var get_all_object_labels = function() {

    return all_object_labels;
};

return {    // to make visible to calling reference frame list function here

    init                  : init,
    get_object_handle     : get_object_handle,
    get_all_object_labels : get_all_object_labels
};

}();    //  render_to_texture_obj = function() 


