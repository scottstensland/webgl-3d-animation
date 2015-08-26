
var ui_logic_handler = function() {

"use strict";

function handleClick(flavor_checkbox, cb) {

	webgl_3d_animation.ui_events_entry_point(flavor_checkbox, cb.checked);
}


// function handleClick(flavor_checkbox) {

// 	webgl_3d_animation.ui_events_entry_point(flavor_checkbox);
// }

function is_checked(given_id) {

	return document.getElementById(given_id).checked;

}
return {

    handleClick: handleClick,
    is_checked : is_checked
};

}();        //      ui_logic_handler

