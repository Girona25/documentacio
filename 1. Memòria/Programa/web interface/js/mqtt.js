// class MQTT


function MQTT(host, port, log, error) {
  if (this === window)
    return new MQTT(host, log, error);

  if (!host || !port)
    throw "MQTT: Invalid host";

  this._host  = host;
  this._port  = port;
  this.error  = error || alert;
  this.log    = log   || console.log;
  this.client = null;

  this.callback = function(){};
  this.on_connect_callback = function(){};
}

// Constants
MQTT.TIMEOUT = 30;
MQTT.TIMEOUT = 2; // WARNING: DEBUG

// Getters

MQTT.prototype = {
  get host() {
    return this._host;
  },
  set host(x) {
    throw "Can't change host after instanciating MQTT";
  }
};

// Methods

MQTT.prototype.send = function(topic, action, callback) {
  this.set_callback(callback);
  message = new Paho.MQTT.Message(action);
  message.destinationName = topic;
  this.client.send(message);
};

MQTT.prototype.set_callback = function(callback) {
  // Callback for any message
  this.callback = callback || function(){};
  return this;
};

MQTT.prototype.on_message = function(callback) {
  // Callback for any message
  return this.set_callback(callback);
};

MQTT.prototype.on_connect = function(callback) {
  this.on_connect_callback = callback || function(){};
  return this;
};

MQTT.prototype.connect = function() {
  console.log("new Paho.MQTT.Client(",this._host, ",",this._port,', "App")');
    this.client = new Paho.MQTT.Client(this._host, this._port, "App");
    //console.log(this._host);
  this.client.onMessageArrived = this.new_message.bind(this);
  this.client.onConnectionLost = this.connection_lost.bind(this);
  this.client.connect({
    onSuccess: this.connected.bind(this),
    onFailure: this.fail.bind(this),
    timeout: MQTT.TIMEOUT,
  });
};

MQTT.prototype.new_message = function(payload) {
  let msg = message.payloadString;
  this.log(msg);
  this.callback(msg);
};

MQTT.prototype.connection_lost = function(payload) {
  this.error("Connection lost: " + payload.errorMessage);
};

MQTT.prototype.fail = function(payload) {
  this.error("Failed comunication: " + payload.errorMessage);
};

MQTT.prototype.connected = function() {
  this.client.subscribe(TOPICS[0]);
  this.client.subscribe(TOPICS[1]);
  this.client.subscribe(TOPICS[2]);
  this.client.subscribe(TOPICS[3]);
  this.client.subscribe(TOPICS[4]);
  this.client.subscribe(TOPICS[5]);
  this.client.subscribe(TOPICS[6]);
  this.client.subscribe(TOPICS[7]);
  this.client.onMessageArrived = onMessageArrived;
  this.log("Connected succesfully");
  this.on_connect_callback();
};
