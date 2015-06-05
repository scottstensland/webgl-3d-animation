
var persistance_handler = function() {

"use strict";



var object_handle = {}; // holds all the various flavors of graphic object types

var animals_persistance  = "animals_persistance";

object_handle[animals_persistance] = {};

var all_object_labels = [];

all_object_labels.push(animals_persistance);


// ----------------------------------------


var get_object_handle = function() {

    return object_handle;
}

var get_all_object_labels = function() {

    return all_object_labels;
}


// function entry_point(flavor_checkbox, cb) {
function entry_point() {

	// webgl_3d_animation.ui_events_entry_point(flavor_checkbox, cb.checked);

	console.log("Hello Corinde in mongo db land");
}


return {

    entry_point: entry_point,
    get_object_handle     : get_object_handle,
    get_all_object_labels : get_all_object_labels

};

}();        //      persistance_handler




