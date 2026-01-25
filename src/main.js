// src/main.js
import { internal_webGLStart, set_camera_perspectives, update_activity_status } from './webgl_3d_animation.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Start the WebGL application
  internal_webGLStart();

  // Set up event listener for reset perspective button
  const resetButton = document.getElementById('reset-perspective');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      set_camera_perspectives();
    });
  }

  // Set up event listeners for control checkboxes
  const checkboxes = document.querySelectorAll('[data-control]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
      const control = event.target.getAttribute('data-control');
      console.log(`Control toggled: ${control}, checked: ${event.target.checked}`);
      update_activity_status(control, event.target.checked);
    });
  });
});
