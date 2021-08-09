// const wrtc = require('electron-webrtc')(); 
const Peer = require('simple-peer');

const iceConfiguration = {};
iceConfiguration.iceServers = [];
//turn server
iceConfiguration.iceServers.push({
  // new coturn STUN/TURN
  urls: 'turn:104.153.154.109',
  username: 'teamswell',
  credential: 'cohortla44',
  credentialType: 'password',
});
//stun  server
iceConfiguration.iceServers.push(
  {
    urls: 'stun:stun1.l.google.com:19302',
  },
  {
    urls: 'stun:104.153.154.109',
  }
);
const localConnection = new RTCPeerConnection();
const p = new Peer({
  initiator: location.hash === '#1',
  trickle: false
});
// iceConfiguration.iceServers.forEach((el) => localConnection.addIceCandidate = el);
const iceCandidate = new RTCIceCandidate({
  candidate: 'candidate:974499033 1 udp 41885439 104.153.154.109 63969 typ relay',
  sdpMid: null,
  sdpMLineIndex: null,
});
localConnection.addIceCandidate(iceCandidate);

const webrtcControllerTwo = {
  createLocalConnection() {
    // listen for ICE candiates.  Each time a candidate is added to the list, re-log the whole SDP
    localConnection.onicecandidate = (event) => {
      if (
        event &&
        event.target &&
        event.target.iceGatheringState === 'complete'
      ) {
        console.log(
          'done gathering candidates - got iceGatheringState complete'
        );
      } else if (event && event.candidate == null) {
        console.log('done gathering candidates - got null candidate');
      } else {
        console.log(
          event.target.iceGatheringState,
          event,
          localConnection.localDescription
        );
        console.log('corresponding SDP for above ICE candidate in JSON:');
        console.log(JSON.stringify(localConnection.localDescription));
      }
    };
    return localConnection;
  },
  async createLocalOffer() {
    const offer = await localConnection.createOffer();
    await localConnection.setLocalDescription(offer);
    console.log("offer set successfully");
    return await [localConnection, JSON.stringify(offer)];
  },
  // on our local connection, create a data channel and pass it the name "chatRoom1"
  // const dataChannel = localConnection.createDataChannel("chatRoom1");
  // // when the channel is openned ...
  // dataChannel.onopen = event => console.log("Connection opened!");
  // // when the channel is closed ...
  // dataChannel.onclose = event => console.log("Connection closed! Goodbye (^-^)");
  // // when message received...
  // dataChannel.onmessage = event => console.log("PeerB: " + event.data);
};

export { webrtcControllerTwo };
