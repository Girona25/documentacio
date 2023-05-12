// Keyboard management for the buttons

const KEYBOARD_SHORTCUTS = {
  // {Key : {down: callback, up: callback, description: "My description ;-p"]}
  // {Key : "alias"} → example: {a: "ArrowLeft"}
  ArrowUp: {
    down        : keyboard_start_move.bind(null, 'ArrowUp'),
    up          : keyboard_stop_move.bind(null, 'ArrowUp'),
    description : "Mou el submarí cap endevant",
  },
  ArrowLeft: {
    down        : keyboard_start_move.bind(null, 'ArrowLeft'),
    up          : keyboard_stop_move.bind(null, 'ArrowLeft'),
    description : "Rota el submarí ↺ sobre si mateix",
  },
  ArrowDown: {
    down        : keyboard_start_move.bind(null, 'ArrowDown'),
    up          : keyboard_stop_move.bind(null, 'ArrowDown'),
    description : "Mou el submarí cap endarrera",
  },
  ArrowRight: {
    down        : keyboard_start_move.bind(null, 'ArrowRight'),
    up          : keyboard_stop_move.bind(null, 'ArrowRight'),
    description : "Rota el submarí ↻ sobre si mateix",
  },
  w: {
    down        : (() => { emerge(); }),
    up          : (() => { stop(); }),
    description : "Mou el submarí cap amunt",
  },
  a: {
    down        : (() => { left(); }),
    up          : (() => { stop(); }),
    description : "Mou el submarí cap a l'esquerra",
  },
  s: {
    down        : (() => { immerse(); }),
    up          : (() => { stop(); }),
    description : "Mou el submarí cap avall",
  },
  d: {
    down        : (() => { right(); }),
    up          : (() => { stop(); }),
    description : "Mou el submarí cap a la dreta",
  },
  x: {
    down        : keyboard_kill,
    description : "Força l'aturada de tots els events",
  },
  f: {
    up          : (() => { follow(); }),
    description : "Activa/desactiva el mode de seguiment",
  },
  z: {
    up          : (() => { depth_hold(); }),
    description : "Activa/desactiva mantenir la profunditat",
  },
  v: {
    up          : (() => { stream(); }),
    description : "Activa/desactiva el video en directe",
  },
  e: {
    up          : (() => { stream_screenshot(); }),
    description : "Guarda una captura del directe",
  },
  q: {
    up          : (() => { stream_video(); }),
    description : "Guarda un vídeo del directe",
  },
  l: {
    up          : (() => { light(); }),
    description : "Activa/desactiva les llums",
  },
  c: {
    up          : (() => { velocitat(); }),
    description : "Canvia la velocitat del robot",
  },
  h: {
    down        : (() => { ui_help(); }),
    up          : (() => { ui_help_hide(); }),
    description : "Mostra el missatge d'ajuda",
  },
};

window._keyboard_down = {}; // Currently pressed keys

function keyboard_install() {
  document.body.addEventListener('keydown', keyboard_handle_down);
  document.body.addEventListener('keyup', keyboard_handle_up);
}

function keyboard_disable() {
  document.body.removeEventListener('keydown', keyboard_handle_down);
  document.body.removeEventListener('keyup', keyboard_handle_up);
}

function keyboard_kill() {
  // Force to stop any active action
  for (const [key, down] of Object.entries(_keyboard_down))
    if (down)
      keyboard_handle_up({key: key});
}

function keyboard_descriptions() {
  // Returns [[keys], "description"]
  // Example: [["←", "a", "A"], "Move to the left"]
  function translate_key(k) {
    // Change some key names.
    if (k == "ArrowUp")    return '↑';
    if (k == "ArrowLeft")  return '←';
    if (k == "ArrowDown")  return '↓';
    if (k == "ArrowRight") return '→';
    return k;
  }

  // GroupBy description
  let desc;
  let keys_by_desc = {} // {"description": ["key1", "key2"]}
  for (const key of Object.keys(KEYBOARD_SHORTCUTS)) {
    desc = (key_to_action(key)||{}).description;
    if (!keys_by_desc[desc])
      keys_by_desc[desc] = [];
    keys_by_desc[desc].push(translate_key(key));
  }

  // Create result format
  let res = [];
  for (const [desc, keys] of Object.entries(keys_by_desc))
    res.push([keys, desc]);

  return res;
}

function key_to_action(key) {
  // Returns {up: callback, down: callback, description: "arst"} or null
  const kval = KEYBOARD_SHORTCUTS[key];
  if (! kval)
    return null;
  if (typeof kval === 'string')
    return key_to_action(kval);
  return kval;
}

function keyboard_handle_down(event) {
  const key    = event.key;
  const action = key_to_action(key);
  if (! action || event.repeat) // Is the key for us?
    return;
  window._keyboard_down[key] = true;
  setTimeout(action.down || function(){}, 0); // Do action
}

function keyboard_handle_up(event) {
  const key    = event.key;
  const action = key_to_action(key);
  if (! action) // Is the key for us?
    return;
  window._keyboard_down[key] = false;
  setTimeout(action.up || function(){}, 0); // Do action
}

function keyboard_start_move(direction) {
  // Direction must be in ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"]
  if (direction == "ArrowUp") {
    if (window._keyboard_down["ArrowLeft"])
      move_forward(0.2 * velocitat, 0.5 * velocitat);
    else if (window._keyboard_down["ArrowRight"])
      move_forward(0.5 * velocitat, 0.2 * velocitat);
    else if (window._keyboard_down["ArrowDown"])
      return;
    else
      move_forward(0.4 * velocitat, 0.4 * velocitat);
  } else if (direction == "ArrowDown") {
    if (window._keyboard_down["ArrowLeft"])
      move_backward(0.2 * velocitat, 0.5 * velocitat);
    else if (window._keyboard_down["ArrowRight"])
      move_backward(0.5 * velocitat, 0.2 * velocitat);
    else if (window._keyboard_down["ArrowUp"])
      return;
    else
      move_backward(0.4 * velocitat, 0.4 * velocitat);
  } else if (direction == "ArrowLeft") {
    if (window._keyboard_down["ArrowUp"])
      move_forward(0.2 * velocitat, 0.5 * velocitat);
    else if (window._keyboard_down["ArrowDown"])
      move_backward(0.2 * velocitat, 0.5 * velocitat);
    else if (window._keyboard_down["ArrowRight"])
      return;
    else
      turn_left();
  } else if (direction == "ArrowRight") {
    if (window._keyboard_down["ArrowUp"])
      move_forward(0.5 * velocitat, 0.2 * velocitat);
    else if (window._keyboard_down["ArrowDown"])
      move_backward(0.5 * velocitat, 0.2 * velocitat);
    else if (window._keyboard_down["ArrowLeft"])
      return;
    else
      turn_right();
  }
}

function keyboard_stop_move(direction) {
  // Direction must be in ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"]
  if (window._keyboard_down['ArrowUp']
      || window._keyboard_down['ArrowLeft']
      || window._keyboard_down['ArrowDown']
      || window._keyboard_down['ArrowRight'])
    keyboard_start_move(direction);
  else
    stop();
}
