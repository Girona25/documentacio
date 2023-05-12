// Uses globals window.host, window.TOPICS


var STREAM_PORT = 8090;
var RASPY_IP = "192.168.0.100";

function stream() {
  let elem = document.getElementById("streaming");
  let elem1 = document.getElementById("streaming1");
  let elem2 = document.getElementById("streaming2");
  let playing = !!elem.playing;
  if (playing) {
    elem.playing = false;
    elem.classList.remove("streaming-on");
    elem1.classList.remove("streaming-on");
    elem2.classList.remove("streaming-on");
    button_toggle('stream-button', false);
    elem.src = "images/stream_off.png";
    elem1.src = "images/stream_off.png";
    elem2.src = "images/stream_off.png";
    window.mqtt.send(window.TOPICS[4], "pause");
  }
  else {
    elem.playing = true;
    elem.retry = 100;
    elem1.retry = 100;
    elem2.retry = 100;
    elem.classList.add("streaming-on");
    elem1.classList.add("streaming-on");
    elem2.classList.add("streaming-on");
    button_toggle('stream-button', true);
    stream_refresh_img();
    window.mqtt.send(window.TOPICS[4], "play", () => {stream_refresh_img();});
  }
}

function stream_refresh_img() {
  let elem = document.getElementById("streaming");
  let elem1 = document.getElementById("streaming1");
  let elem2 = document.getElementById("streaming2");
  if (! elem.playing)
    return;
    elem.src = "http://"+RASPY_IP+":"+STREAM_PORT+"/?action=stream";
    elem1.src = "http://"+RASPY_IP+":"+STREAM_PORT+"/?action=stream";
    elem2.src = "http://"+RASPY_IP+":"+STREAM_PORT+"/?action=stream";
}

function stream_error() {
  let elem = document.getElementById('streaming');
  let elem1 = document.getElementById("streaming1");
  let elem2 = document.getElementById("streaming2");

  // Show nosignal image
  elem.src='images/nosignal_org.png';// treure _org per girar
  elem1.src='images/nosignal_org.png';
  elem2.src='images/nosignal_org.png';

  // Auto-retry in 2x time
  elem.retry = Math.min((elem.retry||100) * 2, 10000); // Up to 10s
  //elem1.src='images/nosignal.png';
  setTimeout(stream_refresh_img, elem.retry);
  //setTimeout(stream_refresh_img, elem1.retry);
}

function stream_screenshot() {
  let url = document.getElementById('streaming').src.replace('=stream', '=snapshot');
  download_image(url, (new Date()).toISOString()+'.jpg');
}

function download_image(src, name) {
  let a = document.createElement('a');
  a.style.position = 'fixed';
  a.style.top      = '-800px';
  a.style.left     = '-800px';
  a.href     = src;
  a.download = name;
  a.target   = '_blank';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); }, 2000);
}

const data = {
    capture: false,
    stream: null,
    buffer: [],
    iMediaRecorder: null,
}

async function start_video(){
  const displayMediaOptions = {	
    video: {	
      cursor: "never",
    },	
    audio: false	
  };
  try {
    data.buffer = [];
    data.stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    data.iMediaRecorder = new MediaRecorder(data.stream, { mimeType: 'video/webm;codecs=h264' });
    data.iMediaRecorder.start();
    data.iMediaRecorder.ondataavailable = function (e){
      data.buffer.push(e.data);
    }
    data.iMediaRecorder.onstop = function (){
      let blob = new Blob(data.buffer, {type: "video/webm"});
      data.buffer = [];
      download(blob);
    }
  } catch(err) {	
    console.log("Error: " + err);	
  }	
  function download (blob){
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "G25_video.mp4");
    link.style.display ="none";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
function stop_video(){
  data.iMediaRecorder.stop()
}