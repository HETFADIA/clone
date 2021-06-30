let username="Anon"
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
let usersCount=0
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030' //443 for deploy 3030 for local
})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  

  socket.on('user-connected', userId => {

    connectToNewUser(userId, stream)
  })

  let text = $("input");

  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val(),username);
      text.val('')
    }
  });
  socket.on("createMessage", (message,username) => {
    var currTime=currentTime();
    console.log(currTime)
    $("ul").append(`<li class="message"><b>${username}</b> ${currTime}<br/>${message}</li>`);
    scrollToBottom()
  })
})
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
myPeer.on('call', function(call){
  getUserMedia({video: true, audio: true}, function(stream){
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', function(remoteStream){
        addVideoStream(video, remoteStream);
      })
  },function(err){
      console.log('Failed to get local stream' ,err);
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  
  call.on('stream', userVideoStream => {

    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {

    video.remove()
    usersCount=document.getElementById("video-grid").childElementCount;
  scrollVideos(usersCount);
  })

  peers[userId] = call
}
function scrollVideos(number){

  if(number>4){
    document.getElementsByClassName("main__videos")[0].style.overflowY="scroll";
  }
  else{
    document.getElementsByClassName("main__videos")[0].style.overflowY="hidden";
  }
}
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  
  videoGrid.append(video)
  usersCount=document.getElementById("video-grid").childElementCount;
  scrollVideos(usersCount);

  
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

function currentTime(){
  var today = new Date();
  var hrs=today.getHours();
  var min=today.getMinutes();
  var delay=" AM"

  if(hrs>12){
      hrs-=12
      delay=" PM"
  }
  if(hrs<10){
      hrs='0'+hrs;
  }
  if(min<10){
      min='0'+min;
  }
  return hrs+":"+min+delay;
}
function EnterMeet(){
  document.body.style.backgroundColor="white";
  document.getElementById("login").style.display="none"
  document.getElementById("meet").style.display="block"
}