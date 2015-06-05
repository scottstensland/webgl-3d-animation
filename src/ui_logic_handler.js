
var ui_logic_handler = function() {

"use strict";

function handleClick(flavor_checkbox, cb) {

	webgl_3d_animation.ui_events_entry_point(flavor_checkbox, cb.checked);
}


return {

    handleClick: handleClick
};

}();        //      ui_logic_handler

