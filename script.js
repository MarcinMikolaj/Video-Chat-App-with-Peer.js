// Inputs
let usernameInput;
let destinationPeerIdInput;

// Buttons
let connectButton;
let endCallButton;

// Video
let localVideo;
let remoteVideo;

// Wrappers
let videoChatWrapper;
let joinWrapper;

// Variable
let username;
let currentCall;
let currentStream;
let destinationPeerId;
const peer = new Peer();

// Other
let assignedPeerId;

const prepareDOMElements = () => {
	// Inputs
	usernameInput = document.querySelector('.usernameInput');
	destinationPeerIdInput = document.querySelector('.destinationPeerIdInput');

	// Buttons
	connectButton = document.querySelector('.connect_button');
	endCallButton = document.querySelector('.end_call_button');

	// Video
	localVideo = document.querySelector('.local_video');
	remoteVideo = document.querySelector('.remote_video');

	// Wrappers
	videoChatWrapper = document.querySelector('.video_chat_wrapper');
	joinWrapper = document.querySelector('.join_wrapper');

	// Other
	assignedPeerId = document.querySelector('.assigned_peer_id');
};

const prepareDOMEvents = () => {
	connectButton.addEventListener('click', connect);
	endCallButton.addEventListener('click', disconnect);
};

const main = () => {
	prepareDOMElements();
	prepareDOMEvents();
	clear();
};

const clear = () => {
	usernameInput.value = '';
	destinationPeerIdInput.value = '';
};

async function connect() {
	username = usernameInput.value;
	destinationPeerId = destinationPeerIdInput.value;

	console.log(`username: ${username}`);
	console.log(`Connect with peer id: ${destinationPeerId}`);

	joinWrapper.style.display = 'none';
	videoChatWrapper.style.display = 'flex';

	const stream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: true,
	});

	currentStream = stream;

	localVideo.srcObject = stream;
	localVideo.play();

	// Start call
	const call = peer.call(destinationPeerId, stream);
	currentCall = call;

	call.on('stream', (stream) => {
		remoteVideo.srcObject = stream;
		remoteVideo.play();
	});
	call.on('error', (err) => console.log(err));
	call.on('close', () => disconnect);
}

const disconnect = () => {
	currentStream.getTracks().forEach(function (track) {
		track.stop();
	});

	if (!currentCall) {
		return;
	}

	try {
		currentCall.close();
	} catch {}
	{
		currentCall = undefined;
	}

	joinWrapper.style.display = 'flex';
	videoChatWrapper.style.display = 'none';
};

// Emited when a connection to the PeerServer is established.
peer.on('open', (id) => {
	assignedPeerId.textContent = id;
	localVideo.srcObject = null;
});

// Response on call from remote peer
peer.on('call', (call) => {
	if (confirm(`Accept call from ${call.peer}`)) {
		navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: true,
			})
			.then((stream) => {
				localVideo.srcObject = stream;
				localVideo.play();

				currentStream = stream;
				currentCall = call;

				call.answer(stream);

				joinWrapper.style.display = 'none';
				videoChatWrapper.style.display = 'flex';

				call.on('stream', (stream) => {
					remoteVideo.srcObject = stream;
					remoteVideo.play();
				});
			})
			.catch((err) => console.log(err));
	} else {
		console.log('Call rejected');
	}
});

document.addEventListener('DOMContentLoaded', main);
