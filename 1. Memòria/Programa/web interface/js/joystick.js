// class Joystick


function Joystick(elem, callback) {
  // Elem must be a canvas.
  // callback(rel_x, rel_y) {...}

  if (this === window)
    return new Joystick(elem, callback);

  this.callback = callback || function(){};
  this.canvas = elem;
  this.ctx    = null;
  this.width  = 0;
  this.height = 0;
  this.radius = 100;
  this.off_x  = 0;
  this.off_y  = 0;
  this.x_org  = 0;
  this.y_org  = 0;
  this.x      = 0;
  this.y      = 0;
  this.paint = false;

  this.colors = {
    // Default colors. If you wanna change these on runtime, use:
    //                 Joystick.set_background and Joystick.set_foreground
    bg: '#CCCCCC',
    fg: '#22AA22',
    fr: '#22AA2280', // foreground radius
  };
  this.fr_radius = 10; // foreground radius radius in px
  this.bg_radius_extra = 40;
  this.joy_size = 1; // Multiply (zoom) the joystick size. Bigger → Bigger dot

  this.zoom = 4; // Reversed zoom (higher values means smaller)

  this.setup();
}

Joystick.prototype.set_callback = function(callback) {
  // Set/change callback function.
  this.callback = callback;
  return this;
};

Joystick.prototype.set_background = function(bgcolor) {
  // Set the background color.
  this.colors.bg = bgcolor;
  this.draw();
  return this;
};

Joystick.prototype.set_foreground = function(fgcolor, fgradius) {
  // Set the background color.
  this.colors.fg = fgcolor;
  this.colors.fr = fgradius || fgcolor + '80';
  this.draw();
  return this;
};

Joystick.prototype.set_background_radius = function(r_extra) {
  // Set extra radius in pixels for the background.
  this.bg_radius_extra = r_extra;
  this.draw();
  return this;
};

Joystick.prototype.set_joystick_size = function(level) {
  // Set joystick zoom size. Bigger → Bigger dot
  this.joy_size = level;
  this.draw();
  return this;
};

Joystick.prototype.set_zoom = function(level) {
  // Set zoom level, bigger values → bigger joystick.
  this.zoom = 1/(level/4);
  this.resize();
  return this;
};

Joystick.prototype.setup = function() {
  // Setup canvas and events.
  this.ctx = this.canvas.getContext('2d');
  this.resize();

  this.canvas.addEventListener('mousedown', this.start_drawing.bind(this));
  document.addEventListener('mouseup', this.stop_drawing.bind(this));
  document.addEventListener('mousemove', this.move.bind(this));

  this.canvas.addEventListener('touchstart', this.start_drawing.bind(this));
  document.addEventListener('touchend', this.stop_drawing.bind(this));
  document.addEventListener('touchcancel', this.stop_drawing.bind(this));
  document.addEventListener('touchmove', this.move.bind(this));
  window.addEventListener('resize', this.resize.bind(this));
};

Joystick.prototype.launch_callback = function() {
  const rel = this.get_relative();
  this.callback(rel.x, rel.y);
};

Joystick.prototype.resize = function() {
  // Resize joystick.
  const size = this._get_elem_size(this.canvas);
  this.width  = size.width;
  this.height = size.height;
  this.off_x  = size.x;
  this.off_y  = size.y;
  this.ctx.canvas.width  = this.width;
  this.ctx.canvas.height = this.height;
  this.radius = Math.min(this.width, this.height) / this.zoom;
  this.x_org = this.width / 2;
  this.y_org = this.height / 2;
  this.goto_center();
};

Joystick.prototype.background = function() {
  // Draw the background
  this.ctx.beginPath();
  this.ctx.arc(this.x_org, this.y_org, this.radius + this.bg_radius_extra, 0, Math.PI * 2, true);
  this.ctx.fillStyle = this.colors.bg;
  this.ctx.fill();
};

Joystick.prototype.joystick = function(width, height) {
  this.ctx.beginPath();
  this.ctx.arc(width, height, this.radius * this.joy_size, 0, Math.PI * 2, true);
  this.ctx.fillStyle = this.colors.fg;
  this.ctx.fill();
  this.ctx.strokeStyle = this.colors.fr;
  this.ctx.lineWidth = this.fr_radius;
  this.ctx.stroke();
};

Joystick.prototype.get_position = function(event) {
  // Calculate position from event.
  const mouse_x = event.clientX || event.touches[0].clientX;
  const mouse_y = event.clientY || event.touches[0].clientY;
  this.x = mouse_x - this.off_x;
  this.y = mouse_y - this.off_y;
};

Joystick.prototype.get_relative = function() {
  // Returns {x: 0 ↔ 1, y: 0 ↔ 1} in the plane - ↑→ +
  let x = (this.x - this.x_org) / (this.width / 2);
  let y = - (this.y - this.y_org) / (this.height / 2);
  return {
    x: x > 0 ? Math.min(1, x) : Math.max(-1, x),
    y: y > 0 ? Math.min(1, y) : Math.max(-1, y),
  };
};

Joystick.prototype.in_circle = function() {
  // Return wheather the mouse pointer is in the circle or not.
  const current_radius = Math.sqrt(Math.pow(this.x - this.x_org, 2)
                                 + Math.pow(this.y - this.y_org, 2));
  return (this.radius >= current_radius);
};

Joystick.prototype.goto_center = function() {
  this.x = this.width / 2;
  this.y = this.height / 2;
  this.draw();
};

Joystick.prototype.start_drawing = function(event) {
  // Start drawing the joystick move.
  this.paint = true;
  this.get_position(event);
  if (this.in_circle()) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.background();
    this.joystick(this.x, this.y);
    this.draw();
  }
};

Joystick.prototype.stop_drawing = function() {
  // Stop drawing the joystick move.
  if (this.paint) {
    this.goto_center();
  }
  this.paint = false;
  window.stop();
}

Joystick.prototype.move = function(event) {
  // Process the mouse pointer movement.
  if (!this.paint)
    return;
  this.get_position(event);
  this.draw();
  this.launch_callback();
};

Joystick.prototype.draw = function() {
  // Draw the joystick.
  this.ctx.clearRect(0, 0, this.width, this.height);
  this.background();
  const angle = Math.atan2((this.y - this.y_org), (this.x - this.x_org));

  if (this.in_circle())
    this.joystick(this.x, this.y);
  else {
    let x = this.radius * Math.cos(angle) + this.x_org;
    let y = this.radius * Math.sin(angle) + this.y_org;
    this.joystick(x, y);
  }
};

Joystick.prototype._get_elem_size = function(elem) {
  // Get an element size.
  // Returns DOMRect { x: 0, y: 0, width: 1920, height: 1080, top: 0, right: 1920, bottom: 0, left: 0 }
  return elem.getBoundingClientRect();
};



