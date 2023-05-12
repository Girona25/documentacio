
var mqtt;
let angle=0;
var reconnectTimeout = 2000;
//window.host = "169.254.10.125";
var port = 9001;
window.TOPICS = ["Server", "Motors", "Camera", "Follow", "Stream", "Sensors", "Light", "Aigua"];
var username = 'Java';
var password = 'Script';

function sub_mqtt_msg(callback, error) {
  callback = callback || function(){};
  error    = error    || message;

  function onConnect() {
    callback();
    client.subscribe(TOPICS[0]);
    client.subscribe(TOPICS[1]);
    client.subscribe(TOPICS[2]);
    client.subscribe(TOPICS[3]);
    client.subscribe(TOPICS[4]);
    client.subscribe(TOPICS[5]);
    client.subscribe(TOPICS[6]);
    client.subscribe(TOPICS[7]);
    message("Waiting for " + TOPICS[0]);
  }

  // Send an MQTT message
  client = new Paho.MQTT.Client(window.mqtt.host, port, "C");
  client.onMessageArrived = onMessageArrived;
  client.onConnectionLost = error.bind(null, "Connection lost :v");
  client.connect({onSuccess:onConnect});

  
  document.getElementById("estat").innerText = "Trying to connect...";
  
}
let prof = 0;
function onMessageArrived(message) {
  let topic = message.destinationName;
  let result = message.payloadString.split(",");
  if (topic == "Sensors"){
    //ROLL
    const rotated=document.getElementById('imageroll');
    let rotateROLL = parseInt(result[0].slice(1));
    rotated.setAttribute("style", "transform: rotate(" + rotateROLL + "deg)");
    //PITCH
    const rotatedp=document.getElementById('imagepitch');
    let rotatePITCH = parseInt(result[1]);
    rotatedp.setAttribute("style", "transform: rotate(" + rotatePITCH + "deg)");
    //BRUIXOLA
    const rotatedb=document.getElementById('imagebruix');
    let rotateBRUIX = parseInt(result[2]);
    rotatedb.setAttribute("style", "transform: rotate(" + rotateBRUIX + "deg)");
    //TEMPERATURA
    let temperatura = parseInt(result[3]);
    document.getElementById('temp').innerHTML = temperatura ;
    //PROFUNDITAT
    let profunditat = parseFloat(result[4]);
    prof = profunditat;
    document.getElementById('deep').innerHTML = profunditat ;
    //BATERIA
    let bateria = parseInt(result[5]);
    document.getElementById('Nbat').innerHTML = bateria;
  if (bateria==0){
    document.getElementById('imageB0').style.visibility = "visible";
    document.getElementById('imageB25').style.visibility = "hidden";
    document.getElementById('imageB50').style.visibility = "hidden";
    document.getElementById('imageB75').style.visibility = "hidden";
    document.getElementById('imageB100').style.visibility = "hidden";
  }
  if (bateria>=1 && bateria<=25){
    document.getElementById('imageB25').style.visibility = "visible";
    document.getElementById('imageB0').style.visibility = "hidden";
    document.getElementById('imageB50').style.visibility = "hidden";
    document.getElementById('imageB75').style.visibility = "hidden";
    document.getElementById('imageB100').style.visibility = "hidden";
  }
  if (bateria>=26 && bateria<=50){
    document.getElementById('imageB50').style.visibility = "visible";
    document.getElementById('imageB0').style.visibility = "hidden";
    document.getElementById('imageB25').style.visibility = "hidden";
    document.getElementById('imageB75').style.visibility = "hidden";
    document.getElementById('imageB100').style.visibility = "hidden";
  }
  if (bateria>=51 && bateria<=75){
    document.getElementById('imageB75').style.visibility = "visible";
    document.getElementById('imageB0').style.visibility = "hidden";
    document.getElementById('imageB25').style.visibility = "hidden";
    document.getElementById('imageB50').style.visibility = "hidden";
    document.getElementById('imageB100').style.visibility = "hidden";
  }
  if (bateria>=76 && bateria<=100){
    document.getElementById('imageB100').style.visibility = "visible";
    document.getElementById('imageB0').style.visibility = "hidden";
    document.getElementById('imageB25').style.visibility = "hidden";
    document.getElementById('imageB50').style.visibility = "hidden";
    document.getElementById('imageB75').style.visibility = "hidden";
  }
  }
  if (topic == "Aigua"){
    window.alert("S'ha detectat aigua dins el GIRONA 25!");
  }
}

// Movement actions

function emerge() {
    let action = "up";
    let speed = 0.2 * velocitat;
    const msg = JSON.stringify([action, speed, speed]);
    window.mqtt.send(TOPICS[1],msg); 
}

function immerse() {
    let action = "dwn";
    let speed = 0.2 * velocitat;
    const msg = JSON.stringify([action, speed, speed]);
    window.mqtt.send(TOPICS[1],msg); 
}
function left() {
  let action = "lleft";
  let speed = 0.4 * velocitat;
  const msg = JSON.stringify([action, speed, speed]);
  window.mqtt.send(TOPICS[1],msg); 
}

function right() {
  let action = "lright";
  let speed = 0.4 * velocitat;
  const msg = JSON.stringify([action, speed, speed]);
  window.mqtt.send(TOPICS[1],msg); 
}

function move_forward(speed_left, speed_right) {
    let action = "fwd";
    const msg = JSON.stringify([action, speed_left, speed_right]);
    window.mqtt.send(TOPICS[1],msg); 
}

function move_backward(speed_left, speed_right) {
    let action = "bkd";
    const msg = JSON.stringify([action, speed_left, speed_right]);
    window.mqtt.send(TOPICS[1],msg); 
}

function turn_left() {
    let action = "left";
    let speed = 0.2 * velocitat;
    const msg = JSON.stringify([action, speed]);
    window.mqtt.send(TOPICS[1],msg); 
}

function turn_right() {
    let action = "right";
    let speed = 0.2 * velocitat;
    const msg = JSON.stringify([action, speed]);
    window.mqtt.send(TOPICS[1],msg); 
}

function stop() {
    let action = "stop";
    const msg = JSON.stringify([action, 0]);
    window.mqtt.send(TOPICS[1],msg);
}

function stop_dalt() {
  let action = "stopdalt";
  const msg = JSON.stringify([action, 0]);
  window.mqtt.send(TOPICS[1],msg);
}

function stop_baix() {
  let action = "stopbaix";
  const msg = JSON.stringify([action, 0]);
  window.mqtt.send(TOPICS[1],msg);
}

function stop_raspy() {
  apaga= confirm("Desitja aturar el GIRONA 25?");
  if (apaga) {
    let action = "stopraspy";
    const msg = JSON.stringify([action, 0]);
    window.mqtt.send(TOPICS[1],msg);
    document.getElementById("stop").innerText = "⚠️";
  }
}

let Kp=0.5;
let Ki=0.001;
let error=0;
let output=0;
let integral=0;
let integral_prior=0;

let funciodepth;
let depth_hold_func= 1;
function start_hold(){
  depth_hold_func=1;
  let holdprof = prof;
  error=0;
  output=0;
  integral=0;
  integral_prior=0;
  funciodepth = setInterval(profun,100,holdprof);
}
function profun(holdprof){
  error= prof-holdprof;
  integral=  integral_prior + error;
  output=Kp*error+Ki*integral;
  integral_prior=integral;
  if (output>=0.5){
    output=0.5;
  }
  if (output<=-0.5){
    output=-0.5;
  }
  console.log(output);
  if (output>0){
    let action = "up";
    let speed = output * velocitat;
    const msg = JSON.stringify([action, speed, speed]);
    window.mqtt.send(TOPICS[1],msg); 
    console.log("puja");
  } else if(output<0){
    let action = "dwn";
    let speed = - output * velocitat;
    const msg = JSON.stringify([action, speed, speed]);
    window.mqtt.send(TOPICS[1],msg); 
    console.log("enfonsa");
  } else {
    console.log("aguanta");
    stop();
  }
}
/*function profun(holdprof){
if(holdprof <= (prof+0.05) && holdprof >= (prof-0.05)){
  console.log("aguanta");
  stop();
} else if (holdprof >= (prof+0.05)){
  //immerse();
  let action = "dwn";
  let speed = 0.1 * velocitat;
  const msg = JSON.stringify([action, speed, speed]);
  window.mqtt.send(TOPICS[1],msg); 
  console.log("enfonsa");
} else if (holdprof <= (prof-0.05)){
  //emegre();
  let action = "up";
  let speed = 0.1 * velocitat;
  const msg = JSON.stringify([action, speed, speed]);
  window.mqtt.send(TOPICS[1],msg); 
  console.log("puja");
}
}
*/
const vaclxant= 0;
const vaclyant= 0;
let amunt = 0;
let avall = 0;
let dreta = 0;
let esquerra = 0;
function handleMotion(event) {
  const aclx = event.acceleration.x;
  //document.getElementById('temp').innerHTML = aclx ;
  const acly = event.acceleration.y;
  //document.getElementById('deep').innerHTML = acly ;
  const aclz = event.acceleration.z;
  if (aclx >= 0.2 && vaclxant == 0 && esquerra == 0){
    turn_left();
    dreta = 1;
  } if (aclx <= -0.2 && dreta == 1){
    stop();
    dreta = 0;
  } if (aclx <= -0.2 && vaclxant == 0 && dreta == 0){
    turn_right();
    esquerra = 1;
  } if (aclx >= 0.2 && esquerra == 1){
    stop();
    esquerra = 0;
  } if (acly >= 0.2 && vaclyant == 0 && amunt == 0){
    emerge();
    avall = 1;
  } if (acly <= -0.2 && avall == 1){
    stop();
    avall = 0;
  } if (acly <= -0.2 && vaclyant == 0 && avall == 0){
    immerse();
    amunt = 1;
  } if (acly >= 0.2 && amunt == 1){
    stop();
    amunt = 0;
  }
  vaclxant=aclx;
  vaclyant=acly;
}
// Other actions
//Realitat virtual
function realitat(){
  let is_vr=document.getElementById("ulleres").following;
  let imgprin= document.getElementById("streaming");
  let imgdrt= document.getElementById("streaming1");
  let imgesq= document.getElementById("streaming2");
  if (!is_vr){
    document.getElementById("ulleres").following = true;
    button_toggle('ulleres', true);
    disable_controls_1();
    open_fullscreen();
    stream();
    imgprin.classList.add("hide");
    imgdrt.classList.remove("hide");
    imgesq.classList.remove("hide");
    window.addEventListener("devicemotion", handleMotion);
  }
  else {
    document.getElementById("ulleres").following = false;
    button_toggle('ulleres', false);
    enable_controls_1();
    //close_fullscreen();
    stream();
    imgprin.classList.remove("hide");
    imgdrt.classList.add("hide");
    imgesq.classList.add("hide");
    window.removeEventListener("devicemotion", handleMotion);
  }
}

// Autonomous mode
function follow() {
  let is_follow = document.getElementById("follow-button").following;
  if (!is_follow) {
    document.getElementById("follow-button").following = true;
    button_toggle('follow-button', true);
    disable_controls();
    window.mqtt.send(TOPICS[3], "start");
  }
  else {
    document.getElementById("follow-button").following = false;
    button_toggle('follow-button', false);
    enable_controls();
    window.mqtt.send(TOPICS[3], "stop");
  }
}

function light(){
  let lighton = document.getElementById("light-button").following;
  if (!lighton) {
    document.getElementById("light-button").following = true;
    button_toggle('light-button', true);
    window.mqtt.send(TOPICS[6], "on");
    document.getElementById("light-button").innerText = "💡";
  }
  else {
    document.getElementById("light-button").following = false;
    button_toggle('light-button', false);
    window.mqtt.send(TOPICS[6], "off");
    document.getElementById("light-button").innerText = "🔦";
  }
}
let velocitat = 0.5;
function velocity(){
  let velocitaton = document.getElementById("velocity-button").following;
  if (!velocitaton) {
    document.getElementById("velocity-button").following = true;
    button_toggle('velocity-button', true);
    velocitat = 1;
    document.getElementById("velocity-button").innerText = "V2";
  }
  else {
    document.getElementById("velocity-button").following = false;
    button_toggle('velocity-button', false);
    velocitat = 0.5;
    document.getElementById("velocity-button").innerText = "V1";
  }
}
function depth_hold(){
  let depthon = document.getElementById("hold-button").following;
  if (!depthon) {
    document.getElementById("hold-button").following = true;
    button_toggle('hold-button', true);
    document.getElementById("hold-button").innerText = "⚓️";
    start_hold();
  }
  else {
    document.getElementById("hold-button").following = false;
    button_toggle('hold-button', false);
    document.getElementById("hold-button").innerText = "🚢";
    clearInterval(funciodepth);
    funcio= null;
  }
}
function stream_video(){
  let videoon = document.getElementById("video-button").following;
  if (!videoon) {
    document.getElementById("video-button").following = true;
    button_toggle('video-button', true);
    document.getElementById("video-button").innerText = "📽️";
    start_video();
  }
  else {
    document.getElementById("video-button").following = false;
    button_toggle('video-button', false);
    document.getElementById("video-button").innerText = "🎥";
    stop_video();
  }
}
// Take a picture
function capture_photo() {
  window.mqtt.send(TOPICS[2], "capture");
}

// Finish
function Finish() {
  window.mqtt.send("Follow", "stop");
  window.mqtt.send("Stream", "pause");
}

// window.load = null;
window.onunload = Finish();
